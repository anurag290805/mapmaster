#!/usr/bin/env python3
"""Apply the attested Japan CP05 component reassignment to comparison geometry.

This validation helper moves only whole, pre-existing Natural Earth candidate
polygons. It never reads MLIT coordinates: the MLIT N03 evidence is carried in
the candidate manifest and identifies the owner of the six source-attested
components. The input candidate GeoJSON is retained for metric continuity; its
components are matched one-to-one to the pinned Natural Earth source polygons
before movement.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import shapefile
from shapely.geometry import MultiPolygon, mapping, shape


EXPECTED_ARCHIVE_SHA256 = "efc59726337323058f9446210adc96673179cd344e053666ee3d28cb58ba2b05"
# The existing metric fixture has already been topology-preservingly simplified.
# A source part must therefore be uniquely identifiable, not byte-identical. The
# observed lowest source-to-metric component IoU is recorded with the output.
MINIMUM_COMPONENT_MATCH_IOU = 0.8


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def polygon_parts(geometry):
    return [geometry] if geometry.geom_type == "Polygon" else list(geometry.geoms)


def source_feature(source: Path, source_id: str):
    reader = shapefile.Reader(str(source))
    fields = [field[0] for field in reader.fields[1:]]
    matches = []
    for shape_record in reader.iterShapeRecords():
        record = dict(zip(fields, shape_record.record))
        if record.get("adm1_code") == source_id:
            matches.append((record, shape(shape_record.shape.__geo_interface__)))
    if len(matches) != 1:
        raise ValueError(f"Expected one Natural Earth source feature for {source_id}, got {len(matches)}")
    return matches[0]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--candidate", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    if sha256(args.source) != EXPECTED_ARCHIVE_SHA256:
        raise ValueError("Unexpected Natural Earth source checksum")
    manifest = json.loads(args.manifest.read_text())
    correction = manifest["scopes"]["japan"]["component_reallocation"]
    if correction["algorithm"] != "exact Natural Earth polygon WKB SHA-256 reassignment; no authority geometry is copied":
        raise ValueError("Unexpected Japan component-reallocation algorithm")

    collection = json.loads(args.candidate.read_text())
    features = collection.get("features", [])
    from_key, to_key = correction["from"]["question_key"], correction["to"]["question_key"]
    from_feature = next((item for item in features if item.get("properties", {}).get("question_key") == from_key), None)
    to_feature = next((item for item in features if item.get("properties", {}).get("question_key") == to_key), None)
    if not from_feature or not to_feature:
        raise ValueError("Candidate GeoJSON is missing an attested Japan source or target")
    if from_feature["properties"].get("source_id") != correction["from"]["source_id"] or to_feature["properties"].get("source_id") != correction["to"]["source_id"]:
        raise ValueError("Candidate GeoJSON source identities do not match the reassignment attestation")

    _, source_geometry = source_feature(args.source, correction["from"]["source_id"])
    source_parts = {hashlib.sha256(part.wkb).hexdigest(): part for part in polygon_parts(source_geometry)}
    component_hashes = correction["components"]
    if len(source_parts) != len(polygon_parts(source_geometry)) or set(component_hashes) - set(source_parts):
        raise ValueError("Attested source component hashes did not reproduce")

    candidate_parts = polygon_parts(shape(from_feature["geometry"]))
    selected_indices, component_match_ious = [], []
    for component_hash in component_hashes:
        source_part = source_parts[component_hash]
        matches = sorted(
            (
                (source_part.intersection(candidate_part).area / source_part.union(candidate_part).area, index)
                for index, candidate_part in enumerate(candidate_parts)
            ),
            reverse=True,
        )
        score, index = matches[0]
        if score < MINIMUM_COMPONENT_MATCH_IOU or index in selected_indices or matches[1][0] > 0:
            raise ValueError(f"Could not uniquely match attested component {component_hash} to the candidate")
        selected_indices.append(index)
        component_match_ious.append(score)

    transferred = [candidate_parts[index] for index in selected_indices]
    retained = [part for index, part in enumerate(candidate_parts) if index not in selected_indices]
    target_parts = polygon_parts(shape(to_feature["geometry"]))
    from_feature["geometry"] = mapping(MultiPolygon(retained))
    to_feature["geometry"] = mapping(MultiPolygon(target_parts + transferred))
    for feature, field in ((from_feature, "removed_source_component_wkb_sha256"), (to_feature, "added_source_component_wkb_sha256")):
        feature["properties"][field] = component_hashes
        feature["properties"]["source_component_match_iou"] = component_match_ious
        if not shape(feature["geometry"]).is_valid:
            raise ValueError("Component reassignment created invalid candidate geometry")
    args.output.write_text(json.dumps(collection, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()

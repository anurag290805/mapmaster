#!/usr/bin/env python3
"""Measure two explicitly supplied Admin-1 GeoJSON collections.

This is a validation-only utility.  It neither derives candidate SVG paths nor
decides whether a particular IoU is acceptable: source age, datum, resolution,
coastline treatment, and any contested-boundary policy remain review inputs.
Both input collections must already use the same geographic CRS.
"""

from __future__ import annotations

import argparse
import json
import math
import unicodedata
from pathlib import Path

from shapely.geometry import shape
from shapely.ops import unary_union


def normalise(value: str) -> str:
    """Compare authority identifiers without discarding non-Latin scripts."""
    decomposed = unicodedata.normalize("NFKD", value)
    return "".join(
        character
        for character in decomposed.lower()
        if not unicodedata.combining(character) and character.isalnum()
    )


def parts_count(geometry) -> int:
    return len(geometry.geoms) if geometry.geom_type == "MultiPolygon" else 1


def identity(properties: dict, name: str) -> dict:
    """Keep the mapped identity evidence without serialising all source fields."""
    result = {"name": name}
    for field in ("key", "question_key", "source_id", "N03_001", "N03_007"):
        value = properties.get(field)
        if isinstance(value, (str, list)) and value:
            result[field] = value
    return result


def validation(properties: dict) -> dict:
    """Carry derivation-stage evidence into the comparison record when present."""
    fields = (
        "raw_union_valid",
        "post_union_simplification_valid",
        "comparison_geometry_valid",
        "empty_or_invalid_sources_after_simplification",
        "source_administrative_ids",
        "raw_union_area",
        "comparison_area",
        "comparison_area_delta_vs_raw_union",
        "comparison_area_difference_vs_raw_union",
        "raw_union_multipart_parts",
        "post_union_simplification_multipart_parts",
        "comparison_multipart_parts",
    )
    return {field: properties[field] for field in fields if field in properties}


def read_groups(path: Path, field: str) -> dict[str, tuple[str, object, dict]]:
    collection = json.loads(path.read_text())
    if collection.get("type") != "FeatureCollection":
        raise ValueError(f"{path}: expected a GeoJSON FeatureCollection")
    groups: dict[str, tuple[str, list[object], list[dict]]] = {}
    for feature in collection.get("features", []):
        properties = feature.get("properties") or {}
        name = properties.get(field)
        geometry = feature.get("geometry")
        if not isinstance(name, str) or not name.strip() or geometry is None:
            continue
        key = normalise(name)
        if key not in groups:
            groups[key] = (name, [], [])
        groups[key][1].append(shape(geometry))
        groups[key][2].append(properties)
    # Most authority inputs are already one dissolved feature per unit.  Avoid
    # rebuilding a multi-thousand-part geometry in that common case; doing so
    # is needlessly expensive and does not change the validation geometry.
    return {
        key: (
            name,
            geometries[0] if len(geometries) == 1 else unary_union(geometries),
            {
                "feature_count": len(geometries),
                "multipart_parts": sum(parts_count(geometry) for geometry in geometries),
                "identity": identity(properties[0], name),
                "validation": validation(properties[0]),
            },
        )
        for key, (name, geometries, properties) in groups.items()
    }


def finite(value: float | None):
    return value if value is not None and math.isfinite(value) else None


def compare(candidate_name: str, candidate, candidate_metadata: dict, reference_name: str, reference, reference_metadata: dict) -> dict:
    intersection = candidate.intersection(reference).area
    union = candidate.union(reference).area
    candidate_area = candidate.area
    reference_area = reference.area
    return {
        "name": candidate_name,
        "reference_name": reference_name,
        "candidate_valid": candidate.is_valid,
        "reference_valid": reference.is_valid,
        "candidate_geometry_type": candidate.geom_type,
        "reference_geometry_type": reference.geom_type,
        "candidate_feature_count": candidate_metadata["feature_count"],
        "reference_feature_count": reference_metadata["feature_count"],
        "candidate_multipart_parts": parts_count(candidate),
        "reference_multipart_parts": parts_count(reference),
        "candidate_source_multipart_parts": candidate_metadata["multipart_parts"],
        "reference_source_multipart_parts": reference_metadata["multipart_parts"],
        "candidate_identity": candidate_metadata["identity"],
        "reference_identity": reference_metadata["identity"],
        "candidate_validation": candidate_metadata["validation"],
        "reference_validation": reference_metadata["validation"],
        "candidate_area": finite(candidate_area),
        "reference_area": finite(reference_area),
        "intersection_area": finite(intersection),
        "union_area": finite(union),
        "intersection_over_union": finite(intersection / union) if union else None,
        "candidate_coverage_of_reference": finite(intersection / reference_area)
        if reference_area
        else None,
        "reference_coverage_of_candidate": finite(intersection / candidate_area)
        if candidate_area
        else None,
        "relative_area_difference_vs_reference": finite(
            (candidate_area - reference_area) / reference_area
        )
        if reference_area
        else None,
        "hausdorff_distance_in_input_crs_units": finite(candidate.hausdorff_distance(reference)),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--candidate", required=True, type=Path)
    parser.add_argument("--reference", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--candidate-name-field", default="name")
    parser.add_argument("--reference-name-field", default="name")
    args = parser.parse_args()

    candidates = read_groups(args.candidate, args.candidate_name_field)
    references = read_groups(args.reference, args.reference_name_field)
    candidate_keys = set(candidates)
    reference_keys = set(references)
    comparisons = [
        compare(
            candidates[key][0],
            candidates[key][1],
            candidates[key][2],
            references[key][0],
            references[key][1],
            references[key][2],
        )
        for key in sorted(candidate_keys & reference_keys)
    ]
    result = {
        "schema_version": 1,
        "input_crs_requirement": "candidate and reference must already share a geographic CRS",
        "candidate": str(args.candidate),
        "reference": str(args.reference),
        "comparisons": comparisons,
        "missing_from_reference": [candidates[key][0] for key in sorted(candidate_keys - reference_keys)],
        "missing_from_candidate": [references[key][0] for key in sorted(reference_keys - candidate_keys)],
        "summary": {
            "compared": len(comparisons),
            "missing_candidate": len(reference_keys - candidate_keys),
            "missing_reference": len(candidate_keys - reference_keys),
            "invalid_candidate": sum(not item["candidate_valid"] for item in comparisons),
            "invalid_reference": sum(not item["reference_valid"] for item in comparisons),
        },
        "acceptance_note": "Metrics require source-vintage, resolution, coastline, and policy review; this utility intentionally has no automatic numeric pass threshold.",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()

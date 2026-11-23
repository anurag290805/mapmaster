#!/usr/bin/env python3
"""Generate isolated CP05 Admin-1 SVG candidates from a pinned Natural Earth ZIP.

This tool deliberately cannot write into ``svg/``.  It proves source coverage and
topology for the six named gameplay scopes, and emits non-production candidates
under ``candidate/admin1`` for subsequent visual and interaction review.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import unicodedata
from datetime import date
from pathlib import Path

import shapefile
from shapely import make_valid
from shapely.geometry import MultiPolygon, Polygon, shape


EXPECTED_ARCHIVE_SHA256 = "efc59726337323058f9446210adc96673179cd344e053666ee3d28cb58ba2b05"
SOURCE_URL = "https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_admin_1_states_provinces.zip"
SOURCE_VERSION = "5.1.1"
SOURCE_COUNTRIES = {
    "australia": "AU",
    "brazil": "BR",
    "canada": "CA",
    "germany": "DE",
    "japan": "JP",
    "usa": "US",
}
# Natural Earth stores these two state components as separate Admin-1 records.
# Their memberships are independently documented by the NSW and Tasmanian
# authorities; they remain part of the existing eight-question game scope.
QUESTION_COMPONENTS = {
    "australia": {
        "New South Wales": ["Lord Howe Island"],
        "Tasmania": ["Macquarie Island"],
    }
}
BRAZIL_GOIAS_REPAIR = {
    "source_id": "BRA-1294",
    "algorithm": "GEOS MakeValid 3.14.1, exact-source attested",
    "source_wkb_sha256": "443c7a659614b2527a55f1fc8d255c61951a895eff31727690f95612b82782eb",
    "repaired_wkb_sha256": "b446c1231187a5c4bc944df91aafa02b447e0b74db151476fbe7b9b83050a7c6",
    "removed_source_ring_coordinate_indices_0_based": [264, 348],
    "added_coordinates": 0,
    "area_delta_square_degrees": 7.105427357601002e-15,
    "independent_validation": {
        "dataset": "IBGE GO_UF_2024",
        "sha256": "32556057bbbbe00fbe8555a9241544de7e776239ef2c3a4caa47bb6f5286bca6",
        "geometry_valid": True,
        "intersection_over_union": 0.9740752215706935,
    },
}
JAPAN_COMPONENT_REALLOCATION = {
    "algorithm": "exact Natural Earth polygon WKB SHA-256 reassignment; no authority geometry is copied",
    "authority": {
        "dataset": "MLIT National Land Numerical Information N03 administrative areas",
        "version": "2024",
        "sha256": "a03111be0fe726ff270cbc1dd16f38bc926cf814e67c8cd2e52157629d138b98",
        "owner_n03_001": "鹿児島県",
        "owner_n03_007": "46000",
        "excluded_n03_001": "沖縄県",
        "excluded_n03_007": "47000",
    },
    "from": {"question_key": "japan:032", "source_id": "JPN-3502"},
    "to": {"question_key": "japan:018", "source_id": "JPN-3501"},
    "components": [
        "77cef780b3b31304a939f7b3e935d6600a6580569d767e5c3b0b59f009b40f7d",
        "d1db188558eaf25c419ee93f6a797cb5724fc3c37861dd9f0a07cbee0ef9b58e",
        "d1da7a5f8b1cbe6e450b84a7d1a23abe9344523fb50ccdf7ce269b4655d880a1",
        "c98e1cc1e25991b9b2bdd73e447847a5cadf87045c34368bd08d7dc69f75a853",
        "d1fa40e7eb9183a72062370055837cbd599c5a405c519261e751eb0289f7e811",
        "57f756470b7b5a060bf80a7791062deae3fc87564ec479d25a8b3f2fb0260460",
    ],
}


def normalized(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    return re.sub(r"[^a-z0-9]", "", "".join(ch for ch in decomposed if not unicodedata.combining(ch)).lower())


def source_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def fmt(number: float) -> str:
    return f"{number:.3f}".rstrip("0").rstrip(".")


def ring_path(coords, transform) -> str:
    commands = []
    for index, (longitude, latitude) in enumerate(coords):
        x, y = transform(longitude, latitude)
        commands.append(("M" if index == 0 else "L") + fmt(x) + " " + fmt(y))
    return "".join(commands) + "Z"


def polygon_paths(geometry, transform):
    polygons = [geometry] if isinstance(geometry, Polygon) else list(geometry.geoms)
    return ["".join([ring_path(polygon.exterior.coords, transform)] + [ring_path(ring.coords, transform) for ring in polygon.interiors]) for polygon in polygons]


def build_svg(scope: str, mappings, geometry_sets) -> tuple[str, int]:
    geometries = [geometry for geometry_set in geometry_sets for geometry in geometry_set]
    min_x = min(geometry.bounds[0] for geometry in geometries)
    min_y = min(geometry.bounds[1] for geometry in geometries)
    max_x = max(geometry.bounds[2] for geometry in geometries)
    max_y = max(geometry.bounds[3] for geometry in geometries)
    padding = 25
    span_x, span_y = max_x - min_x, max_y - min_y
    scale = min((1000 - 2 * padding) / span_x, (700 - 2 * padding) / span_y)
    offset_x = (1000 - span_x * scale) / 2 - min_x * scale
    offset_y = (700 - span_y * scale) / 2 + max_y * scale

    def transform(longitude, latitude):
        return longitude * scale + offset_x, -latitude * scale + offset_y

    groups = []
    rendered_polygons = 0
    for mapping, geometry_set in zip(mappings, geometry_sets):
        paths = [path for geometry in geometry_set for path in polygon_paths(geometry, transform)]
        rendered_polygons += len(paths)
        paths_markup = "".join(
            f'<path id="{html.escape(mapping["dom_id"])}-part-{index + 1}" d="{path}"/>'
            for index, path in enumerate(paths)
        )
        groups.append(
            f'<g id="{html.escape(mapping["dom_id"])}" data-question-key="{html.escape(mapping["question_key"])}" '
            f'data-source-id="{html.escape(mapping["source_id"])}" role="button" tabindex="0" '
            f'aria-label="{html.escape(mapping["display_name"])}">{paths_markup}</g>'
        )
    svg = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<!-- CP05 non-production candidate. Generated only from the pinned Natural Earth archive. -->\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" role="img" aria-label="{html.escape(scope)} administrative candidate" '
        'data-cp05-status="candidate-not-live"><style>path{fill:#dce8ef;stroke:#4c6374;stroke-width:.75;vector-effect:non-scaling-stroke}</style>'
        + "".join(groups)
        + "</svg>\n"
    )
    return svg, rendered_polygons


def feature_lookup(reader):
    field_names = [field[0] for field in reader.fields[1:]]
    result = {code: [] for code in SOURCE_COUNTRIES.values()}
    for shape_record in reader.iterShapeRecords():
        record = dict(zip(field_names, shape_record.record))
        country = record["iso_a2"]
        if country not in result:
            continue
        geometry = shape(shape_record.shape.__geo_interface__)
        result[country].append((record, geometry))
    return result


def find_feature(features, display_name):
    wanted = normalized(display_name)
    primary_matches = [
        (record, geometry)
        for record, geometry in features
        if wanted == normalized(record.get("name", ""))
    ]
    matches = primary_matches or [
        (record, geometry)
        for record, geometry in features
        if wanted == normalized(record.get("name_en", ""))
    ]
    if len(matches) != 1:
        candidates = [record.get("name") for record, _ in matches]
        raise ValueError(f"{display_name}: expected exactly one Natural Earth feature, found {candidates}")
    return matches[0]


def japan_reallocated_components(features):
    """Return the pinned Natural Earth Amami parts after hash-attested selection."""
    record, geometry = find_feature(features, "Okinawa")
    if record["adm1_code"] != JAPAN_COMPONENT_REALLOCATION["from"]["source_id"]:
        raise ValueError("Japan reassignment source feature no longer matches its attestation")
    if geometry.geom_type != "MultiPolygon":
        raise ValueError("Japan reassignment source is no longer a MultiPolygon")
    expected = JAPAN_COMPONENT_REALLOCATION["components"]
    by_hash = {hashlib.sha256(polygon.wkb).hexdigest(): polygon for polygon in geometry.geoms}
    if len(by_hash) != len(geometry.geoms) or set(expected) - set(by_hash):
        raise ValueError("Japan reassignment component attestation did not reproduce")
    return record, [by_hash[component_hash] for component_hash in expected]


def without_reallocated_components(geometry):
    expected = set(JAPAN_COMPONENT_REALLOCATION["components"])
    remaining = [
        polygon
        for polygon in geometry.geoms
        if hashlib.sha256(polygon.wkb).hexdigest() not in expected
    ]
    if len(remaining) + len(expected) != len(geometry.geoms):
        raise ValueError("Japan reassignment would remove an unattested source component")
    return MultiPolygon(remaining)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, type=Path, help="Pinned ne_10m_admin_1_states_provinces ZIP")
    parser.add_argument("--requirements", type=Path, default=Path("docs/engineering/CP05_GEO_REQUIREMENTS.json"))
    parser.add_argument("--output", type=Path, default=Path("candidate/admin1"))
    args = parser.parse_args()

    archive_hash = source_sha256(args.source)
    if archive_hash != EXPECTED_ARCHIVE_SHA256:
        raise ValueError(f"Unexpected source checksum: {archive_hash}")

    requirements = json.loads(args.requirements.read_text())
    requested = {item["scope"]: item for item in requirements["scopes"] if item["scope"] in SOURCE_COUNTRIES}
    if set(requested) != set(SOURCE_COUNTRIES):
        raise ValueError("CP05 requirements do not contain exactly the approved six scopes")

    source_features = feature_lookup(shapefile.Reader(str(args.source)))
    args.output.mkdir(parents=True, exist_ok=True)
    scopes = {}
    for scope, country_code in SOURCE_COUNTRIES.items():
        questions = requested[scope]["questions"]
        mappings, geometry_sets, blockers, selected_ids, repair = [], [], [], set(), None
        japan_transfer_record, japan_transfer_polygons = (
            japan_reallocated_components(source_features[country_code])
            if scope == "japan"
            else (None, [])
        )
        for question in questions:
            record, geometry = find_feature(source_features[country_code], question["display_name"])
            components = [(record, geometry)]
            if scope == "japan" and question["question_key"] == JAPAN_COMPONENT_REALLOCATION["from"]["question_key"]:
                components = [(record, without_reallocated_components(geometry))]
            if scope == "japan" and question["question_key"] == JAPAN_COMPONENT_REALLOCATION["to"]["question_key"]:
                if record["adm1_code"] != JAPAN_COMPONENT_REALLOCATION["to"]["source_id"]:
                    raise ValueError("Japan reassignment target feature no longer matches its attestation")
                components.append((japan_transfer_record, MultiPolygon(japan_transfer_polygons)))
            for component_name in QUESTION_COMPONENTS.get(scope, {}).get(question["display_name"], []):
                components.append(find_feature(source_features[country_code], component_name))
            rendered_components = []
            for component_record, component_geometry in components:
                rendered_geometry = component_geometry
                if not component_geometry.is_valid:
                    if scope != "brazil" or component_record["adm1_code"] != BRAZIL_GOIAS_REPAIR["source_id"]:
                        blockers.append(f'Natural Earth source topology is invalid for {component_record["name"]} ({component_record["adm1_code"]}); no repair was applied.')
                    else:
                        source_hash = hashlib.sha256(component_geometry.wkb).hexdigest()
                        if source_hash != BRAZIL_GOIAS_REPAIR["source_wkb_sha256"]:
                            raise ValueError("Goiás source geometry does not match the attested repair input")
                        rendered_geometry = make_valid(component_geometry)
                        repaired_hash = hashlib.sha256(rendered_geometry.wkb).hexdigest()
                        if (
                            rendered_geometry.geom_type != "Polygon"
                            or not rendered_geometry.is_valid
                            or repaired_hash != BRAZIL_GOIAS_REPAIR["repaired_wkb_sha256"]
                            or abs(rendered_geometry.area - component_geometry.area - BRAZIL_GOIAS_REPAIR["area_delta_square_degrees"]) > 1e-12
                        ):
                            raise ValueError("Goiás repair attestation did not reproduce")
                        repair = BRAZIL_GOIAS_REPAIR
                rendered_components.append((component_record, rendered_geometry))
            mapping = {
                "question_key": question["question_key"],
                "display_name": question["display_name"],
                "source_name": record["name"],
                "source_name_en": record["name_en"],
                "source_id": record["adm1_code"],
                "source_iso_3166_2": record["iso_3166_2"],
                "source_geometry_valid": all(component_geometry.is_valid for _, component_geometry in components),
                "rendered_geometry_valid": all(component_geometry.is_valid for _, component_geometry in rendered_components),
                "source_geometry_type": geometry.geom_type,
                "source_polygon_count": sum(
                    len(component_geometry.geoms) if component_geometry.geom_type == "MultiPolygon" else 1
                    for _, component_geometry in components
                ),
                "matching_method": "diacritic-insensitive exact comparison against Natural Earth name or name_en",
                "dom_id": "cp05-" + scope + "-" + re.sub(r"[^a-z0-9]+", "-", record["adm1_code"].lower()).strip("-"),
                "source_components": [
                    {
                        "source_name": component_record["name"],
                        "source_id": component_record["adm1_code"],
                        "source_iso_3166_2": component_record["iso_3166_2"],
                        "source_geometry_valid": bool(component_geometry.is_valid),
                    }
                    for component_record, component_geometry in components
                ],
            }
            if scope == "japan" and question["question_key"] == JAPAN_COMPONENT_REALLOCATION["to"]["question_key"]:
                mapping["source_components"][-1].update(
                    {
                        "component_reallocation_from_question_key": JAPAN_COMPONENT_REALLOCATION["from"]["question_key"],
                        "component_wkb_sha256": JAPAN_COMPONENT_REALLOCATION["components"],
                    }
                )
            if scope == "japan" and question["question_key"] == JAPAN_COMPONENT_REALLOCATION["from"]["question_key"]:
                mapping["removed_source_components"] = [
                    {
                        "reallocated_to_question_key": JAPAN_COMPONENT_REALLOCATION["to"]["question_key"],
                        "reallocated_to_source_id": JAPAN_COMPONENT_REALLOCATION["to"]["source_id"],
                        "component_wkb_sha256": JAPAN_COMPONENT_REALLOCATION["components"],
                    }
                ]
            mappings.append(mapping)
            geometry_sets.append([component_geometry for _, component_geometry in rendered_components])
            for component_record, component_geometry in components:
                selected_ids.add(component_record["adm1_code"])

        entry = {
            "question_count": len(questions),
            "selected_source_feature_count": len(selected_ids),
            "live_approved": False,
            "mappings": mappings,
            "excluded_source_features": [],
            "blockers": blockers,
            "repair": repair,
        }
        if scope == "japan":
            entry["component_reallocation"] = JAPAN_COMPONENT_REALLOCATION
        entry["excluded_source_features"] = [
            {"source_name": record["name"], "source_id": record["adm1_code"], "reason": "not a configured MapMaster question"}
            for record, _ in source_features[country_code]
            if record["adm1_code"] not in selected_ids
        ]
        if blockers:
            entry.update({"status": "blocked_source_topology", "asset": None, "asset_sha256": None, "rendered_polygon_count": 0})
        else:
            svg, polygon_count = build_svg(scope, mappings, geometry_sets)
            asset_path = args.output / f"{scope}.svg"
            asset_path.write_text(svg)
            entry.update(
                {
                    "status": "candidate_ready_for_manual_geometry_and_interaction_review",
                    "asset": str(asset_path.as_posix()),
                    "asset_sha256": hashlib.sha256(svg.encode()).hexdigest(),
                    "rendered_polygon_count": polygon_count,
                    "rendering": {"projection": "affine longitude-latitude fit", "view_box": "0 0 1000 700", "geometry_simplification": "none"},
                }
            )
        scopes[scope] = entry

    manifest = {
        "schema_version": 1,
        "status": "candidate_not_live",
        "generated_on": date.today().isoformat(),
        "source": {
            "dataset": "Natural Earth Admin 1 – States, Provinces",
            "version": SOURCE_VERSION,
            "url": SOURCE_URL,
            "sha256": archive_hash,
            "license": "Public domain",
            "terms_url": "https://www.naturalearthdata.com/about/terms-of-use/",
            "attribution_required": False,
            "attribution": "Natural Earth data (public domain); attribution optional",
        },
        "independent_reference_policy": "Official country statistical or geographic authority references are recorded in CP05_RELEASE_BLOCKER_TRIAGE.md; their administrative lists validate scope membership only, not Natural Earth boundary equivalence.",
        "non_production_notice": "These candidates are not registered in js/data.js or svg/. They cannot clear CP05, remove the public-beta guard, or replace quarantined legacy assets without separate visual, reachability, policy, and founder acceptance.",
        "scopes": scopes,
    }
    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()

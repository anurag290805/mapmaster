#!/usr/bin/env python3
"""Dissolve pinned MLIT N03 municipal geometry to 47 validation prefectures.

This creates comparison input only.  It does not generate or alter candidate
SVG assets. Geometry is simplified only on each source municipal feature before
the prefectural union; the raw union and the historical post-union
simplification are retained as diagnostics. The pinned source archive remains
the provenance record.
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

import shapefile
from shapely.geometry import mapping, shape
from shapely.ops import unary_union


def parts_count(geometry) -> int:
    return len(geometry.geoms) if geometry.geom_type == "MultiPolygon" else 1


def relative_area_difference(left, right) -> float | None:
    if not right.area:
        return None
    return (left.area - right.area) / right.area


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--tolerance", type=float, default=0.005)
    args = parser.parse_args()

    reader = shapefile.Reader(str(args.source))
    fields = [field[0] for field in reader.fields[1:]]
    prefecture_index = fields.index("N03_001")
    raw_groups = defaultdict(list)
    simplified_groups = defaultdict(list)
    administrative_ids = defaultdict(set)
    invalid_source = 0
    source_records = 0
    for item in reader.iterShapeRecords():
        source_records += 1
        geometry = shape(item.shape.__geo_interface__)
        invalid_source += not geometry.is_valid
        prefecture = item.record[prefecture_index]
        simplified = geometry.simplify(args.tolerance, preserve_topology=True)
        raw_groups[prefecture].append(geometry)
        simplified_groups[prefecture].append(simplified)
        administrative_ids[prefecture].add(item.record[fields.index("N03_007")])

    features = []
    for prefecture in sorted(raw_groups):
        raw_union = unary_union(raw_groups[prefecture])
        post_union_simplification = raw_union.simplify(
            args.tolerance, preserve_topology=True
        )
        geometry = unary_union(simplified_groups[prefecture])
        invalid_or_empty_simplified_sources = sum(
            geometry.is_empty or not geometry.is_valid
            for geometry in simplified_groups[prefecture]
        )
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "key": prefecture,
                    "N03_001": prefecture,
                    "N03_007": sorted(administrative_ids[prefecture]),
                    "source_parts": len(raw_groups[prefecture]),
                    "source_administrative_ids": len(administrative_ids[prefecture]),
                    "raw_union_valid": raw_union.is_valid,
                    "post_union_simplification_valid": post_union_simplification.is_valid,
                    "comparison_geometry_valid": geometry.is_valid,
                    "empty_or_invalid_sources_after_simplification": invalid_or_empty_simplified_sources,
                    "raw_union_area": raw_union.area,
                    "comparison_area": geometry.area,
                    "comparison_area_delta_vs_raw_union": geometry.area - raw_union.area,
                    "comparison_area_difference_vs_raw_union": relative_area_difference(
                        geometry, raw_union
                    ),
                    "raw_union_multipart_parts": parts_count(raw_union),
                    "post_union_simplification_multipart_parts": parts_count(
                        post_union_simplification
                    ),
                    "comparison_multipart_parts": parts_count(geometry),
                    "geometry_type": geometry.geom_type,
                    "multipart_parts": parts_count(geometry),
                },
                "geometry": mapping(geometry),
            }
        )

    result = {
        "type": "FeatureCollection",
        "properties": {
            "purpose": "CP05 validation only; never candidate SVG generation",
            "source_records": source_records,
            "source_invalid_records": invalid_source,
            "prefecture_field": "N03_001",
            "simplification_tolerance_degrees": args.tolerance,
            "method": "simplify each municipal geometry before union by N03_001; retain raw-union and post-union-simplification diagnostics",
        },
        "features": features,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False) + "\n")
    print(
        json.dumps(
            {
                "source_records": source_records,
                "source_invalid_records": invalid_source,
                "prefectures": len(features),
                "output": str(args.output),
            }
        )
    )


if __name__ == "__main__":
    main()

# External geography corpus — licensing and attribution audit

This is a technical provenance and attribution audit, not legal advice or legal clearance. All records remain candidate-only and excluded from production use.

| Source | Retained corpus material | Source terms evidence | Operational requirement before any use | Unresolved issue |
|---|---|---|---|---|
| Wikidata | Structured QID claims, values, qualifiers, raw SPARQL response and query URL. | [Wikidata licensing](https://www.wikidata.org/wiki/Wikidata:Licensing) says structured data is CC0; [data access](https://www.wikidata.org/wiki/Help:Data_access) says attribution is not required but welcomed. | Keep QIDs, retrieval date, query, and source URL for provenance; display a voluntary “Data from Wikidata” acknowledgement in any future credits. | CC0 itself does not clear any separate rights in copied non-structured text, media, trademarks, or third-party sources. This corpus does not copy them. |
| GeoNames | Detail responses, geonameId, names/alternates, class/code, country code, coordinates, request URL and raw checksum. | Manifest records CC BY 4.0; [Creative Commons deed](https://creativecommons.org/licenses/by/4.0/) specifies attribution, license link and modification indication requirements. | Attribute “GeoNames, CC BY 4.0” with `https://www.geonames.org/`, retain source IDs, identify transformations/normalization, and preserve attribution in any redistribution. | Confirm final presentation, attribution placement, and whether a selected subset plus adaptations needs additional notice wording with counsel/content owner. |
| Open Trivia DB | Exact decoded question, answers/choices, source fingerprint, batch metadata, raw response and source URL. | Manifest records CC BY-SA 4.0 and [OpenTDB API configuration](https://opentdb.com/api_config.php) is retained as provider evidence; [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) defines attribution, change indication and ShareAlike conditions. | Keep OpenTDB origin and fingerprint visible in editorial records; before public distribution, assess whether edited question pools are Adapted Material and provide compatible CC BY-SA attribution/license/share-alike handling. | ShareAlike and redistribution treatment of a compiled mixed-license gameplay pool is unresolved. Do not merge OpenTDB text into proprietary/public app content without legal review. |

## Attribution-ready notices (not activation)

- **Wikidata:** “Country data source: Wikidata (CC0), with retained QID and retrieval provenance.”
- **GeoNames:** “Geographic feature data: GeoNames, CC BY 4.0 — https://www.geonames.org/.”
- **Open Trivia DB:** “Question source: Open Trivia DB, CC BY-SA 4.0 — https://opentdb.com/; modified/curated status stated where applicable.”

## License gate

No review disposition overrides a license. A future individual promotion must satisfy the source-specific notice above, policy decision(s), factual/editorial approval, CP04/CP05/CP10 isolation checks, and the separate product release gate. In particular, no OpenTDB record may be considered legally cleared merely because it is factual or technically accepted.

// Additive, frozen editorial evidence extracted from the already-pinned Factbook revision.
// This does not alter the v1 elevation projection or retrieve data at runtime.

export const FACTBOOK_EDITORIAL_EVIDENCE_V2 = Object.freeze({
  id: "factbook-editorial-evidence.v2",
  upstream_organization: "Central Intelligence Agency (The World Factbook)",
  distribution: "factbook/factbook.json public-domain preservation",
  distribution_revision: "144d6977b2b01ac1cbd220de754c0a005616760b",
  retrieved_at: "2026-11-10",
  retrieval_url:
    "https://github.com/factbook/factbook.json/tree/144d6977b2b01ac1cbd220de754c0a005616760b",
  source_license:
    "CIA World Factbook source data is public domain; the preservation repository dedicates its data and scripts to the public domain.",
  attribution_requirement:
    "No legal attribution requirement stated by the source; retain provenance internally and credit CIA in public research materials.",
  temporal_note:
    "CIA announced the World Factbook sunset on 2026-02-04. These are frozen historical source fields and are used only for stable physical-geography review.",
});

export const FACTBOOK_EDITORIAL_EVIDENCE_RECORDS_V2 = Object.freeze(
  [
    [
      "Bahamas",
      "bf",
      "central-america-n-caribbean/bf.json",
      "Geography.Terrain.text",
      "long, flat coral formations with some low rounded hills",
      "sha256:a5cc01fad936324e1e260eeb4b693a5325d296925e43cada3fbbee9e20f73b3c",
    ],
    [
      "Benin",
      "bn",
      "africa/bn.json",
      "Geography.Terrain.text",
      "mostly flat to undulating plain; some hills and low mountains",
      "sha256:63cc654fbfd7e930901c835a17623883f426e9986b5bd4d536cf01aefb468654",
    ],
    [
      "Burundi",
      "by",
      "africa/by.json",
      "Geography.Terrain.text",
      "hilly and mountainous, dropping to a plateau in east, some plains",
      "sha256:6d003da4307ae25f2e828f914541b0370d2bd38de72e3368a7a70460b46b86c1",
    ],
    [
      "China",
      "ch",
      "east-n-southeast-asia/ch.json",
      "Geography.Terrain.text",
      "mostly mountains, high plateaus, deserts in west; plains, deltas, and hills in east",
      "sha256:937df906e86b20716a2082af998c4f6eedb91ddabd81ca8601e8d4f8c33d994f",
    ],
    [
      "Congo",
      "cf",
      "africa/cf.json",
      "Geography.Terrain.text",
      "coastal plain, southern basin, central plateau, northern basin",
      "sha256:4efca24894ab6aeadf04820a86fbe1059cac658073c7b72467e5d16cf8236acb",
    ],
    [
      "Denmark",
      "da",
      "europe/da.json",
      "Geography.Elevation.highest point.text",
      "Store Mollehoj 171 m",
      "sha256:800a70899941f6d8869cf8a2216c50f73d86d39bfd7a9c051e685daedbf770fa",
    ],
    [
      "Gambia",
      "ga",
      "africa/ga.json",
      "Geography.Terrain.text",
      "flood plain of the Gambia River flanked by some low hills",
      "sha256:98be13a642fb7fe9c4ae279e9b8e7e22527394aec899f69381950cc4e6a3c24b",
    ],
    [
      "Kiribati",
      "kr",
      "australia-oceania/kr.json",
      "Geography.Terrain.text",
      "mostly low-lying coral atolls surrounded by extensive reefs",
      "sha256:24e25015d0c0b7a9a1225eb01b12e13ff4619496371970307d18a94e8bb8fbfe",
    ],
    [
      "Kuwait",
      "ku",
      "middle-east/ku.json",
      "Geography.Terrain.text",
      "flat to slightly undulating desert plain",
      "sha256:243b2d98c8e4923252c8004a9a81430356fbf01c67e81b3ea74f5d72ce84fe9a",
    ],
    [
      "Maldives",
      "mv",
      "south-asia/mv.json",
      "Geography.Terrain.text",
      "flat coral atolls, with white sandy beaches; sits atop the submarine volcanic Chagos-Laccadive Ridge",
      "sha256:554412a3af937eb37fb86760857d2d6dda7ca0cb78c8d127b89d06fc4dea923a",
    ],
    [
      "Marshall Islands",
      "rm",
      "australia-oceania/rm.json",
      "Geography.Terrain.text",
      "low coral limestone and sand islands",
      "sha256:97ef2a18baaabf9f926ecf8d4716c3c209cd0053c5ab867723a3a65a87bc9909",
    ],
    [
      "Micronesia",
      "fm",
      "australia-oceania/fm.json",
      "Geography.Terrain.text",
      "islands vary geologically from high mountainous islands to low, coral atolls; volcanic outcroppings on Pohnpei, Kosrae, and Chuuk",
      "sha256:e9c09d0cf6a71c4a44619e04f3a3ebd99af5af461bec6107a386d05fbd7cc76a",
    ],
    [
      "Senegal",
      "sg",
      "africa/sg.json",
      "Geography.Terrain.text",
      "generally low, rolling, plains rising to foothills in southeast",
      "sha256:0b7a6facf830435baffbde7757330721776d5b8291445c555a47613828821395",
    ],
    [
      "Tuvalu",
      "tv",
      "australia-oceania/tv.json",
      "Geography.Terrain.text",
      "low-lying and narrow coral atolls",
      "sha256:c21b4d0a513c7c3a175e0a14952b89729a76da5d2219b911bbe36aadf75f3877",
    ],
  ].map(
    ([
      country,
      source_code,
      source_path,
      source_field,
      direct_evidence,
      source_evidence_hash,
    ]) =>
      Object.freeze({
        country,
        source_code,
        source_path,
        source_field,
        direct_evidence,
        source_evidence_hash,
        source_url: `https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/${source_path}`,
      }),
  ),
);

const EVIDENCE_BY_COUNTRY = new Map(
  FACTBOOK_EDITORIAL_EVIDENCE_RECORDS_V2.map((record) => [
    record.country,
    record,
  ]),
);

export function factbookEditorialEvidenceForCountry(country) {
  return EVIDENCE_BY_COUNTRY.get(country) || null;
}

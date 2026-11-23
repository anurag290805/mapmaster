# Country Facts — Final Editorial Resolution v2

**Status:** candidate-only editorial overlay; no founder, gameplay, or production approval is granted by this document.

## Outcome

| Classification | Records | Meaning |
| --- | ---: | --- |
| Ready for founder consideration | 166 | 155 carried forward without alteration, plus 11 now have clear, stable player-facing physical-geography wording. |
| Needs review | 28 | 25 existing CP05/entity or scope policy holds, plus 3 editorial-quality holds. |
| Rejected | 0 | No record was rejected or promoted in this resolution. |
| Founder approved / gameplay approved / production eligible | 0 / 0 / 0 | These remain independent, unchanged states. |

## 1. Gambia source-identity correction

The apparent missing profile was a **derived lookup error**, not a gap in the pinned corpus. MapMaster's canonical display label is `Gambia`; the frozen Factbook index names the same profile `The Gambia` and assigns the legacy GEC/FIPS identifier `ga`, whose profile is [`africa/ga.json`](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/africa/ga.json). The old exact-label mapper therefore missed the record. No v1 snapshot, Wikidata claim, or prior review record was changed.

The additive v2 evidence points to `Geography.Terrain.text`: “flood plain of the Gambia River flanked by some low hills” (field hash `sha256:98be13a642fb7fe9c4ae279e9b8e7e22527394aec899f69381950cc4e6a3c24b`). It supports the new candidate sentence: **“The Gambia River's flood plain is flanked by some low hills.”** This is deliberately a terrain fact, not a replacement alias for the frozen P206 Atlantic Ocean claim.

## 2. Editorial holds resolved with pinned, exact evidence

The following 11 entries move from editorial hold to `READY_FOR_FOUNDER_REVIEW`. Each remains founder-pending, gameplay-blocked, and production-ineligible.

| Canonical ID | Proposed player-facing fact | Exact frozen source field |
| --- | --- | --- |
| `mapmaster:country:bahamas` | The Bahamas is made up of long, flat coral formations with some low rounded hills. | [`bf.json` — Terrain](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/central-america-n-caribbean/bf.json) |
| `mapmaster:country:burundi` | Burundi is hilly and mountainous, dropping to a plateau in the east, with some plains. | [`by.json` — Terrain](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/africa/by.json) |
| `mapmaster:country:china` | China's west has mountains, high plateaus, and deserts, while plains, deltas, and hills characterize the east. | [`ch.json` — Terrain](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/east-n-southeast-asia/ch.json) |
| `mapmaster:country:congo` | Congo's terrain includes a coastal plain, southern and northern basins, and a central plateau. | [`cf.json` — Terrain](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/africa/cf.json) |
| `mapmaster:country:denmark` | Store Mollehoj is Denmark's highest point at 171 m. | [`da.json` — Elevation.highest point](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/europe/da.json) |
| `mapmaster:country:gambia` | The Gambia River's flood plain is flanked by some low hills. | [`ga.json` — Terrain](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/africa/ga.json) |
| `mapmaster:country:kiribati` | Kiribati consists mostly of low-lying coral atolls surrounded by extensive reefs. | [`kr.json` — Terrain](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/australia-oceania/kr.json) |
| `mapmaster:country:maldives` | The Maldives consists of flat coral atolls with white sandy beaches. | [`mv.json` — Terrain](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/south-asia/mv.json) |
| `mapmaster:country:marshall-islands` | The Marshall Islands are low coral limestone and sand islands. | [`rm.json` — Terrain](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/australia-oceania/rm.json) |
| `mapmaster:country:micronesia` | Micronesia's islands range from high mountainous islands to low coral atolls, with volcanic outcrops on Pohnpei, Kosrae, and Chuuk. | [`fm.json` — Terrain](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/australia-oceania/fm.json) |
| `mapmaster:country:tuvalu` | Tuvalu consists of low-lying, narrow coral atolls. | [`tv.json` — Terrain](https://github.com/factbook/factbook.json/blob/144d6977b2b01ac1cbd220de754c0a005616760b/australia-oceania/tv.json) |

The three remaining editorial holds are **Benin**, **Kuwait**, and **Senegal**. Their available pinned terrain strings are accurate but generic, while their elevation strings name no reliable player-facing feature. They remain held rather than being rewritten with unsupported “interesting” facts.

## 3. Palestine outcome

The evidence review did not combine West Bank and Gaza profiles and did not use the frozen Mount Nabi Yunis record as a country-level competitive claim. The [Palestinian Central Bureau of Statistics](https://www.pcbs.gov.ps/en/post-details/?postId=20309) independently states: “State of Palestine is characterized by a great variation in topography and climate.” That exact neutral statement is retained as a candidate-only learning fact with provenance hash `sha256:98764bfde4f013e8e7d5a5be787b2332e47178e2e868450129d39f9cbb8faae6`.

`mapmaster:country:palestine` remains `NEEDS_REVIEW`: the evidence supports the wording, but CP05's existing entity and territorial-scope gate is not resolved here. It is not eligible for a competitive, map-scored, or production use.

## 4. Audit of the 47 frozen-Wikidata / Factbook differences

The audit did not convert any pair into an alias merely to increase a match count.

- **27 name-format, transliteration, translation, or historical-name variations:** Afghanistan, Bahrain, Burkina Faso, Cambodia, Cameroon, Congo, Djibouti, Ethiopia, Laos, Latvia, Lebanon, Malawi, Mexico, North Korea, Philippines, Portugal, Russia, Sierra Leone, South Korea, Suriname, Taiwan, Tanzania, Tonga, Turkmenistan, United States, Uzbekistan, and Vietnam. The source strings do not create a factual contradiction; their identity relationship is still preserved as unasserted rather than normalized into a new alias.
- **6 unnamed or insufficiently named independent fields:** Bahamas, Benin, Burundi, Kuwait, Maldives, and Tuvalu. These do not contradict the frozen feature; the independent field is simply not specific enough to prove a feature identity.
- **14 genuinely different named features, scope alternatives, or unresolved high-point selections:** Australia, Botswana, Colombia, Guinea, Guinea-Bissau, Israel, Luxembourg, Micronesia, Qatar, Saudi Arabia, Senegal, Serbia, Sudan, and United Arab Emirates. Neither source is silently overwritten; the comparison remains unresolved. The Israel, Serbia, and United Arab Emirates entries are also covered by existing conservative policy treatment where applicable.

The 47 count is therefore an audit queue, not a count of 47 demonstrated errors. No new source contradiction was established merely from differing labels.

## 5. Factbook lifecycle and attribution

CIA announced that the World Factbook had sunset on 4 February 2026. The v2 overlay treats the pinned revision only as dated, locally frozen historical evidence for stable physical geography; it does not use it for changing political, population, or boundary facts. CIA’s site policy asks users who copy material to cite the Agency and retain any photo credits/bylines. The internal candidate evidence keeps both the upstream CIA attribution and preservation-repository provenance. See the CIA’s [sunset announcement](https://www.cia.gov/stories/story/spotlighting-the-world-factbook-as-we-bid-a-fond-farewell/) and [site policy](https://www.cia.gov/site-policies/).

## Founder action required

The 155 unchanged exact country/fact/source pairs remain in [FOUNDER_APPROVAL_CHECKLIST.v4.md](FOUNDER_APPROVAL_CHECKLIST.v4.md). The 11 additional exact pairs are listed above. A founder must explicitly decide each claim or a clearly defined reviewed subset before any state can advance. The 25 policy holds and three editorial holds must remain excluded from production until their separate blockers are cleared.

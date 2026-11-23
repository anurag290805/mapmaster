# CP05 Admin-1 visual-review package

`index.html` is a local, review-only viewer for the six pinned Natural Earth
Admin-1 candidate SVGs. It reads `../manifest.json` and the existing candidate
files only; it neither loads the game nor adds a map to `svg/`, `js/data.js`,
or any production build.

Serve the repository on localhost and open
`/candidate/admin1/review/index.html`. Opening it directly as `file:` prevents
the browser from reading the manifest. The viewer highlights the selected
MapMaster question target, produces a target zoom, exposes the exact question
key and Natural Earth source ID, and links the independently recorded national
authority for the reviewer.

Starred targets are the required visual-review set:

| Country   | Targets                                              | Reason                                                                |
| --------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| Australia | ACT; New South Wales; Tasmania                       | tiny ACT; Lord Howe and Macquarie retained inside their state targets |
| Brazil    | Goiás                                                | exact-source-attested repair; compare with IBGE 2024                  |
| Canada    | British Columbia; Newfoundland and Labrador; Nunavut | high multipart/island count                                           |
| Germany   | Bremen; Schleswig-Holstein                           | small/multipart Länder                                                |
| Japan     | Kagoshima; Okinawa; Tokyo                            | island/multipart prefectures                                          |
| USA       | Alaska; Hawaii; Maine                                | islands and multipart state geometry                                  |

This package does **not** overlay a national-authority coordinate dataset,
declare coordinate equivalence, replace the pinned source, or clear CP05. The
reviewer must record meaningful coastline/border or scope discrepancies in the
acceptance report before any separate promotion decision.

### Local comparison overlays

The viewer can overlay a locally selected candidate GeoJSON (name field
`name`) and authority GeoJSON. Both remain local to the browser: the viewer
does not upload, persist, bundle, or redistribute either source. This permits
side-by-side examination of the source-pinned comparison work without adding
authority geometry to a production or candidate asset. Set the authority-name
field to the source's actual field (ABS `state_name_2021`, Statistics Canada
`PRENAME`, and Census `NAME` in the pinned comparisons).

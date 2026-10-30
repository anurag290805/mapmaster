# CP01 baseline comparison and provenance

Audit consolidation: 2026-10-31. The candidate is a **selected development candidate**, not a production-ready product baseline. The audited directory has no Git metadata; its relationship to GitHub history is unknown. File timestamps or similarities do not prove chronology or authorship.

## Sources

- Clean remote checkout: `main`, `e161914d3dfe4883282d4140c85ec9d017a05a2f`, `https://github.com/anurag290805/mapmaster.git`.
- Audited extraction: `/Users/Anurag/Desktop/MapMaster`.
- Archive: `/Users/Anurag/Desktop/Anurag/Projects/MapMaster.zip`; SHA-256 `107ceaf4a10d9c38027912b8240f3a7ead9f0928e07306cf5065031dda8d9fd4`. The 56 archive files were compared by SHA-256 to the extraction: 54 non-`.DS_Store` files and the SVG `.DS_Store` matched; only root `.DS_Store` differed.
- Candidate: `/private/tmp/mapmaster-cp01-candidate`, branch `anurag/mapmaster-cp01-audit`, based on the remote SHA. At the time of comparison the branch had no new commit; the checkpoint commit is in the durable workspace Git history.

## Changed files over remote

Each value is SHA-256. These eight audited versions were copied over their counterparts in the candidate only.

| Path | Remote SHA-256 | Audited SHA-256 |
|---|---|---|
| `css/game.css` | `cc0d607a106594eb156aea2184a49a526b873c916d7693c070d485d3a79785d8` | `5423317a2d8b44f9762edbbf169b39254317aeaa2e72fa2fb0d487c243635ef7` |
| `index.html` | `883fbd5eb179b94c7ccbdcea53bb55766e11bc796033aadbd34b5e9847b0112b` | `0523a6f0a98075f3a2404922a5efc5fc093c418553b0070284049a71d7743e26` |
| `js/data.js` | `4dee5c8c7456edc481a7811b39d5351208b323810306801a0ed7aeb1f254dcf0` | `41b4a7f720903daedc27b10d7058bade89b93054a99d69c98f0db518de196cfe` |
| `js/events.js` | `3399e685c87c257c7762c46ae57dcad96a96fa491b148162c4b98224f3ddaaa5` | `6269245053ec18eb4bd714b51fbba50733ca2048542d9de885f450f4404f4b07` |
| `js/game.js` | `028262942f4becc4125b5af75f3e8d6233618a00361f7b15ec0fe990f9317425` | `95067db268539aed1001e57a8554eff9e977b04665498df6ba68ca8354273a98` |
| `js/modes.js` | `12f249d95d02d11a48c92af9544c5241616a93a7877a038144c7a5243c168c6b` | `82eacb007849e35675a1264814cd981a33ab66bbd964987b02e45c3c0d902128` |
| `js/ui.js` | `852072b5de303c2700f22b3bbe47079f0a27cef6197e4ca33f265167315f0136` | `2b9c8546e71c7c7ba06769e8cd155aab6a6dfca0dae6e8164f0adcae0b2f6597` |
| `svg/north_america.svg` | `d3671e411530eae2698f47fb7509387bcf516a79ed361fa558d23ac3678a65f3` | `f960e218c5f7ce1224c5ebd04a1edb39d8d23cbfce925b86d3f537ddf92afd69` |

## Added and absent files

- Audited-only `Readme.txt`: SHA-256 `dfdbc474cc604f618236e3106e294b8a1af5eb2e78960071d03518576509e65b`; copied into candidate.
- Remote-only `LICENSE`, `README.md`, `svg/svg`: absent from audited extraction, retained from remote in candidate; none deleted. Their remote SHA-256 values follow.
  - `LICENSE`: `07c625512279259314d26c3797a35dca753685516848095dc00c280f94f54c70`
  - `README.md`: `4d0750ae018ef3482ef624121fd001e109b7f4266c26de19bf801f3400b4f710`
  - `svg/svg`: `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b`
- 45 common substantive application files match byte for byte. `.DS_Store` and Git metadata were excluded from the cross-tree application comparison; both `.DS_Store` files are excluded from candidate copying.
- Added in candidate: the ten previously created CP01 documents in `docs/`, two audit tools in `tools/`, and this comparison document. The existing documents are updated for consolidation.
- No application files were removed from the candidate. The remote-only files retained in the candidate are not evidence that they existed in the archive.

## Uncertainty and release

README licensing assertions and upstream MIT notice do not establish ownership or rights for all differences or third-party assets. The source origin and chronology of differing application files remain unverified. See [asset provenance](ASSET_PROVENANCE.md). This comparison does not imply approval, a new commit, or production readiness.

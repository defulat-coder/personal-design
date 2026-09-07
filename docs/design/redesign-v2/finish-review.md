## verdict

Scoring pass of the three material findings from the full review (`disposition: fix`). The original findings are retained below with their final status. The ten named post-fix captures were reopened at their existing paths; all show their claimed content, with no visible video loading overlay. Current PRODUCT.md, DESIGN.md, both AGENTS.md files, design.json, the surface brief and rules.md adopted-state text were inspected for the documentation finding.

1. **Resolved — video playback below the initial viewport.** The desktop, tablet and dark entry captures now show the complete native playback bar, scrubber and media toolbar without scrolling. The tablet video remains a useful roughly 408px square; desktop remains roughly 540px square. Mobile retains its full-width video with controls. The lower information captures still show source and JSON controls in the natural document flow. The original concern was hidden playback, and the visible result resolves that concern rather than merely moving a container.
2. **Resolved — stale product/design persistence.** PRODUCT.md now explicitly overrides the old timeline constraint and makes the homepage the product menu. DESIGN.md describes static grids, direct detail navigation, open information sections and video-only remaining-viewport sizing. Root/web AGENTS, design.json, the surface brief and rules.md adopted-state prose agree. Historical UI/report references are identified as superseded rather than treated as current requirements.
3. **Resolved — standalone 404 eyebrow.** Desktop, tablet and mobile 404 recaptures now lead directly with “找不到这个页面”, followed by the explanation and return-home action. The banned above-heading status label is absent.

No material regression introduced by this fix batch is visible in the reviewed recaptures.

## remaining

Clear. This ship disposition covers the three scored fixes, not a new review of the whole surface. The preceding full review found the broader composition and navigation coherent and did not request a rebuild; this scoring pass does not imply user approval or independently rerun behavioral tests.

disposition: ship

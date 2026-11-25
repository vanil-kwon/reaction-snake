# Release testing checklist

This checklist complements the automated checks in `scripts/validate-release.js`. It is intentionally manual where real device/browser behavior matters.

## Desktop
- [ ] Start, pause, resume, restart and game-over flow.
- [ ] Classic: food, wall collision, self collision and tail-vacating move.
- [ ] Reflex: wait for cue, dodge, verify reaction milliseconds, score bonus, missed-cue life loss and saved personal best.
- [ ] Survival: lose a life, verify safe respawn, obstacle placement and win condition.
- [ ] Precision: target timeout, three misses and 15-point completion.
- [ ] Daily: same layout for the same local date; 25-point completion.
- [ ] Keyboard arrows/WASD; Space/P pause; typing in controls does not steer.
- [ ] Sound/music toggles, language, theme, reduced effects, skins and achievements.
- [ ] Refresh during/after a run and verify local save/settings behavior.

## Mobile and tablet
- [ ] Portrait and landscape layouts.
- [ ] D-pad buttons, swipe steering, pause button and pointer cancellation.
- [ ] Safe-area insets and no horizontal page overflow.
- [ ] Repeated taps/swipes do not queue invalid reverse turns.

## Offline and install
- [ ] Load once online and wait for the Service Worker to activate.
- [ ] Reload with network disabled.
- [ ] Open the installed app offline.
- [ ] Verify the local SVG app icon and cached game assets.
- [ ] Confirm the app does not make game-analytics requests.

## Automated CI
- [ ] JavaScript syntax and release invariant validation pass.
- [ ] GitHub Pages deployment completes successfully.

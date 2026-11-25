# Reaction Snake

An offline-first neon Snake arcade game focused on quick reactions, precise controls and lightweight performance.

**Play:** https://vanil-kwon.github.io/reaction-snake/  
**Languages:** English · Русский · Deutsch

[Русская документация](README.ru.md) · [Deutsche Dokumentation](README.de.md)

## Release 1.0.0

The first public release of the offline-first game. Progress is stored locally in the browser; there is no account, game server, in-game purchase system or game analytics.

## Features
- Five modes: Classic, Reflex, Survival, Precision and Daily.
- 16 cosmetic snake skins, 40 achievements (including hidden ones) and a paced local coin economy.
- Reaction-time display, score tracking and personal records.
- Sound effects and procedural background music using the Web Audio API.
- Dark and light themes, independent sound/music controls and reduced visual effects.
- Responsive touch controls and keyboard input.
- Installable web app support and offline caching through a service worker.
- English, Russian and German interface translations.
- Local saves: progress and settings stay in the browser on the current device.

## Game modes

| Mode | How it plays |
| --- | --- |
| Classic | Standard Snake rules. Avoid the walls and your own tail. |
| Reflex | Keep steering the snake. When the red danger cue appears, turn before five movement ticks pass. The game measures each reaction, shows the run average and personal best, awards more points for faster dodges, and costs a life for a missed cue (with a 1,000 ms penalty in the average). |
| Survival | Three lives; hazards appear as your score grows. Reach 20 points to win. |
| Precision | Hit 15 targets. Each target expires after 4.2 seconds; three misses end the run. |
| Daily | A daily seeded challenge. Reach 25 points to complete it. |

## Coins and progression

- Earn 1 coin for each food orb collected.
- Mode completion bonuses: Reflex 8, Survival 12, Precision 10 coins; Daily gives 20 coins once per local day.
- Achievements grant additional one-time rewards.
- Skin prices range from 45 to 940 coins. Skins are cosmetic only and do not increase gameplay power.
- Coins and unlocks stay on the current device. There are no purchases, ads or pay-to-win upgrades.

## Controls
- **Touch:** swipe in the direction you want to move.
- **Keyboard:** Arrow keys or WASD.
- **Pause:** Space or P.

## Languages

Open **Settings → Language** and choose English, Русский or Deutsch. The interface language is stored locally and applied immediately. The game is designed to remain usable offline after its files have been cached.

## Performance and privacy

- The game uses the HTML Canvas 2D API and requestAnimationFrame.
- Visual effects can be reduced in Settings for devices where lower rendering overhead is preferred.
- No game analytics or external analytics service is included.
- Scores, coins, skins, achievements and preferences are stored locally in browser storage. Clearing site data can erase this progress.
- The game does not require an account or a game server.

## Run locally

Because the game uses a service worker, test it through a local HTTP server rather than opening the HTML file directly.

    python -m http.server 8000

Then open http://localhost:8000/site/ in your browser.

## Project structure

    site/
      index.html
      manifest.json
      service-worker.js
    .github/workflows/deploy.yml
    README.md
    README.ru.md
    README.de.md

GitHub Pages deploys the contents of site/.

## Development notes

The game is a client-side project built with HTML, CSS and vanilla JavaScript. It has no runtime framework or external JavaScript dependency. Changes should preserve offline support, local save compatibility, responsive controls and low rendering overhead.

## License

No license is currently specified. Unless a license is added to this repository, do not assume the code is available for unrestricted reuse.
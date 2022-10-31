# Safari Extension: Enhanced Tooltips for Showdown
A Safari Addon that enhances the tooltips on [Pokemon Showdown](http://play.pokemonshowdown.com/)  by displaying additional information:

- Type weaknesses and respective multipliers
- Move type and category (physical or special) icons
- Move base power
- Click Pokemon name to open their Smogon page in a new tab
- Height and weight
- Damage calculator, courtesy of [Showdex](https://github.com/doshidak/showdex)
- Base stats

Additionally, this includes the very useful functionality from [Pokémon Showdown Randbats Tooltip](https://www.smogon.com/forums/threads/pokémon-showdown-randbats-tooltip.3686306/).

### Installation
Available for iPhone, iPad and Mac.

[![Download on the App Store](screenshots/download-on-the-app-store.svg)](https://apps.apple.com/de/app/enhanced-tooltips-for-showdown/id1612964050?l=en)

### Contributing
Bug reports and pull requests are welcome!  If you'd like to request a feature, please open an issue.  This project is intended to be a safe, welcoming space for collaboration.

### This code is so messy!
This repository incorporates code from multiple plugins:
- [Showdex](https://github.com/doshidak/showdex)
  - Provides the damage calculator
  - Responsible for most of the code and structure in this repository
- [Enhanced Tooltips](https://github.com/rowin1/Pokemon-Showdown-Enhanced-Tooltips)
  - Provides type weaknesses, move details, etc.
  - Responsible for `src/{index.js, chrome, css, firefox, icons}`
    - `index.js` is loaded by `src/main.ts`
- [Randbats Tooltips](https://addons.mozilla.org/en-US/firefox/addon/pkmn-randbats-tooltip/)
  - Provides information about randbat sets
  - Responsible for `src/index-randbats.js`
      - `index-randbats.js` is loaded by `src/main.ts`

### Local Development

```bash
yarn install && yarn build:chrome
```

This will create a `dist/` folder. The XCode project in `src/safari` references files from the dist folder and can then be used to build the Safari extension. After that, make sure to configure Safari to allow unsigned extensions and enable the extension in Safari's preferences.

### Special Thanks
Special thanks to [Karl Hughes](https://github.com/karllhughes), [rowin1](https://github.com/rowin1/Pokemon-Showdown-Enhanced-Tooltips), pkmn.cc, doshidak and any other developers of Showdex.

### License
GNU AGPL (as required by Showdex)
# Safari Extension: Enhanced Tooltips for Showdown
A Safari Addon that enhances the tooltips on [Pokemon Showdown](http://play.pokemonshowdown.com/)  by displaying additional information:

- Type weaknesses and respective multipliers
- Move type and category (physical or special) icons
- Move base power
- Click Pokemon name to open their Smogon page in a new tab
- Height and weight

Optional settings (right click the extension icon and toggle the setting!):
- Base stats

Additionally, this includes the very useful functionality from [Pokémon Showdown Randbats Tooltip](https://www.smogon.com/forums/threads/pokémon-showdown-randbats-tooltip.3686306/).

### Installation
Available for iPhone, iPad and Mac.
[![Download on the App Store](screenshots/download-on-the-app-store.svg)](https://apps.apple.com/de/app/enhanced-tooltips-for-showdown/id1612964050?l=en)

### Contributing
Bug reports and pull requests are welcome!  If you'd like to request a feature, please open an issue.  This project is intended to be a safe, welcoming space for collaboration.

### Local Development
The code for this plugin can be found in `./src`.

- `index.js` - The primary codebase for this plugin
- `icons` - Icon image files
- `css` - Custom styles
- `chrome` - Chrome-specific Javascript and manifest.json files
- `firefox` - Firefox-specific Javascript and manifest.json files

To build and test this code locally:

```bash
npm install
npm run build
```

This will create a `dist/` folder with a `chrome/` and `firefox/` folder. The XCode project in `src/safari` references files from the dist folder and can then be used to build the Safari extension. After that, make sure to configure Safari to allow unsigned extensions and enable the extension in Safari's preferences.

### Special Thanks
Special thanks to [Karl Hughes](https://github.com/karllhughes), [rowin1](https://github.com/rowin1/Pokemon-Showdown-Enhanced-Tooltips) and pkmn.cc.

### License
This plugin and code is distributed under the [MIT license](https://opensource.org/licenses/MIT).

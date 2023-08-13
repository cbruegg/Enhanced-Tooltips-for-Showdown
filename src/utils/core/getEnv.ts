import { createEnvParser } from './createEnvParser';

export const env = createEnvParser({
  BUILD_DATE: process.env.BUILD_DATE,
  BUILD_NAME: process.env.BUILD_NAME,
  BUILD_SUFFIX: process.env.BUILD_SUFFIX,
  BUILD_TARGET: process.env.BUILD_TARGET,

  CALCDEX_DEFAULT_GEN: process.env.CALCDEX_DEFAULT_GEN,
  CALCDEX_PLAYER_MIN_POKEMON: process.env.CALCDEX_PLAYER_MIN_POKEMON,
  CALCDEX_POKEMON_MAX_LEGAL_EVS: process.env.CALCDEX_POKEMON_MAX_LEGAL_EVS,

  HELLODEX_BUGS_URL: process.env.HELLODEX_BUGS_URL,
  HELLODEX_COMMUNITY_URL: process.env.HELLODEX_COMMUNITY_URL,
  HELLODEX_DONATION_URL: process.env.HELLODEX_DONATION_URL,
  HELLODEX_ENABLED: process.env.HELLODEX_ENABLED,
  HELLODEX_FEATURES_URL: process.env.HELLODEX_FEATURES_URL,
  HELLODEX_FORUM_URL: process.env.HELLODEX_FORUM_URL,
  HELLODEX_PATRONAGE_URL: process.env.HELLODEX_PATRONAGE_URL,
  HELLODEX_RELEASES_URL: process.env.HELLODEX_RELEASES_URL,
  HELLODEX_REPO_URL: process.env.HELLODEX_REPO_URL,

  NODE_ENV: process.env.NODE_ENV,

  PACKAGE_AUTHOR_EMAIL: process.env.PACKAGE_AUTHOR_EMAIL,
  PACKAGE_AUTHOR_NAME: process.env.PACKAGE_AUTHOR_NAME,
  PACKAGE_DESCRIPTION: process.env.PACKAGE_DESCRIPTION,
  PACKAGE_NAME: process.env.PACKAGE_NAME,
  PACKAGE_VERSION: process.env.PACKAGE_VERSION,
  PACKAGE_VERSION_SUFFIX: process.env.PACKAGE_VERSION_SUFFIX,
  PACKAGE_URL: process.env.PACKAGE_URL,

  PKMN_PRESETS_BASE_URL: process.env.PKMN_PRESETS_BASE_URL,
  PKMN_PRESETS_ENDPOINT_SUFFIX: process.env.PKMN_PRESETS_ENDPOINT_SUFFIX,
  PKMN_PRESETS_FORMAT_PATH: process.env.PKMN_PRESETS_FORMAT_PATH,
  PKMN_PRESETS_FORMAT_STATS_PATH: process.env.PKMN_PRESETS_FORMAT_STATS_PATH,
  PKMN_PRESETS_RANDOMS_PATH: process.env.PKMN_PRESETS_RANDOMS_PATH,
  PKMN_PRESETS_RANDOMS_STATS_PATH: process.env.PKMN_PRESETS_RANDOMS_STATS_PATH,

  SHOWDOWN_CLIENT_ACTION_PATH: process.env.SHOWDOWN_CLIENT_ACTION_PATH,
  SHOWDOWN_CLIENT_BASE_URL: process.env.SHOWDOWN_CLIENT_BASE_URL,
  SHOWDOWN_USERS_URL: process.env.SHOWDOWN_USERS_URL,
  SMOGON_UNIVERSITY_DEX_URL: process.env.SMOGON_UNIVERSITY_DEX_URL,

  STORAGE_SETTINGS_KEY: process.env.STORAGE_SETTINGS_KEY,
  STORAGE_PRESET_CACHE_KEY: process.env.STORAGE_PRESET_CACHE_KEY,
  STORAGE_TEAMBUILDER_KEY: process.env.STORAGE_TEAMBUILDER_KEY,

  UUID_NAMESPACE: process.env.UUID_NAMESPACE,
}, 'DEBUG');

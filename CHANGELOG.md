# CHANGELOG

## v0.5.0

### Changes

🐶 Features
* Events api to hook into successful queries/effects and errors (#110)
* Performance improvements for queries in lazy mode (#116)

🐝 Fixes
* Provide uuidv4 option for react native environments where crypto.randomUUID doesn't exist (#115)

## v0.4.1

### Changes

🐝 Fixes
* Properly recover from and capture effect errors (#106)

## v0.4.0

### Changes

🐶 Features
* Improved support for parallel queries (#97)
* Guide to integrate with slices (#99)

## v0.3.0

### Changes

🐶 Features
* Support for persisting data (#71 #80)
* Support for Next.js (#71 #80)
* Added option to set a query's initial value (#71 #80)
* Added option to set a query value manaully (#71 #80)

🐝 Fixes
* Skip some unnecessary rerenders when new query value equals existing query value or when unrelated values in the store change (#71 #74 #80)

### Breaking Changes
* Require React version >=18.0.0 (#80)

## v0.2.0

### Changes

🐶 Features
* Added global configuration support for setting defaults across your app (#51)
* Improved retry mechanism with configurable options (#49)
* Added stale timeout support for better cache control and polling (#50)
* Added new hook API for simpler integration (#54, #57)

🐝 Fixes
* Fixed equality checks for better cache management (#52)
* Fixed retry mechanism reliability (#49)
* Fixed build system stability (#48)

### Breaking Changes
* Types were moved out of `leo-query/types`. Instead import types directly from `leo-query`.
* `withoutSuspenseHook` was removed. Instead use `hook(yourStore, /*suspense*/false})`.

## v0.1.0

🐶 Features
* Initial release with core functionality. Hello world!
# CHANGELOG

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
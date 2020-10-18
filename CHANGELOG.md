# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.4](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.4.3...v0.4.4) (2020-10-18)


### Bug Fixes

* Improve a mismatch route behavior. ([e594fdd](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/e594fdd610804d43a511537c4eb04647f91787e9))
* Improve back/forward behavior after navi. ([bb664d3](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/bb664d30b60ad051b52f1932dea28a8503f7fd99))

### [0.4.3](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.4.2...v0.4.3) (2020-09-29)


### Bug Fixes

* removeItem must not clear location ([71f18f7](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/71f18f7a9848f43b6a204379871bad1069b17047))

### [0.4.2](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.4.1...v0.4.2) (2020-09-28)

### Features

* Add a removeItem method.

### [0.4.1](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.4.0...v0.4.1) (2020-09-16)


### Features

* Add a partial parameter to findBackPosition method ([0dbdf5a](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/0dbdf5aa418fa01642a4bdbdfbe7d5bc4ae26184))
* Add a scrollingElements option ([bdfc9a6](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/bdfc9a618693cd53fb0a92f92cff3ae5ed4f9862))

## [0.4.0](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.3.4...v0.4.0) (2020-08-19)


### Features

* watchQuery support ([6492947](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/64929474c1d1da53e2f939883118dc88252815bb))

### [0.3.4](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.3.3...v0.3.4) (2020-08-17)

### Bug Fixes

* Fix Third-party cookies blocked in iframe issue ([4121acb](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/4121acbe231946b7b0e3ced33b078d83c9e0eaf5))

### [0.3.3](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.3.2...v0.3.3) (2020-04-07)

### [0.3.2](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.3.1...v0.3.2) (2020-01-07)


### Bug Fixes

* Fix a problem about additional params ([daff264](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/daff26435c2e441c1824ffcbc8198dd52c5676ef))

### [0.3.1](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.3.0...v0.3.1) (2020-01-06)


### Bug Fixes

* Fix a bug about pushState ([fda45c7](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/fda45c70bc3e45d5c0f02e899cc2870c76986f21))
* Fix a bug about types ([de43abc](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/de43abc8f14ad2508822b2a934f892bf92d9fa88))

## [0.3.0](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.2.5...v0.3.0) (2020-01-03)


### Features

* add overrideDefaultScrollBehavior option ([8011395](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/8011395436c128acc5a7a9ecdd6213a2e60c1ded))

### [0.2.5](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.2.4...v0.2.5) (2020-01-02)


### Features

* Remove external packages ([9262bd7](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/9262bd7b51148a24ae409774534b8654a447828a))
* Support reloading on server ([89b9516](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/89b95166a01d3c63b1302679ef5998aefea04e27))


### Bug Fixes

* Fix a bug when transit new page ([a9a8bf3](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/a9a8bf3987f81089a2da30eadbe55cb534241b20))
* Improve Invalid state reporting ([4e57bc3](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/4e57bc378be74fdeb85693ecbf29b38434b1ae39))

### [0.2.4](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.2.3...v0.2.4) (2019-12-31)


### Features

* Improve historyState action name ([05212d8](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/05212d820f3720378363c146fd55e30cddd563dd))
* Supports ssr mode ([603ab20](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/603ab203212dac553556f1e6b72059a9488742e7))


### Bug Fixes

* Fix a bug about backupData func registration ([786c309](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/786c309720a8f4a08f8704e33a1403ecc025126b))
* Improve invalid status reports. ([1abd379](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/1abd379946abf82cf5e57c2c330af46874a9a574))

### [0.2.3](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.2.2...v0.2.3) (2019-12-30)


### Features

* Add a getItems method ([defdd56](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/defdd565e48f8b0bab4aa0be1de336b81498d1fa))


### Bug Fixes

* Doesn't set a last route ([630abeb](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/630abebf83df3aa793253e94c51c8c8394ec6fcc))
* Remove outdated sample ([9955686](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/9955686b1aef14475225249e373e8ef705e8c656))

### [0.2.2](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.2.0...v0.2.2) (2019-12-25)


### Bug Fixes

* Improve dependencies ([2bd31d0](https://github.com/hidekatsu-izuno/nuxt-history-state/commit/2bd31d02d27ba863dadce1d8c1aefeb5e48d0200))

## [0.2.0](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.1.2...v0.2.0) (2019-12-24)

* Compress a history state in the sessionStore by lz-string

### [0.1.2](https://github.com/hidekatsu-izuno/nuxt-history-state/compare/v0.1.1...v0.1.2) (2019-12-23)

* Initial publishing

### 0.1.1 (2019-12-22)

* Initial version

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/energywebfoundation/ew-credentials/compare/v2.1.0...v2.2.0) (2022-08-23)

**Note:** Version bump only for package @energyweb/onchain-claims





# [2.1.0](https://github.com/energywebfoundation/ew-credentials/compare/v2.0.0...v2.1.0) (2022-08-10)


### Bug Fixes

* change expiration date to miliseconds ([8905bef](https://github.com/energywebfoundation/ew-credentials/commit/8905beff44dca9914f9e3162bd5b3333abbc6ff1))
* update claim manager test ([087a8ff](https://github.com/energywebfoundation/ew-credentials/commit/087a8ffca4b3496ecbce566ead16b3eb1ce5cabb))





# 2.0.0 (2022-08-08)


### Bug Fixes

* downgrade truffle to 5.4.29 ([9481e73](https://github.com/energywebfoundation/ew-credentials/commit/9481e732b443aab48359859aa625315b85fd0560))
* import ts types ([5b74529](https://github.com/energywebfoundation/ew-credentials/commit/5b74529e0ece38c7f85c3b0830a6a0c7ea63281b))
* remove package level package-lock.json ([ee1b43c](https://github.com/energywebfoundation/ew-credentials/commit/ee1b43c04e8c8fff56f7a62802dd54ecfd28738b))
* resolve eslint error ([85ed4a1](https://github.com/energywebfoundation/ew-credentials/commit/85ed4a164092ec3ec337736f0d222e283c5e0b46))
* rm unused code ([39a4d46](https://github.com/energywebfoundation/ew-credentials/commit/39a4d468b9442016c538cf3bc7fe2de4f98527c0))
* **script:** update claimsrevocation registry deploy script ([a30900a](https://github.com/energywebfoundation/ew-credentials/commit/a30900a458b0e9b19831f3a91d78f92a69a0a768))
* try to readd ethers via @lerna/add ([baa4c9e](https://github.com/energywebfoundation/ew-credentials/commit/baa4c9e5a96d502703675bd7718fa40d39838c98))
* use correct script name ([0c5da00](https://github.com/energywebfoundation/ew-credentials/commit/0c5da00e71d7da92b97be605b244b03e067f9c17))


### Features

* **@energyweb/vc-verification:** verify status list ([4970037](https://github.com/energywebfoundation/ew-credentials/commit/497003799e4a03531d9fb8e7c2715e034dee9b08))
* **claims:** remove deprecated `fields` property ([5cc504c](https://github.com/energywebfoundation/ew-credentials/commit/5cc504ccbcfaad7c1ec3761343376bf46f7cee82))
* **dependencies:** upgrade ether-v5 typechain and typescript ([8c34010](https://github.com/energywebfoundation/ew-credentials/commit/8c340109236221acf51148d99278b4d5a5fd5af3))
* **package:** rename packages ([60dc159](https://github.com/energywebfoundation/ew-credentials/commit/60dc159f84f27b2ca933c0fbabe1d6890e15dc7b))
* **revocation:** add onchain claim revocation code ([9ac1445](https://github.com/energywebfoundation/ew-credentials/commit/9ac14452ef3a064755fefc987d698e7011dff129))
* **revocation:** add revocation test cases for subject without claim ([c0b7fd2](https://github.com/energywebfoundation/ew-credentials/commit/c0b7fd21e4197b27d9bf0c07502c2d8de527aa37))
* **revocation:** add tests for revocation code ([6c4f730](https://github.com/energywebfoundation/ew-credentials/commit/6c4f7306920bc91ddecc56afae4c32d1d5a9b4cf))
* **revocation:** refactor revocation registry deploy script ([ae43f0c](https://github.com/energywebfoundation/ew-credentials/commit/ae43f0c1f0526d21dc041d75f20606f94703bd8c))
* **revocation:** update naming convention in context to claims ([607e887](https://github.com/energywebfoundation/ew-credentials/commit/607e8871991c71333fbe461620e53a2ef546e00a))
* **revocation:** update test case ([a4fbebc](https://github.com/energywebfoundation/ew-credentials/commit/a4fbebcadfa1e78d4a26892f4622608f672a7622))


### BREAKING CHANGES

* **claims:** deprecated `fields` property removed. Use `requestorFields` instead.





# Changelog

# 1.0.0 (10-02-2022)

### Features

* Code migration from ([iam-contracts](https://github.com/energywebfoundation/iam-contracts))
* This package contains ClaimManager and On-chain RevocationRegistry contract and it's client code.

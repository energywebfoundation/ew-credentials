# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/energywebfoundation/iam-roles/compare/v2.0.0...v2.1.0) (2022-08-10)


### Bug Fixes

* **exp:** update documentation to reflect expiry in milliseconds ([43654d1](https://github.com/energywebfoundation/iam-roles/commit/43654d13cfb5076f9cbb5372d286b3beb0c749ae))





# 2.0.0 (2022-08-08)


### Bug Fixes

* **@energyweb/credential-governance:** export resolverv2 type ([8d9e930](https://github.com/energywebfoundation/iam-roles/commit/8d9e9302788536509e9723d6fc6f71824d193724))
* **@energyweb/credential-governance:** not include parent in subdomains ([1a4b62a](https://github.com/energywebfoundation/iam-roles/commit/1a4b62a05cda94d4b2607a31f11a7b8563c20d40))
* **@energyweb/credential-governance:** read domain from domain reader ([be12c17](https://github.com/energywebfoundation/iam-roles/commit/be12c178fb3301a038cd89d18e32a7966684b974))
* add role credential interface to credential governance ([bf6e621](https://github.com/energywebfoundation/iam-roles/commit/bf6e621182f882765f5bcd69c5b9c81e2389a932))
* import ts types ([5b74529](https://github.com/energywebfoundation/iam-roles/commit/5b74529e0ece38c7f85c3b0830a6a0c7ea63281b))
* read revoker role as hash ([c0f3a7c](https://github.com/energywebfoundation/iam-roles/commit/c0f3a7c4889b23dade12764dc7761eb616c96e9b))
* remove package level package-lock.json ([ee1b43c](https://github.com/energywebfoundation/iam-roles/commit/ee1b43c04e8c8fff56f7a62802dd54ecfd28738b))
* try to readd ethers via @lerna/add ([baa4c9e](https://github.com/energywebfoundation/iam-roles/commit/baa4c9e5a96d502703675bd7718fa40d39838c98))


### Features

* **@energyweb/vc-verification:** verify status list ([4970037](https://github.com/energywebfoundation/iam-roles/commit/497003799e4a03531d9fb8e7c2715e034dee9b08))
* add `defaultExpiration` property to role definition ([5590f09](https://github.com/energywebfoundation/iam-roles/commit/5590f09656ef3549a5a705f75a1be559db53ba97))
* **claims:** remove deprecated `fields` property ([5cc504c](https://github.com/energywebfoundation/iam-roles/commit/5cc504ccbcfaad7c1ec3761343376bf46f7cee82))
* **dependencies:** upgrade ether-v5 typechain and typescript ([8c34010](https://github.com/energywebfoundation/iam-roles/commit/8c340109236221acf51148d99278b4d5a5fd5af3))
* **domainreader:** add validation method for roledefinitionv2 ([c89e2f8](https://github.com/energywebfoundation/iam-roles/commit/c89e2f897522dda2dde66cabb49a6de88ba17a49))
* **erc1056:** add volta erc1056 contract address ([042956d](https://github.com/energywebfoundation/iam-roles/commit/042956d2fd0b9e5e515a510d86d6484750ce43a7))
* **package:** rename packages ([60dc159](https://github.com/energywebfoundation/iam-roles/commit/60dc159f84f27b2ca933c0fbabe1d6890e15dc7b))
* **roles:** change fields to requestorFields ([f65eebd](https://github.com/energywebfoundation/iam-roles/commit/f65eebd4577389ee939c80d056351deb80e45f16))
* **types:** export domain definitions types ([e901136](https://github.com/energywebfoundation/iam-roles/commit/e9011364ac1311e5a48321b0ab8cf20f4c89aeb0))


### BREAKING CHANGES

* **claims:** deprecated `fields` property removed. Use `requestorFields` instead.





# Changelog

# 1.0.0 (10-02-2022)

### Features

* Code migration from ([iam-contracts](https://github.com/energywebfoundation/iam-contracts))
* This package contains code specific to role governance. 
* Contact and Client code for Domain and RoleDefinitionResolvers.

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/energywebfoundation/ew-credentials/compare/v2.1.0...v2.2.0) (2022-08-23)


### Bug Fixes

* **@energyweb/vc-verification:** validate eip191Jwt ([fa98998](https://github.com/energywebfoundation/ew-credentials/commit/fa98998636e138edcb2a927d2c169bcd7248b07d))
* restructure vc-verification package ([b84a39e](https://github.com/energywebfoundation/ew-credentials/commit/b84a39ee934bff6ed7d8ab263b68a3d904ebabfd))





# [2.1.0](https://github.com/energywebfoundation/ew-credentials/compare/v2.0.0...v2.1.0) (2022-08-10)


### Bug Fixes

* update claim manager test ([087a8ff](https://github.com/energywebfoundation/ew-credentials/commit/087a8ffca4b3496ecbce566ead16b3eb1ce5cabb))


### Features

* add validation method for ipfs cid ([e930230](https://github.com/energywebfoundation/ew-credentials/commit/e9302302f73c91cfe7564bf284018a593e197faf))





# 2.0.0 (2022-08-08)


### Bug Fixes

* **@energyweb/credential-governance:** export resolverv2 type ([8d9e930](https://github.com/energywebfoundation/ew-credentials/commit/8d9e9302788536509e9723d6fc6f71824d193724))
* **@energyweb/vc-verification:** check not-null credential before verification ([4b81231](https://github.com/energywebfoundation/ew-credentials/commit/4b81231fc0040cfd60d1c29a5fa356cb50ae8ec6))
* **@energyweb/vc-verification:** index signature to offchain claim ([fc87d9d](https://github.com/energywebfoundation/ew-credentials/commit/fc87d9d9030c40cbc50a03eeef4b0691eaeddd24))
* **@energyweb/vc-verification:** replace ts-ignore with ts-expect-error ([670f899](https://github.com/energywebfoundation/ew-credentials/commit/670f899fd00335185d67691b564592a7e0b07f00))
* add check to match addresses ([ac0acfa](https://github.com/energywebfoundation/ew-credentials/commit/ac0acfae80cff1b4501d5bd340229bc910553052))
* allow const condition in loop ([b376ddf](https://github.com/energywebfoundation/ew-credentials/commit/b376ddf1721e87f83de212a05d0ad84ac2995d2a))
* eslint formating ([bedc24f](https://github.com/energywebfoundation/ew-credentials/commit/bedc24fcccf7cb9eb3ca1fff695fee71a1f856ef))
* export all from models ([2d30de7](https://github.com/energywebfoundation/ew-credentials/commit/2d30de706b17079d708207e2fb941fc229c8a314))
* import ts types ([5b74529](https://github.com/energywebfoundation/ew-credentials/commit/5b74529e0ece38c7f85c3b0830a6a0c7ea63281b))
* resolve eslint error ([85ed4a1](https://github.com/energywebfoundation/ew-credentials/commit/85ed4a164092ec3ec337736f0d222e283c5e0b46))
* return offChainClaim object ([2c1e1cc](https://github.com/energywebfoundation/ew-credentials/commit/2c1e1ccebb9a357e2b674b687f1d3b91f2149985))
* rm unused code ([39a4d46](https://github.com/energywebfoundation/ew-credentials/commit/39a4d468b9442016c538cf3bc7fe2de4f98527c0))
* spelling correction ([1a4a028](https://github.com/energywebfoundation/ew-credentials/commit/1a4a0282db0d7ae1660b30830f5bfc4c6f0e1e8f))
* try to readd ethers via @lerna/add ([baa4c9e](https://github.com/energywebfoundation/ew-credentials/commit/baa4c9e5a96d502703675bd7718fa40d39838c98))
* typo in VC model ([e5329af](https://github.com/energywebfoundation/ew-credentials/commit/e5329af8e250bf236565d393f48cdd9cb24741fb))
* typo in VC tests ([fb85ed2](https://github.com/energywebfoundation/ew-credentials/commit/fb85ed247d44b8db874ab4efdd78e7b564285c4e))
* unify return type with verification result ([72419fd](https://github.com/energywebfoundation/ew-credentials/commit/72419fd0484ac1d2363045876e239becd7be4cda))
* update Issuer Verification to use ([665aa6f](https://github.com/energywebfoundation/ew-credentials/commit/665aa6f283021d2642c39e263e61ebc8be01b243))


### Features

* **@energyweb/vc-verification:** configurable verify proof ([013c008](https://github.com/energywebfoundation/ew-credentials/commit/013c008c31732cc9ae576f1731a2f62e6a145cd8))
* **@energyweb/vc-verification:** verify status list ([4970037](https://github.com/energywebfoundation/ew-credentials/commit/497003799e4a03531d9fb8e7c2715e034dee9b08))
* add claimissuer verification to revocation verification ([8ff4f6f](https://github.com/energywebfoundation/ew-credentials/commit/8ff4f6fad30533b3682337bfcb5d25f145636412))
* add eip191JwtsOf and credentialsOf to credentialresolver interface ([59b0da9](https://github.com/energywebfoundation/ew-credentials/commit/59b0da92b1f4f32c672f352c4a9c44530bdc3f41))
* add genralised method to fetch credential ([6dda56a](https://github.com/energywebfoundation/ew-credentials/commit/6dda56a5dde3f69e30ffb07324de95d816bbf0e7))
* add revocation verification for issuer credential ([b705b87](https://github.com/energywebfoundation/ew-credentials/commit/b705b874d8462856d49312a1e56dcaf42ce5f86b))
* add single issuer verification api ([ff43253](https://github.com/energywebfoundation/ew-credentials/commit/ff4325370c72eafb5a4dc4f2079c6e420f38327f))
* add verification tests cases ([dd219df](https://github.com/energywebfoundation/ew-credentials/commit/dd219df0db605b455bb9883a402a5224591c5fd5))
* change status prop to verified ([670f793](https://github.com/energywebfoundation/ew-credentials/commit/670f793308dd5100d1e3886c795034aa9c10543b))
* code refactor and readme update ([b84035f](https://github.com/energywebfoundation/ew-credentials/commit/b84035f8dbb534a133d51e451993878f5e1e5944))
* **config:** add truffle bili and tsconfig to vc verification module ([f914795](https://github.com/energywebfoundation/ew-credentials/commit/f9147954f82ff793eef698d5e37b002258592a44))
* **credential:** add cached and resolver based did doc resolution ([4a86577](https://github.com/energywebfoundation/ew-credentials/commit/4a86577b8c2c499f8fc26c60a2ed733e15b01f6d))
* **credential:** separate credential fetching from verification code ([cf50140](https://github.com/energywebfoundation/ew-credentials/commit/cf50140c901ecac0b5a04b93a8b63e84b77058d8))
* **erc1056:** add erc1056 contract ([086013b](https://github.com/energywebfoundation/ew-credentials/commit/086013b18c9b9b85711318a63db5071beeeb931d))
* export credential type validation checks ([c431748](https://github.com/energywebfoundation/ew-credentials/commit/c431748169a0401c9e57dc20c1aba53e7c1f8ca7))
* instantiate vc and claim issuer verification classes internally ([38b58b7](https://github.com/energywebfoundation/ew-credentials/commit/38b58b7ac94693dc3f19a137e52bc0fd2cba96fe))
* **issuer-resolver:** add validation for roledefinitionv2 ([77775c0](https://github.com/energywebfoundation/ew-credentials/commit/77775c0b7650a13eb7b7ee178fa80d38a0829f91))
* **jwt-credential:** replace offchainclaim interface with eip191jwt ([39c6791](https://github.com/energywebfoundation/ew-credentials/commit/39c6791fc1c71c5ea2555c22fbef0afd11b6639f))
* make `verifyRevoker` method public ([53b79cb](https://github.com/energywebfoundation/ew-credentials/commit/53b79cb89f38b1ad5a5160af73785c607862564e))
* make eip191JwtOf and credentialsOf public ([4b035ef](https://github.com/energywebfoundation/ew-credentials/commit/4b035ef78f83b46d9f4c56ec96364d7c33aa05fb))
* **package:** add scripts and dependencies ([bd27d25](https://github.com/energywebfoundation/ew-credentials/commit/bd27d25fb92cac0f7f22afbe1d255207146c29c3))
* **package:** rename packages ([60dc159](https://github.com/energywebfoundation/ew-credentials/commit/60dc159f84f27b2ca933c0fbabe1d6890e15dc7b))
* **provider:** replace signer with provider ([72d2c49](https://github.com/energywebfoundation/ew-credentials/commit/72d2c490c9e65606523c1ff329bdf4b965ad6815))
* reafactor vc verification tests ([b6746ed](https://github.com/energywebfoundation/ew-credentials/commit/b6746ed8680c05976b0a9e7c622c69ac18177851))
* **resolver:** refactor ipfs credential resolver ([f3aec82](https://github.com/energywebfoundation/ew-credentials/commit/f3aec826e2f7dde063624671cb99a026f94d2f9e))
* **resolver:** separate implementation for issuer and revoker resolution ([3eb6782](https://github.com/energywebfoundation/ew-credentials/commit/3eb6782c3a4caf5ac6654c92d9207f6b4310dc40))
* **revocation:** add revocation verification tests ([4131213](https://github.com/energywebfoundation/ew-credentials/commit/4131213583aaaff30949c0cac460efac4c10d3af))
* **revocation:** vc revocation verification ([b7ac05b](https://github.com/energywebfoundation/ew-credentials/commit/b7ac05ba10bf17f7b2a0b9e4075893bbc43dbb7c))
* **revoker-def:** add revoker def resolution ([ba8ab72](https://github.com/energywebfoundation/ew-credentials/commit/ba8ab7211857de9dd37552ceb1861ade34bc9834))
* **role:** add cache and ens based roledef resolver ([2f7fbd5](https://github.com/energywebfoundation/ew-credentials/commit/2f7fbd5b91e382859842b76a11c7523894de2d29))
* **test:** add tests for chain of trust verificaiton ([ac0b64b](https://github.com/energywebfoundation/ew-credentials/commit/ac0b64bb8d46cb4e148c328b830dd802d374e8f6))
* validate credential expiration ([02559b5](https://github.com/energywebfoundation/ew-credentials/commit/02559b5119d08aa783b2b5e6abd97b289eee9679))
* **vc:** issuer signed vc published to ipfs ([dd6c5dc](https://github.com/energywebfoundation/ew-credentials/commit/dd6c5dce0906f80dc143aefd1a854349af30139a))
* **vc:** publish stringified vc instead of signed ([bb3cfeb](https://github.com/energywebfoundation/ew-credentials/commit/bb3cfeb6b76d3e49c042326fd14300d2ad5d1769))
* **verification:** add code to verify chain of trust ([ee9efd4](https://github.com/energywebfoundation/ew-credentials/commit/ee9efd4a5aae856d1afa0f9f68702577a5387661))
* **verification:** add issuance verification for offchainclaims ([da6a6fc](https://github.com/energywebfoundation/ew-credentials/commit/da6a6fc06c2dcebd0953318f37afafbfde5e99b4))
* **verification:** add more tests for vc issuer verification ([f389d53](https://github.com/energywebfoundation/ew-credentials/commit/f389d53b73c264f13d68f076bc385575d74e3d3a))
* **verification:** add sub methods to verification code ([466631c](https://github.com/energywebfoundation/ew-credentials/commit/466631c6e3cf298c1e84bd992aadd8c974d71075))
* **verification:** add tests for vc and offchainclaim issuance verification ([54c6019](https://github.com/energywebfoundation/ew-credentials/commit/54c60194b9ae3c61556b4ced4c03d31b6a5005d1))
* **verification:** reafactor issuance verification for vc ([3c21f0e](https://github.com/energywebfoundation/ew-credentials/commit/3c21f0e265e84ddc9164903bb7812bf0c3f58b4e))
* **verification:** refactor credential and role resolution code ([a706ef3](https://github.com/energywebfoundation/ew-credentials/commit/a706ef3939375571f5a9e5bf5fbdcf7a0f065232))
* **verification:** refactor verification code ([e5954e5](https://github.com/energywebfoundation/ew-credentials/commit/e5954e51438854db8cdfb2e78543820abfbd42cf))
* **verification:** refactor verification code ([12d2912](https://github.com/energywebfoundation/ew-credentials/commit/12d2912c0dc9d88a9b489236515bc28d28c89452))
* **verification:** remove delegate verification code ([000dc87](https://github.com/energywebfoundation/ew-credentials/commit/000dc87e30480daaf7f06b9ff4de8ab28bbe5bc8))
* **verification:** update test wrt domainreader ([e892f14](https://github.com/energywebfoundation/ew-credentials/commit/e892f1414dfddc9cd3fbe4560e32dcd97bc3bb7a))
* **verification:** use domainreader to resolve issuers ([11de036](https://github.com/energywebfoundation/ew-credentials/commit/11de036ecbdca2a45db4f2d1062e4a5ab4a5a540))





# Changelog

# 1.0.0 (10-02-2022)

### Features

* Code migration from ([iam-contracts](https://github.com/energywebfoundation/iam-contracts))

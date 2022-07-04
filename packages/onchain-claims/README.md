<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>


# OnChain Claims

## Description
This package consists of EVM smart contract registries related to EnergyWeb Roles, responsible to issuance for on-chain role issuance and revocation. The package majorly relies on two main contracts, `ClaimManager` and `ClaimRevocationRegistry` for issuance and revocation of EnergyWeb roles respectively.
[`@energyweb/onchain-claims`](../onchain-claims/) is a typescript module. 

{onchain-claims} is a component of the [Energy Web Decentralized Operating System](#ew-dos)

## Usage

### ClaimRevocation

The `ClaimRevocation` class can be used to revoke an on-chain issued claim / role. It used the `ClaimRevocationRegistry` contract to perform revocation.
```typescript
import { EwSigner } from '@ew-did-registry/did-ethr-resolver';
import {
  VOLTA_CLAIM_REVOCATION_REG_ADDRESS,
} from "@energyweb/credential-governance";
import {
  ClaimRevocation
} from "@energyweb/onchain-claims";

(async () => {
  let revoker: EwSigner;
  const claimRevocation = new ClaimRevocation(
    VOLTA_CLAIM_REVOCATION_REG_ADDRESS,
    revoker
  );
  await claimRevocation.revokeClaim('namespace', 'subjectDID', 'revokerDID');
  const isRevoked = await claimRevocation.isClaimRevoked(
    'namespace',
    'subjectDID'
  );
})();
```

## Contract Descriptions

### [`ClaimManager.sol`](../onchain-claims/contracts/ClaimManager.sol)

This is an implementation to register claims / roles on-chain (current deployment - EnergyWeb Chain). `ClaimManager` is designed to register roles issued by authorised issuers (validated from RoleDefinition).

### [`ClaimsRevocationRegistry.sol`](../onchain-claims/contracts/ClaimsRevocationRegistry.sol)

This EVM contracts registers revocation for on-chain claims, it validates the authority of the revoker and existence of the subject's claim for revocation.

## Installation
This is a Node.js module available through the npm registry.

### Requirements

Before installing, download and install Node.js. Node.js 16.10.0 or higher is required.

Installation is done using the following commands:

``` sh
$ npm install
```

## Build
``` sh
$ npm run build
```

## Run
``` sh
$ npm run start
```
## Testing 

### Unit Tests
``` sh
$ npm run test-rpc
```

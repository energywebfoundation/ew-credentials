<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>


# Credential Governance

## Description
This package consists of EVM smart contract related to EnergyWeb Name Service and libraries to resolve / read namespaces & defintions. 

[`@energyweb/credential-governance`](../credential-governance/) is a typescript module. 

{credential-governance} is a component of the [Energy Web Decentralized Operating System](#ew-dos)

## Usage

### DomainReader

The `DomainReader` class can be used as shown to read a domain definition.
```typescript
import {
  DomainReader,
  VOLTA_ENS_REGISTRY_ADDRESS,
} from "@energyweb/credential-governance";
import { providers, utils } from "ethers";

(async () => {
  const provider = new providers.JsonRpcProvider(
    "https://volta-rpc.energyweb.org"
  );
  const reader = new DomainReader({
    ensRegistryAddress: VOLTA_ENS_REGISTRY_ADDRESS,
    provider,
  });
  const roleDefinition = await reader.read({
    node: utils.namehash("manufacturer.roles.flex.apps.exampleco.iam.ewc"),
  });
})();
```

### DomainTransactionFactoryV2

The `DomainTransactionFactory` class can be used to add and update definitions specific to namespaces.
```typescript
import {
  DomainTransactionFactoryV2,
  VOLTA_RESOLVER_V2_ADDRESS,
} from "@energyweb/credential-governance";

(async () => {
  const domainTransactionFactory = new DomainTransactionFactoryV2({
    domainResolverAddress: VOLTA_RESOLVER_V2_ADDRESS,
  });

  const domain = 'sampleDomain';
  const role: IRoleDefinitionV2 = {
    requestorFields: [
      {
        fieldType: 'fieldType',
        label: 'label',
        required: true,
        minLength: 5,
        minDate: new Date(),
        maxDate: new Date(),
      },
    ],
    issuer: {
      issuerType: 'DID',
      did: [`did:ethr:volta:0x7aA65E31d404A8857BA083f6195757a730b51CFe`],
    },
    revoker: {
      revokerType: 'DID',
      did: [`did:ethr:volta:0x7aA65E31d404A8857BA083f6195757a730b51CFe`],
    },
    metadata: [],
    roleName: 'myRole1',
    roleType: 'sample',
    version: 1,
    enrolmentPreconditions: [],
  };

  const call = domainDefTxFactoryV2.newRole({
    domain: domain,
    roleDefinition: role,
  });
  await (await owner.sendTransaction(call)).wait();
})();
```

## Contract Descriptions

### [`RoleDefinitionResolverV2.sol`](../credential-governance/contracts/RoleDefinitionResolverV2.sol)

This is an implementation of an ENS resolver that represents a role definition.
It extends the [ENS Public Resolver](https://docs.ens.domains/contract-api-reference/publicresolver) with additional resolver profiles,
specifically for the use case of issuance, revocation and verify role claims using a smart contract.
In other words, this custom ENS resolver allows some properties of a role definition to be (usefully) readable by another smart contract.

### [`DomainNotifier.sol`](../credential-governance/contracts/DomainNotifier.sol)

This EVM contracts notifies the updation of ENS namespaces resolved data.

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

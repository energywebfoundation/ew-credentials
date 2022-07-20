<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="../../images/EW.png" width="120" alt="Energy Web Foundation Logo" /></a>
</p>


# VC Verification

## Description
This package provides implementation for verification of Verifiable Credential and OffChainClaim. The verification can be done for issuer or revoker authority, credential proof and revocation verificaiton.
[`@energyweb/vc-verification`](../vc-verification/) is a typescript module. 

{vc-verification} is a component of the [Energy Web Decentralized Operating System](#ew-dos)

## Usage

### Issuer Verification

The `IssuerVerification` class can be used to verify issuers either with an RoleEIP191Jwt or a Verifiable Credential. The `IssuerVerification` verifies issuers authority, respective credential and revocation status.
```typescript
import {
  CredentialResolver,
  IssuerResolver,
  RevokerResolver,
  VCIssuerVerification,
  ClaimIssuerVerification,
  EthersProviderIssuerResolver,
  EthersProviderRevokerResolver,
  IpfsCredentialResolver,
  RevocationVerification,
} from '@energyweb/vc-verification';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import { DomainReader } from '@energyweb/credential-governance';
import { providers } from 'ethers';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { verifyCredential } from 'didkit-wasm-node';

(async () => {
  let provider: providers.provider;
  let issuerResolver: IssuerResolver = new EthersProviderIssuerResolver(
    DomainReader
  );
  let revokerResolver: RevokerResolver = new EthersProviderRevokerResolver(
    DomainReader
  );
  let credentialresolver: CredentialResolver = new IpfsCredentialResolver(
    DIDStore,
    Resolver
  );
  const revocationVerification = new RevocationVerification(
    revokerResolver,
    issuerResolver,
    credentialResolver,
    provider,
    registrySettings,
    verifyCredential
  );
  const issuerVerification = new IssuerVerification(
    issuerResolver,
    credentialResolver,
    provider,
    registrySettings,
    revocationVerification,
    verifyCredential
  );
  let issuer : 'did:ethr:ewc:0x1....';
  const role = 'role';
  issuerVerification.verifyIssuer(issuer, role);
})();
```

### Revocation Verification

The `RevocationVerification` class can be used to verify statusList2021Credential and revoker's authority. 
```typescript
import {
  CredentialResolver,
  RevokerResolver,
  IssuerResolver,
  RevocationVerification,
  EthersProviderRevokerResolver,
  EthersProviderIssuerResolver,
  IpfsCredentialResolver,
} from '@energyweb/vc-verification';
import {
  StatusList2021Credential,
} from '@ew-did-registry/credentials-interface';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import { DomainReader } from '@energyweb/credential-governance';
import { providers } from 'ethers';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';
import { verifyCredential } from 'didkit-wasm-node';

(async () => {
  let provider: providers.provider;
  let issuerResolver: IssuerResolver = new EthersProviderIssuerResolver(
    DomainReader
  );
  let revokerResolver: RevokerResolver = new EthersProviderRevokerResolver(
    DomainReader
  );
  let credentialresolver: CredentialResolver = new IpfsCredentialResolver(
    DIDStore,
    Resolver
  );
  const revocationVerification = new RevocationVerification(
    revokerResolver,
    issuerResolver,
    credentialResolver,
    provider,
    registrySettings,
    verifyCredential
  );
  let credential : StatusList2021Credential;
  const role = 'role';
  revocationVerification.verifyStatusList(credential, role);
})();
```

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

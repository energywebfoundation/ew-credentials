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

The `IssuerVerification` class can be used to verify issuers either with an OffChainClaim or a Verifiable Credential.
```typescript
import {
  CredentialResolver,
  IssuerResolver,
  VCIssuerVerification,
  ClaimIssuerVerification,
  EthersProviderIssuerResolver,
  IpfsCredentialResolver,
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
  let credentialresolver: CredentialResolver = new IpfsCredentialResolver(
    DIDStore,
    Resolver
  );
  const vcIssuerVerification = new VCIssuerVerification(
    issuerResolver,
    credentialResolver,
    verifyCredential
  );
  const claimIssuerVerification = new ClaimIssuerVerification(
    provider,
    RegistrySettings,
    issuerResolver,
    credentialResolver
  );
  const issuerVerification = new IssuerVerification(
    issuerResolver,
    credentialResolver
    vcIssuerVerification,
    claimIssuerVerification
  );
  let issuer : 'did:ethr:ewc:0x1....';
  const role = 'role';
  issuerVerification.verifyIssuer(issuer, role);
})();
```

### VC Issuer Verification

The `VCIssuerVerification` class can be used to verify Issuer's authority and respective credential's proof followed by entire hierarchy of the issuers, for issuance chain consisting only of Verifiable Credential.
```typescript
import {
  CredentialResolver,
  IssuerResolver,
  VCIssuerVerification,
  EthersProviderIssuerResolver,
  IpfsCredentialResolver,
} from '@energyweb/vc-verification';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import { DomainReader } from '@energyweb/credential-governance';
import { verifyCredential } from 'didkit-wasm-node';

(async () => {
  let issuerResolver: IssuerResolver = new EthersProviderIssuerResolver(
    DomainReader
  );
  let credentialresolver: CredentialResolver = new IpfsCredentialResolver(
    DIDStore,
    Resolver
  );
  const issuerVerification = new VCIssuerVerification(
    issuerResolver,
    credentialResolver,
    verifyCredential
  );
  await issuerVerification.verifyIssuer('issuerDID', 'role');
})();
```

### Claim Issuer Verification

The `ClaimIssuerVerification` class can be used to verify Issuer's authority and respective credential's proof followed by entire hierarchy of the issuers, for issuance chain consisting only of OffChainClaims.
```typescript
import {
  CredentialResolver,
  IssuerResolver,
  ClaimIssuerVerification,
  EthersProviderIssuerResolver,
  IpfsCredentialResolver,
} from '@energyweb/vc-verification';
import { DidStore } from '@ew-did-registry/did-ipfs-store';
import { Resolver } from '@ew-did-registry/did-ethr-resolver';
import { DomainReader } from '@energyweb/credential-governance';
import { providers } from 'ethers';
import { RegistrySettings } from '@ew-did-registry/did-resolver-interface';

(async () => {
  let provider: providers.provider;
  let issuerResolver: IssuerResolver = new EthersProviderIssuerResolver(
    DomainReader
  );
  let credentialresolver: CredentialResolver = new IpfsCredentialResolver(
    DIDStore,
    Resolver
  );
  const issuerVerification = new ClaimIssuerVerification(
    provider,
    RegistrySettings,
    issuerResolver,
    credentialResolver
  );
  await issuerVerification.verifyIssuer('issuerDID', 'role');
})();
```

### Revocation Verification

The `RevocationVerification` class can be used to verify statusList2021Credential and revoker's authority.
```typescript
import {
  CredentialResolver,
  RevokerResolver,
  VCIssuerVerification,
  ClaimIssuerVerification,
  RevocationVerification,
  EthersProviderRevokerResolver,
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
  let revokerResolver: RevokerResolver = new EthersProviderRevokerResolver(
    DomainReader
  );
  let credentialresolver: CredentialResolver = new IpfsCredentialResolver(
    DIDStore,
    Resolver
  );
  const vcIssuerVerification = new VCIssuerVerification(
    issuerResolver,
    credentialResolver,
    verifyCredential
  );
  const claimIssuerVerification = new ClaimIssuerVerification(
    provider,
    RegistrySettings,
    issuerResolver,
    credentialResolver
  );
  const revocationVerification = new RevocationVerification(
    revokerResolver,
    credentialResolver
    vcIssuerVerification,
    claimIssuerVerification
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

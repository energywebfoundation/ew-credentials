import type { VerifiableCredential } from '@ew-did-registry/credentials-interface';
export * from './vc-issuer-verification';
export * from './Ipfs-credential-resolver';
export * from './issuer-resolver';
export * from './credential-resolver';
export * from './upgrade-chainid';
export * from './claim-issuer-verification';
export * from './revocation-verification';
export * from './revoker-resolver';
export * from './issuer-verification';
export {
  CredentialResolverIpfsSettings,
  VerificationResult,
  RoleEIP191JWT,
  RolePayload,
} from './models';
export { VerifiableCredential };

import type { VerifiableCredential } from '@ew-did-registry/credentials-interface';
export * from './vc-issuer-verification';
export * from './Ipfs-credential-resolver';
export * from './issuer-resolver';
export * from './credential-resolver';
export * from './upgrade-chainid';
export * from './claim-issuer-verification';
export * from './revocation-verification';
export * from './revoker-resolver';
export {
  CredentialResolverIpfsSettings,
  VerificationResult,
  OffChainClaim,
} from './models';
export { VerifiableCredential };

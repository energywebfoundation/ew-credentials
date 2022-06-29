import type { VerifiableCredential } from '@ew-did-registry/credentials-interface';
export * from './issuer-verification-vc';
export * from './Ipfs-credential-resolver';
export * from './issuer-resolver';
export * from './credential-resolver';
export * from './upgrade-chainid';
export * from './issuer-verification-offchainclaims';
export * from './revocation-verification';
export * from './revoker-resolver';
export {
  CredentialResolverIpfsSettings,
  VerificationResult,
  OffChainClaim,
} from './models';
export { VerifiableCredential };

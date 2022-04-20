/**
 * Storage settings to fetch issuer's credential from IPFS
 */
export interface CredentialResolverIpfsSettings {
  ipfsUrl: string;
}

/**
 * Storage settings to fetch issuer's credential using VUI APIs
 */
export interface VuiIssuerApiCredentialResolverSettings {
  issuersRequestUrl: string;
}

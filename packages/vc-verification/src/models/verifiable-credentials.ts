export interface Proof {
  '@context': string;
  verificationMethod: string;
  created: string;
  proofPurpose: string;
  type: string;
  proofValue: string;
}

export interface VerificationResult {
  status: boolean;
}

export interface OffChainClaim {
  claimType: string;
  claimTypeVersion: number;
  issuedToken: string;
  iss: string;
  [x: string]: string | number;
}

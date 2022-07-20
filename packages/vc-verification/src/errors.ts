import type { IRoleDefinitionV2 } from '@energyweb/credential-governance';

export class NoCredential extends Error {
  constructor(credential: string, subject: string) {
    super(`${credential} credential was not issued to ${subject}`);
  }
}

export class NoCredentialStatus extends Error {
  constructor(credential: string) {
    super(`Status of ${credential} credential was not set`);
  }
}

export class CredentialNotRevoked extends Error {
  constructor(credential: string, subject: string) {
    super(`Credential ${credential} of ${subject} has not been revoked`);
  }
}

export class CredentialRevoked extends Error {
  constructor(credential: string, subject: string) {
    super(`Credential ${credential} of ${subject} has been revoked`);
  }
}

export class RevokerNotAuthorized extends Error {
  constructor(revoker: string, credential: string, reason?: string) {
    let message = `Revoker ${revoker} is not authorized to revoke ${credential}`;
    if (reason) {
      message = message + `: ${reason}`;
    }
    super(message);
  }
}

export class InvalidCredentialProof extends Error {
  constructor(proof: string, issuer: string) {
    super(`Credential proof ${proof} was not signed by ${issuer}`);
  }
}

export class IssuerNotAuthorized extends Error {
  constructor(issuer: string, credential: string, reason?: string) {
    let message = `Issuer ${issuer} is not authorized to issue ${credential}`;
    if (reason) {
      message = message + `: ${reason}`;
    }
    super(message);
  }
}

export class InvalidRevokerType extends Error {
  constructor(
    credential: string,
    revokerType: IRoleDefinitionV2['revoker']['revokerType']
  ) {
    super(`Invalid revoker type ${revokerType} of credential ${credential}`);
  }
}

export class InvalidIssuerType extends Error {
  constructor(
    credential: string,
    issuerType: IRoleDefinitionV2['issuer']['issuerType']
  ) {
    super(`Invalid issuer type ${issuerType} of credential ${credential}`);
  }
}

export class NoRevokers extends Error {
  constructor(credential: string) {
    super(`Revokers for credential ${credential} were not set`);
  }
}

export class NoIssuers extends Error {
  constructor(credential: string) {
    super(`Issuers for credential ${credential} were not set`);
  }
}

export const ERRORS = {
  NoCredential: 'No authorative credential found for issuer',
  NoCredentialStatus: 'Status was not set for the credential',
  CredentialNotRevoked: 'Credential has not been revoked',
  RevokerNotAuthorized: 'Revoker not authorised to revoke credential',
  InvalidCredentialProof: 'Credential proof was not signed by the issuer',
  IssuerNotAuthorized: 'Issuer not authorised to issue the credential',
  InvalidRevokerType: 'Invalid revokerType for the given role',
  InvalidIssuerType: 'Invalid issuerType for the given role',
  NoRevokers: 'No revokers found for the given role',
  NoIssuers: 'No issuers found for the given role',
  IssuerCredentialRevoked: 'Issuer credential has been revoked',
};

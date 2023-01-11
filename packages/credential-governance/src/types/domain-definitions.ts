export interface IAppDefinition {
  appName: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  others?: Record<string, unknown>;
}

export interface IOrganizationDefinition {
  orgName: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  others?: Record<string, unknown>;
}

export interface IRoleDefinition extends IRoleDefinitionText {
  version: number;
  issuer: IIssuerDefinition;
  enrolmentPreconditions: { type: PreconditionType; conditions: string[] }[];
}

export interface IRoleDefinitionV2 extends IRoleDefinitionText {
  version: number;
  issuer: IIssuerDefinition;
  revoker: IRevokerDefinition;
  enrolmentPreconditions: { type: PreconditionType; conditions: string[] }[];
  // Default time period in milliseconds, after which the role is considered expired. If null or undefined, there is no default expiry
  defaultValidityPeriod?: number;
}

export enum PreconditionType {
  Role = 'role',
}

export interface IFieldDefinition {
  fieldType: string;
  label: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minValue?: number;
  maxValue?: number;
  minDate?: Date;
  maxDate?: Date;
  /**
   * A JSON Schema definition
   * For more information about JSON Schema, see https://json-schema.org/
   */
  schema?: Record<string, unknown>;
}
export interface IRoleDefinitionText {
  roleType: string;
  roleName: string;
  requestorFields?: IFieldDefinition[];
  issuerFields?: IFieldDefinition[];
  metadata: Record<string, unknown> | Record<string, unknown>[];
}

export interface IIssuerDefinition {
  issuerType?: string;
  did?: string[];
  roleName?: string;
}

export interface IRevokerDefinition {
  revokerType?: string;
  did?: string[];
  roleName?: string;
}

import { utils } from 'ethers';
import { DomainReader } from './domain-reader';
import { DomainTransactionFactory } from './domain-transaction-factory';
import { DomainTransactionFactoryV2 } from './domain-transaction-factory-v2';
import { DomainHierarchy } from './domain-hierarchy';
import {
  IAppDefinition,
  IOrganizationDefinition,
  IRoleDefinition,
  IRoleDefinitionV2,
  IRoleDefinitionText,
  PreconditionType,
  IFieldDefinition,
  IIssuerDefinition,
  IRevokerDefinition,
} from './types/domain-definitions';
import { RoleCredentialSubject, IssuerFields } from './types/role-credential';
import { ResolverContractType } from './types/resolver-contract-type';
import { EncodedCall } from './types/transaction';

// To disable "WARNING: Multiple definitions for addr" that is triggered by ENS Registry
const { Logger } = utils;
Logger.setLogLevel(Logger.levels.ERROR);

export { DomainReader };
export { DomainTransactionFactory };
export { DomainTransactionFactoryV2 };
export {
  IOrganizationDefinition,
  IAppDefinition,
  IRoleDefinition,
  IRoleDefinitionV2,
  IRoleDefinitionText,
  PreconditionType,
  IFieldDefinition,
  IIssuerDefinition,
  IRevokerDefinition,
};
export { RoleCredentialSubject, IssuerFields };
export { EncodedCall };
export * from './chain-constants';
export { PRINCIPAL_THRESHOLD, WITHDRAW_DELAY } from './constants';
export { ResolverContractType };
export { DomainHierarchy };
export { RoleDefinitionResolverV2 } from '../ethers/RoleDefinitionResolverV2';
export { RoleDefinitionResolverV2__factory } from '../ethers/factories/RoleDefinitionResolverV2__factory';

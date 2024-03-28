import {
  DependencyGroup,
  PackageAuditLevel,
  PackageManager,
} from '../../config';
import { dependencyGroupToLong } from '../../constants';
import { AuditResult } from './types';
import {
  npmToAuditResult,
  pnpmToAuditResult,
  yarnv1ToAuditResult,
  yarnv2ToAuditResult,
} from './unify-type';

/* eslint-disable no-magic-numbers */
export const auditScoreModifiers: Record<PackageAuditLevel, number> = {
  critical: 1,
  high: 0.1,
  moderate: 0.05,
  low: 0.02,
  info: 0.01,
};
/* eslint-enable no-magic-numbers */

export const normalizeAuditMapper: Record<
  PackageManager,
  (output: string) => AuditResult
> = {
  npm: npmToAuditResult,
  'yarn-classic': yarnv1ToAuditResult,
  'yarn-modern': yarnv2ToAuditResult,
  pnpm: pnpmToAuditResult,
};

const npmDependencyOptions: Record<DependencyGroup, string[]> = {
  prod: ['--omit=dev', '--omit=optional'],
  dev: ['--include=dev', '--omit=optional'],
  optional: ['--include=optional', '--omit=dev'],
};

// Yarn v2 does not currently audit optional dependencies
// see https://github.com/yarnpkg/berry/blob/master/packages/plugin-npm-cli/sources/npmAuditTypes.ts#L5
const yarnv2EnvironmentOptions: Record<DependencyGroup, string> = {
  prod: 'production',
  dev: 'development',
  optional: '',
};

const pnpmDependencyOptions: Record<DependencyGroup, string[]> = {
  prod: ['--prod', '--no-optional'],
  dev: ['--dev', '--no-optional'],
  optional: [],
};

export const auditArgs = (
  groupDep: DependencyGroup,
): Record<PackageManager, string[]> => ({
  npm: [...npmDependencyOptions[groupDep], '--audit-level=none'],
  'yarn-classic': ['--groups', dependencyGroupToLong[groupDep]],
  'yarn-modern': ['--environment', yarnv2EnvironmentOptions[groupDep]],
  pnpm: [...pnpmDependencyOptions[groupDep]],
});

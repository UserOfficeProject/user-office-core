export enum Roles {
  USER = 'user',
  USER_OFFICER = 'user_officer',
  FAP_CHAIR = 'fap_chair',
  FAP_SECRETARY = 'fap_secretary',
  FAP_REVIEWER = 'fap_reviewer',
  INSTRUMENT_SCIENTIST = 'instrument_scientist',
  EXPERIMENT_SAFETY_REVIEWER = 'experiment_safety_reviewer',
  INTERNAL_REVIEWER = 'internal_reviewer',
  PROPOSAL_READER = 'proposal_reader',
}

export type UserRolePermissions = { note: string };
export type ProposalReaderRolePermissions = {
  hasLogAccess: boolean;
  hasTechnicalReviewAccess: boolean;
  hasFapAccess: boolean;
  hasAdminAccess: boolean;
};

type RoleBase = {
  id: number;
  title: string;
  description: string;
  isRootRole: boolean;
};

export type Role =
  | (RoleBase & {
      shortCode: typeof Roles.USER;
      config: UserRolePermissions;
    })
  | (RoleBase & {
      shortCode: typeof Roles.PROPOSAL_READER;
      config: ProposalReaderRolePermissions;
    })
  // Add more roles here
  | (RoleBase & {
      shortCode: Exclude<
        string,
        typeof Roles.USER | typeof Roles.PROPOSAL_READER
      >;
      config: Record<string, never>;
    });

export function createRole(
  id: number,
  shortCode: string,
  title: string,
  description: string,
  config: unknown,
  isRootRole: boolean
): Role {
  const base = { id, title, description, isRootRole };
  switch (shortCode) {
    case Roles.USER:
      return {
        ...base,
        shortCode: Roles.USER,
        config: config as UserRolePermissions,
      };
    case Roles.PROPOSAL_READER:
      return {
        ...base,
        shortCode: Roles.PROPOSAL_READER,
        config: config as ProposalReaderRolePermissions,
      };
    default:
      return {
        ...base,
        shortCode,
        config: {} as Record<string, never>,
      };
  }
}

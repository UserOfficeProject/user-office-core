import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { BasicResolverContext } from '../context';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { RoleDataSource } from '../datasources/RoleDataSource';
import { Authorized } from '../decorators';
import { Page } from '../models/Admin';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { InstitutionsFilter } from '../resolvers/queries/InstitutionsQuery';
import { defaultPageNoticeId, getContextKeys } from '../utils/helperFunctions';

type GetPageTextArgs = {
  pageId: number;
  agent: UserWithRole | null;
  roleIds: number[];
  useDefaultIfNotFound?: boolean;
};

@injectable()
export default class AdminQueries {
  constructor(
    @inject(Tokens.AdminDataSource) private adminDataSource: AdminDataSource,
    @inject(Tokens.RoleDataSource) private roleDataSource: RoleDataSource
  ) {}

  async getPageText({
    agent,
    pageId,
    roleIds,
    useDefaultIfNotFound = true,
  }: GetPageTextArgs): Promise<Page[]> {
    if (agent == null || !agent.currentRole) {
      return [];
    }

    let retrievedPageNotices: Page[] = [];
    const userRole = agent.currentRole;
    const userRoleTagIds = (
      await this.roleDataSource.getTagsByRoleId(userRole.id)
    ).map((t) => t.id);

    const isUserOfficer = userRole.shortCode === Roles.USER_OFFICER;
    const isBaseUserOfficer = isUserOfficer && userRole.isRootRole;
    const requestedRoleIds = roleIds.filter(
      (roleId) => roleId !== defaultPageNoticeId
    );

    const canReadRoleNotice = async (roleId: number) => {
      const isOwnRoleNotice = userRole.id === roleId;
      if (isOwnRoleNotice || isBaseUserOfficer) {
        return true;
      }

      if (!isUserOfficer) {
        return false;
      }

      const requestedRoleTagIds = (
        await this.roleDataSource.getTagsByRoleId(roleId)
      ).map((t) => t.id);

      return userRoleTagIds.some((t) => requestedRoleTagIds.includes(t));
    };

    const permissions = await Promise.all(
      requestedRoleIds.map(canReadRoleNotice)
    );
    const canReadAllRequestedNotices = permissions.every(Boolean);

    if (!canReadAllRequestedNotices) {
      logger.logWarn(
        'User does not have permission to fetch requested page notice',
        { agent, pageId, roleIds }
      );

      return [];
    }

    retrievedPageNotices = await this.adminDataSource.get(pageId, roleIds);

    //if no page notices specific to the requested roles were found, return the default one
    if (!retrievedPageNotices.length && useDefaultIfNotFound) {
      retrievedPageNotices = await this.adminDataSource.get(pageId, [
        defaultPageNoticeId,
      ]);
    }

    return retrievedPageNotices;
  }

  async getCountries() {
    return await this.adminDataSource.getCountries();
  }

  async getCountry(id: number) {
    return await this.adminDataSource.getCountry(id);
  }

  async getInstitutions(filter?: InstitutionsFilter) {
    return await this.adminDataSource.getInstitutions(filter);
  }

  async getInstitution(id: number) {
    return await this.adminDataSource.getInstitution(id);
  }

  async getFeatures() {
    return await this.adminDataSource.getFeatures();
  }

  async getSettings() {
    return await this.adminDataSource.getSettings();
  }

  async getPermissionsByToken(accessToken: string) {
    return await this.adminDataSource.getTokenAndPermissionsById(accessToken);
  }

  @Authorized([Roles.USER_OFFICER])
  async getTokenAndPermissionsById(
    agent: UserWithRole | null,
    accessTokenId: string
  ) {
    return await this.adminDataSource.getTokenAndPermissionsById(accessTokenId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllTokensAndPermissions(agent: UserWithRole | null) {
    return await this.adminDataSource.getAllTokensAndPermissions();
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllQueryMutationAndServicesMethods(
    agent: UserWithRole | null,
    context: BasicResolverContext
  ) {
    const allQueryMethods: string[] = getContextKeys(context, 'queries');
    const allMutationMethods: string[] = getContextKeys(context, 'mutations');
    const allServicesMethods: string[] = getContextKeys(context, 'services');

    // NOTE: If the scheduler is disabled we get undefined as scheduler client
    const scheduler = await context.clients.scheduler();

    if (scheduler) {
      try {
        const schedulerQueriesAndMutations =
          await scheduler.getQueriesAndMutations();

        if (schedulerQueriesAndMutations) {
          return {
            queries: [
              { groupName: 'core', items: allQueryMethods },
              {
                groupName: 'scheduler',
                items:
                  schedulerQueriesAndMutations.schedulerQueriesAndMutations
                    ?.queries,
              },
            ],
            mutations: [
              { groupName: 'core', items: allMutationMethods },
              {
                groupName: 'scheduler',
                items:
                  schedulerQueriesAndMutations.schedulerQueriesAndMutations
                    ?.mutations,
              },
            ],
            services: [{ groupName: 'core', items: allServicesMethods }],
          };
        }
      } catch (error) {
        logger.logException(
          'Failed while getting scheduler queries and mutations',
          error
        );
      }
    }

    return {
      queries: [{ groupName: 'core', items: allQueryMethods }],
      mutations: [{ groupName: 'core', items: allMutationMethods }],
      services: [{ groupName: 'core', items: allServicesMethods }],
    };
  }
}

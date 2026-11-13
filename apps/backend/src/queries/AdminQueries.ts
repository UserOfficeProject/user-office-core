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
import { getContextKeys } from '../utils/helperFunctions';

type GetPageTextArgs = {
  pageId: number;
  agent: UserWithRole | null;
  roleIds: number[];
};

@injectable()
export default class AdminQueries {
  constructor(
    @inject(Tokens.AdminDataSource) private adminDataSource: AdminDataSource,
    @inject(Tokens.RoleDataSource) private roleDataSource: RoleDataSource
  ) {}

  async getPageText({
    pageId,
    agent,
    roleIds,
  }: GetPageTextArgs): Promise<Page[]> {
    if (agent == null || !agent.currentRole) {
      return [];
    }

    const userRole = agent.currentRole;
    const userRoleTagIds = userRole.tags?.map((t) => t.id) ?? [];

    const nonDefaultPageRoleIds = roleIds.filter((roleId) => roleId != -1);

    //if the user is a root user officer or is fetching the default page notice only allow it, otherwise check permissions
    const tagsPermissions =
      userRole.shortCode === Roles.USER_OFFICER && userRole.isRootRole
        ? [true]
        : !nonDefaultPageRoleIds.length &&
            !!(roleIds.length - nonDefaultPageRoleIds.length)
          ? [true]
          : nonDefaultPageRoleIds.map(async (roleId) => {
              //if a user is fetching their own role's page notice
              if (userRole.id === roleId) {
                return true;
              }

              const roleTagIds = (
                await this.roleDataSource.getTagsByRoleId(roleId)
              ).map((t) => t.id);

              //check if they are a derived user officer that shares a tag with the requested page notice
              return !!(
                userRole.shortCode === Roles.USER_OFFICER &&
                userRoleTagIds.filter((t) => roleTagIds.includes(t)).length
              );
            });

    const resolvedPermissions = await Promise.all(tagsPermissions);

    if (resolvedPermissions.includes(false)) {
      logger.logWarn(
        'User does not have permission to fetch requested page notice',
        { agent, pageId, roleId: roleIds }
      );

      return [];
    }

    return this.adminDataSource.get(pageId, roleIds);
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

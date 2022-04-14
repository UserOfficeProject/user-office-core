import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { BasicResolverContext } from '../context';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { InstitutionsFilter } from './../resolvers/queries/InstitutionsQuery';

@injectable()
export default class AdminQueries {
  constructor(
    @inject(Tokens.AdminDataSource) private dataSource: AdminDataSource
  ) {}

  async getPageText(id: number): Promise<string | null> {
    return await this.dataSource.get(id);
  }

  async getNationalities() {
    return await this.dataSource.getNationalities();
  }

  async getCountries() {
    return await this.dataSource.getCountries();
  }

  async getCountry(id: number) {
    return await this.dataSource.getCountry(id);
  }

  async getInstitutions(filter?: InstitutionsFilter) {
    return await this.dataSource.getInstitutions(filter);
  }

  async getInstitution(id: number) {
    return await this.dataSource.getInstitution(id);
  }

  async getFeatures() {
    return await this.dataSource.getFeatures();
  }

  async getSettings() {
    return await this.dataSource.getSettings();
  }

  async getPermissionsByToken(accessToken: string) {
    return await this.dataSource.getTokenAndPermissionsById(accessToken);
  }

  @Authorized([Roles.USER_OFFICER])
  async getTokenAndPermissionsById(
    agent: UserWithRole | null,
    accessTokenId: string
  ) {
    return await this.dataSource.getTokenAndPermissionsById(accessTokenId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllTokensAndPermissions(agent: UserWithRole | null) {
    return await this.dataSource.getAllTokensAndPermissions();
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllQueryAndMutationMethods(
    agent: UserWithRole | null,
    context: BasicResolverContext
  ) {
    const allQueryMethods: string[] = [];
    const allMutationMethods: string[] = [];

    Object.keys(context.queries).forEach((queryKey) => {
      const element =
        context.queries[queryKey as keyof BasicResolverContext['queries']];

      const proto = Object.getPrototypeOf(element);
      const names = Object.getOwnPropertyNames(proto).filter((item) =>
        item.startsWith('get')
      );

      const classNamesWithMethod = names.map(
        (item) => `${proto.constructor.name}.${item}`
      );

      allQueryMethods.push(...classNamesWithMethod);
    });

    Object.keys(context.mutations).forEach((mutationKey) => {
      const element =
        context.mutations[
          mutationKey as keyof BasicResolverContext['mutations']
        ];

      const proto = Object.getPrototypeOf(element);
      const names = Object.getOwnPropertyNames(proto).filter(
        (item) => item !== 'constructor'
      );

      const classNamesWithMethod = names.map(
        (item) => `${proto.constructor.name}.${item}`
      );

      allMutationMethods.push(...classNamesWithMethod);
    });

    return { queries: allQueryMethods, mutations: allMutationMethods };
  }
}

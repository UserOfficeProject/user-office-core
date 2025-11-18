import { logger } from '@user-office-software/duo-logger';
import {
  addUserRoleValidationSchema,
  deleteUserValidationSchema,
  getTokenForUserValidationSchema,
  updateUserRolesValidationSchema,
  updateUserValidationBackendSchema,
} from '@user-office-software/duo-validation';
import * as bcrypt from 'bcryptjs';
import { inject, injectable } from 'tsyringe';
import { Args } from 'type-graphql';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { rejection, Rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import { AuthJwtPayload, User, UserRole, UserWithRole } from '../models/User';
import { AddUserRoleArgs } from '../resolvers/mutations/AddUserRoleMutation';
import {
  UpdateUserRolesArgs,
  UpdateUserByOidcSubArgs,
  UpdateUserByIdArgs,
} from '../resolvers/mutations/UpdateUserMutation';
import { UpsertUserByOidcSubArgs } from '../resolvers/mutations/UpsertUserMutation';
import { signToken, verifyToken } from '../utils/jwt';
import { ApolloServerErrorCodeExtended } from '../utils/utilTypes';

@injectable()
export default class UserMutations {
  constructor(
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.UserDataSource) private dataSource: UserDataSource
  ) {}

  createHash(password: string): string {
    //Check that password follows rules

    //Setting fixed salt for development
    //const salt = bcrypt.genSaltSync(10);
    const salt = '$2a$10$1svMW3/FwE5G1BpE7/CPW.';
    const hash = bcrypt.hashSync(password, salt);

    return hash;
  }

  @ValidateArgs(deleteUserValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.USER_DELETED)
  async delete(
    agent: UserWithRole | null,
    { id }: { id: number }
  ): Promise<User | Rejection> {
    const user = await this.dataSource.delete(id);
    if (!user) {
      return rejection('Can not delete user because user does not exist', {
        id,
        agent,
        code: ApolloServerErrorCodeExtended.NOT_FOUND,
      });
    }

    return user;
  }

  @ValidateArgs(updateUserValidationBackendSchema)
  @Authorized()
  @EventBus(Event.USER_UPDATED)
  async update(
    agent: UserWithRole | null,
    args: UpdateUserByIdArgs
  ): Promise<User | Rejection> {
    const isUpdatingOwnUser = agent?.id === args.id;
    if (
      !this.userAuth.isApiToken(agent) &&
      !this.userAuth.isUserOfficer(agent) &&
      !isUpdatingOwnUser
    ) {
      return rejection(
        'Can not update user because of insufficient permissions',
        {
          args,
          agent,
          code: ApolloServerErrorCodeExtended.INSUFFICIENT_PERMISSIONS,
        }
      );
    }

    let user = await this.dataSource.getUser(args.id); //Hacky

    if (!user) {
      return rejection('Can not update user because user does not exist', {
        args,
        agent,
        code: ApolloServerErrorCodeExtended.NOT_FOUND,
      });
    }

    user = {
      ...user,
      ...args,
    };

    return this.dataSource
      .update(user)
      .then((user) => user)
      .catch((err) => {
        return rejection('Could not update user', { user }, err);
      });
  }

  @ValidateArgs(updateUserRolesValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.USER_ROLE_UPDATED)
  async updateRoles(
    agent: UserWithRole | null,
    args: UpdateUserRolesArgs
  ): Promise<User | Rejection> {
    const user = await this.dataSource.getUser(args.id);

    if (!user) {
      return rejection('Can not update role because user does not exist', {
        args,
        agent,
        code: ApolloServerErrorCodeExtended.NOT_FOUND,
      });
    }

    return this.dataSource
      .setUserRoles(args.id, args.roles)
      .then(() => user)
      .catch((err) => {
        return rejection(
          'Can not update user because an error occurred',
          {
            args,
            agent,
          },
          err
        );
      });
  }

  @Authorized()
  @EventBus(Event.USER_UPDATED)
  async updateUserByOidcSub(
    agent: UserWithRole | null,
    @Args() args: UpdateUserByOidcSubArgs
  ): Promise<User | Rejection> {
    const isUpdatingOwnUser = agent?.oidcSub === args.oidcSub;
    if (
      !this.userAuth.isApiToken(agent) &&
      !this.userAuth.isUserOfficer(agent) &&
      !isUpdatingOwnUser
    ) {
      return rejection(
        'Can not update user because of insufficient permissions',
        {
          args,
          agent,
          code: ApolloServerErrorCodeExtended.INSUFFICIENT_PERMISSIONS,
        }
      );
    }

    try {
      const updatedUser = await this.dataSource.updateUserByOidcSub(args);

      if (!updatedUser) {
        return rejection(
          'USER_NOT_FOUND',
          { oidcSub: args.oidcSub },
          new Error(`User with OIDC sub ${args.oidcSub} not found`)
        );
      }

      return updatedUser;
    } catch (error) {
      return rejection(
        'INTERNAL_ERROR',
        { agent, args },
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  @ValidateArgs(getTokenForUserValidationSchema)
  @Authorized()
  async getTokenForUser(
    agent: UserWithRole | null,
    { userId }: { userId: number }
  ): Promise<string | Rejection> {
    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    const isImpersonatedUser = typeof agent?.impersonatingUserId === 'number';
    const shouldImpersonateUser = agent?.impersonatingUserId !== userId;

    // NOTE: This is checking if person trying to impersonate user is not user officer then reject.
    if (!isImpersonatedUser && !isUserOfficer) {
      return rejection(
        'Can not impersonate user because of insufficient permissions',
        { userId, code: ApolloServerErrorCodeExtended.INSUFFICIENT_PERMISSIONS }
      );
    }

    if (isImpersonatedUser && isUserOfficer && shouldImpersonateUser) {
      return rejection(
        'Can not impersonate user with already impersonated user',
        { userId, code: ApolloServerErrorCodeExtended.BAD_REQUEST }
      );
    }

    // NOTE: This is checking if person trying to impersonate another user is not the impersonating user then reject also.
    if (isImpersonatedUser && shouldImpersonateUser) {
      return rejection(
        'Can not impersonate user because of insufficient permissions',
        { userId, code: ApolloServerErrorCodeExtended.INSUFFICIENT_PERMISSIONS }
      );
    }

    const user = await this.dataSource.getUser(userId);

    if (!user) {
      return rejection(
        'Can not get token for user because user does not exist',
        { userId, code: ApolloServerErrorCodeExtended.NOT_FOUND }
      );
    }

    const roles = await this.dataSource.getUserRoles(user.id);
    const token = signToken<AuthJwtPayload>({
      user,
      roles,
      currentRole: roles[0],
      isInternalUser: false,
      externalToken: agent?.externalToken,
      impersonatingUserId:
        isUserOfficer && shouldImpersonateUser ? agent?.id : undefined,
    });

    if (isUserOfficer && shouldImpersonateUser && agent) {
      logger.logInfo(`userId: ${agent.id} impersonating userId: ${userId}`, {});
    }

    return token;
  }

  async token(token: string): Promise<string | Rejection> {
    try {
      const decoded = verifyToken<AuthJwtPayload>(token);
      const roles = await this.dataSource.getUserRoles(decoded.user.id);
      const freshToken = signToken<AuthJwtPayload>({
        user: decoded.user,
        roles,
        currentRole: decoded.currentRole,
        isInternalUser: decoded.isInternalUser,
        externalToken: decoded.externalToken,
      });

      return freshToken;
    } catch (error) {
      return rejection(
        'Bad token',
        {
          token,
          code: ApolloServerErrorCodeExtended.INVALID_TOKEN,
        },
        error
      );
    }
  }

  async externalTokenLogin(
    externalToken: string,
    redirecturi: string,
    iss: string | null
  ): Promise<string | Rejection> {
    try {
      const user = await this.userAuth.externalTokenLogin(
        externalToken,
        redirecturi,
        iss
      );

      if (!user) {
        return rejection('User not found', {
          externalToken,
          code: ApolloServerErrorCodeExtended.NOT_FOUND,
        });
      }

      const roles = await this.dataSource.getUserRoles(user.id);
      const isInternalUser = await this.userAuth.isInternalUser(
        user.id,
        roles[0]
      );

      // Set the current role to the highest possible, user officer, instrument scientist, FAP Panel member, user
      const currentRole =
        roles.find((role) => role.shortCode === Roles.USER_OFFICER) ||
        roles.find((role) => role.shortCode === Roles.INSTRUMENT_SCIENTIST) ||
        roles.find((role) => role.shortCode === Roles.FAP_CHAIR) ||
        roles.find((role) => role.shortCode === Roles.FAP_SECRETARY) ||
        roles.find((role) => role.shortCode === Roles.FAP_REVIEWER) ||
        roles[0];

      const uosToken = signToken<AuthJwtPayload>({
        user: {
          created: user.created,
          email: user.email,
          firstname: user.firstname,
          id: user.id,
          lastname: user.lastname,
          oidcSub: user.oidcSub,
          institutionId: user.institutionId,
          preferredname: user.preferredname,
        },
        roles,
        currentRole,
        isInternalUser: isInternalUser,
        externalToken: externalToken,
      });

      return uosToken;
    } catch (error) {
      return rejection(
        (error as Error).message ||
          'Error occurred during external authentication',
        {},
        error
      );
    }
  }

  async logout(token: string): Promise<string | Rejection> {
    try {
      const decodedToken = verifyToken<AuthJwtPayload>(token);

      return this.userAuth.logout(decodedToken);
    } catch (error) {
      return rejection(
        'Error occurred during logout',
        {
          code: ApolloServerErrorCodeExtended.INVALID_TOKEN,
        },
        error
      );
    }
  }

  async selectRole(
    token: string,
    selectedRoleId: number
  ): Promise<string | Rejection> {
    try {
      const decoded = verifyToken<AuthJwtPayload>(token);

      const currentRole = decoded.roles?.find(
        (role: Role) => role.id === selectedRoleId
      );

      if (!currentRole) {
        return rejection('User role not found', {
          selectedRoleId,
          code: ApolloServerErrorCodeExtended.NOT_FOUND,
        });
      }

      const tokenWithRole = signToken<AuthJwtPayload>({
        user: decoded.user,
        roles: decoded.roles,
        currentRole,
        isInternalUser: decoded.isInternalUser,
        externalToken: decoded.externalToken,
        impersonatingUserId: decoded.impersonatingUserId,
      });

      return tokenWithRole;
    } catch (error) {
      return rejection(
        'Bad token',
        {
          selectedRoleId,
          code: ApolloServerErrorCodeExtended.INVALID_TOKEN,
        },
        error
      );
    }
  }

  @ValidateArgs(addUserRoleValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async addUserRole(agent: UserWithRole | null, args: AddUserRoleArgs) {
    return this.dataSource
      .addUserRole(args)
      .then(() => true)
      .catch((err) =>
        rejection('Could not add user role', { agent, args }, err)
      );
  }

  @Authorized([Roles.USER_OFFICER])
  setUserNotPlaceholder(
    _: UserWithRole | null,
    id: number
  ): Promise<User | null> {
    return this.dataSource.setUserNotPlaceholder(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async upsertUserByOidcSub(
    agent: UserWithRole | null,
    args: UpsertUserByOidcSubArgs
  ) {
    const {
      userTitle,
      firstName,
      lastName,
      preferredName,
      oidcSub,
      institutionRoRId,
      institutionName,
      institutionCountry,
      email,
    } = args;

    const userWithOAuthSubMatch = await this.dataSource.getByOIDCSub(oidcSub);

    const institution = await this.userAuth.getOrCreateUserInstitution({
      institution_ror_id: institutionRoRId,
      institution_name: institutionName,
      institution_country: institutionCountry,
    });

    if (!institution) {
      return rejection('Invalid Input for the Institution', {
        institutionRoRId,
        args,
      });
    }

    if (userWithOAuthSubMatch) {
      const updatedUser = await this.dataSource.update({
        ...userWithOAuthSubMatch,
        email,
        firstname: firstName,
        lastname: lastName,
        oidcSub: oidcSub,
        institutionId: institution.id,
        preferredname: preferredName ?? undefined,
        user_title: userTitle ?? undefined,
      });

      return updatedUser;
    } else {
      const newUser = await this.dataSource.create(
        userTitle ?? '',
        firstName,
        lastName,
        preferredName ?? '',
        oidcSub,
        '',
        '',
        institution.id,
        email
      );

      await this.dataSource.addUserRole({
        userID: newUser.id,
        roleID: UserRole.USER,
      });

      return newUser;
    }
  }
}

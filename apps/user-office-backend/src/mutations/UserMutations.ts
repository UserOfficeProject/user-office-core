import {
  addUserRoleValidationSchema,
  createUserByEmailInviteValidationSchema,
  createUserValidationSchema,
  deleteUserValidationSchema,
  getTokenForUserValidationSchema,
  resetPasswordByEmailValidationSchema,
  updatePasswordValidationSchema,
  updateUserRolesValidationSchema,
  updateUserValidationSchema,
  userPasswordFieldBEValidationSchema,
} from '@user-office-software/duo-validation';
import * as bcrypt from 'bcryptjs';
import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { RedeemCodesDataSource } from '../datasources/RedeemCodesDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { EmailInviteResponse } from '../models/EmailInviteResponse';
import { isRejection, rejection, Rejection } from '../models/Rejection';
import { Role, Roles } from '../models/Role';
import {
  AuthJwtPayload,
  BasicUserDetails,
  EmailVerificationJwtPayload,
  PasswordResetJwtPayload,
  User,
  UserRole,
  UserRoleShortCodeMap,
  UserWithRole,
} from '../models/User';
import { UserLinkResponse } from '../models/UserLinkResponse';
import { AddUserRoleArgs } from '../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../resolvers/mutations/CreateUserByEmailInviteMutation';
import { CreateUserArgs } from '../resolvers/mutations/CreateUserMutation';
import {
  UpdateUserArgs,
  UpdateUserRolesArgs,
} from '../resolvers/mutations/UpdateUserMutation';
import { signToken, verifyToken } from '../utils/jwt';
import { ApolloServerErrorCodeExtended } from '../utils/utilTypes';

@injectable()
export default class UserMutations {
  constructor(
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.UserDataSource) private dataSource: UserDataSource,
    @inject(Tokens.RedeemCodesDataSource)
    private redeemCodeDataSource: RedeemCodesDataSource
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

  createEmailInviteResponse(userId: number, agentId: number, role: UserRole) {
    return new EmailInviteResponse(userId, agentId, role);
  }

  @ValidateArgs(createUserByEmailInviteValidationSchema(UserRole))
  @Authorized()
  @EventBus(Event.EMAIL_INVITE)
  async createUserByEmailInvite(
    agent: UserWithRole | null,
    args: CreateUserByEmailInviteArgs
  ): Promise<EmailInviteResponse> {
    let userId: number | null = null;
    let role: UserRole = args.userRole;

    if (!agent) {
      throw rejection('Agent is not defined', {
        agent,
        args,
        code: ApolloServerErrorCodeExtended.INVALID_TOKEN,
      });
    }
    // Check if email exist in database and if user has been invited before
    const user = await this.dataSource.getByEmail(args.email);
    if (user && user.placeholder) {
      userId = user.id;

      return this.createEmailInviteResponse(userId, agent.id, role);
    } else if (user) {
      throw rejection('Can not create account because account already exists', {
        args,
        code: ApolloServerErrorCodeExtended.BAD_REQUEST,
      });
    }

    if (
      args.userRole === UserRole.SEP_REVIEWER &&
      this.userAuth.isUserOfficer(agent)
    ) {
      userId = await this.dataSource.createInviteUser(args);

      const newUserRole = await this.dataSource.getRoleByShortCode(
        UserRoleShortCodeMap[role]
      );

      await this.dataSource.setUserRoles(userId, [newUserRole.id]);
      role = UserRole.SEP_REVIEWER;
    } else if (args.userRole === UserRole.USER) {
      userId = await this.dataSource.createInviteUser(args);

      const newUserRole = await this.dataSource.getRoleByShortCode(
        UserRoleShortCodeMap[role]
      );

      await this.dataSource.setUserRoles(userId, [newUserRole.id]);
      role = UserRole.USER;
    } else if (
      args.userRole === UserRole.SEP_CHAIR &&
      this.userAuth.isUserOfficer(agent)
    ) {
      // NOTE: For inviting SEP_CHAIR and SEP_SECRETARY we do not setUserRoles because they are set right after in separate call.
      userId = await this.dataSource.createInviteUser(args);
      role = UserRole.SEP_CHAIR;
    } else if (
      args.userRole === UserRole.SEP_SECRETARY &&
      this.userAuth.isUserOfficer(agent)
    ) {
      userId = await this.dataSource.createInviteUser(args);
      role = UserRole.SEP_SECRETARY;
    } else if (
      args.userRole === UserRole.INSTRUMENT_SCIENTIST &&
      this.userAuth.isUserOfficer(agent)
    ) {
      userId = await this.dataSource.createInviteUser(args);
      role = UserRole.INSTRUMENT_SCIENTIST;
    }

    if (!userId) {
      throw rejection('Can not create user for this role', {
        args,
      });
    } else {
      await this.redeemCodeDataSource.createRedeemCode(userId, agent.id);

      return this.createEmailInviteResponse(userId, agent.id, role);
    }
  }

  @ValidateArgs(createUserValidationSchema)
  @EventBus(Event.USER_CREATED)
  async create(
    agent: UserWithRole | null,
    args: CreateUserArgs
  ): Promise<UserLinkResponse> {
    if (process.env.NODE_ENV !== 'development') {
      throw rejection('Users can only be created on development env', {
        args,
        code: ApolloServerErrorCodeExtended.BAD_REQUEST,
      });
    }

    const hash = this.createHash(args.password);
    let organisationId = args.organisation;
    // Check if user has other org and if so create it
    if (args.otherOrganisation) {
      organisationId = await this.dataSource.createOrganisation(
        args.otherOrganisation,
        false,
        args.organizationCountry
      );
    }

    //Check if email exist in database and if user has been invited
    let user = await this.dataSource.getByEmail(args.email);

    if (user && user.placeholder) {
      const changePassword = await this.updatePassword(agent, {
        id: user.id,
        password: args.password,
      });
      //update user record and set placeholder flag to false
      const updatedUser = await this.dataSource
        .update({
          ...user,
          ...args,
          placeholder: false,
        })
        .then((user) => user)
        .catch((err) => {
          throw rejection('Could not update user', { user }, err);
        });

      if (isRejection(updatedUser) || !changePassword) {
        throw rejection('Can not create user', {
          updatedUser,
          changePassword,
        });
      }
      user = updatedUser;
    } else if (user) {
      throw rejection('Can not create user because account already exists', {
        args,
      });
    } else {
      try {
        user = await this.dataSource.create(
          args.user_title,
          args.firstname,
          args.middlename,
          args.lastname,
          `${args.firstname}.${args.lastname}`, // This is just for now, while we decide on the final format
          hash,
          args.preferredname,
          '',
          '',
          '',
          '',
          args.gender,
          args.nationality,
          args.birthdate,
          organisationId,
          args.department,
          args.position,
          args.email,
          args.telephone,
          args.telephone_alt
        );
      } catch (error) {
        // NOTE: We are explicitly casting error to { code: string } type because it is the easiest solution for now and because it's type is a bit difficult to determine because of knexjs not returning typed error message.
        const errorCode = (error as { code: string }).code;

        if (errorCode === '23503' || errorCode === '23505') {
          throw rejection(
            'Can not create user because account already exists',
            { args },
            error
          );
        }
      }
    }

    if (!user) {
      throw rejection('Can not create user', { args });
    }

    const roles = await this.dataSource.getUserRoles(user.id);

    // If user has no role assign it the user role
    if (!roles.length) {
      this.dataSource.setUserRoles(user.id, [UserRole.USER]);
    }

    const token = signToken<EmailVerificationJwtPayload>(
      {
        id: user.id,
        type: 'emailVerification',
        updated: user.updated,
      },
      { expiresIn: '24h' }
    );

    // Email verification link
    const link = process.env.baseURL + '/emailVerification/' + token;

    // NOTE: This uses UserLinkResponse class because output should be standardized for all events where we use EventBusDecorator.
    const userLinkResponse = new UserLinkResponse(user, link);

    return userLinkResponse;
  }

  @ValidateArgs(updateUserValidationSchema)
  @Authorized()
  @EventBus(Event.USER_UPDATED)
  async update(
    agent: UserWithRole | null,
    args: UpdateUserArgs
  ): Promise<User | Rejection> {
    const isUpdatingOwnUser = agent?.id === args.id;
    if (!this.userAuth.isUserOfficer(agent) && !isUpdatingOwnUser) {
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

    let organisationId = args.organisation;
    // Check if user has other as selected org and if so create it
    if (args.otherOrganisation) {
      organisationId = await this.dataSource.createOrganisation(
        args.otherOrganisation,
        false,
        args.organizationCountry
      );
    }

    user = {
      ...user,
      ...args,
      organisation: organisationId ?? user.organisation,
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
      impersonatingUserId:
        isUserOfficer && shouldImpersonateUser ? agent?.id : undefined,
    });

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
    redirecturi: string
  ): Promise<string | Rejection> {
    try {
      const user = await this.userAuth.externalTokenLogin(
        externalToken,
        redirecturi
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

      // Set the current role to the highest possible, user officer, instrument scientist, user
      const currentRole =
        roles.find((role) => role.shortCode === Roles.USER_OFFICER) ||
        roles.find((role) => role.shortCode === Roles.INSTRUMENT_SCIENTIST) ||
        roles[0];

      const uosToken = signToken<AuthJwtPayload>({
        user: {
          created: user.created,
          email: user.email,
          firstname: user.firstname,
          id: user.id,
          lastname: user.lastname,
          oidcSub: user.oidcSub,
          organisation: user.organisation,
          placeholder: user.placeholder,
          position: user.position,
          preferredname: user.preferredname,
        },
        roles,
        currentRole,
        isInternalUser: isInternalUser,
        externalToken: externalToken,
      });

      return uosToken;
    } catch (exception) {
      return rejection(
        'Error occurred during external authentication',
        {},
        exception
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

  @ValidateArgs(resetPasswordByEmailValidationSchema)
  @EventBus(Event.USER_PASSWORD_RESET_EMAIL)
  async resetPasswordEmail(
    agent: UserWithRole | null,
    args: { email: string }
  ): Promise<UserLinkResponse | Rejection> {
    const user = await this.dataSource.getByEmail(args.email);

    if (!user) {
      return rejection('Could not find user by email', {
        args,
        code: ApolloServerErrorCodeExtended.NOT_FOUND,
      });
    }

    const token = signToken<PasswordResetJwtPayload>(
      {
        id: user.id,
        type: 'passwordReset',
        updated: user.updated,
      },
      { expiresIn: '24h' }
    );

    const link = process.env.baseURL + '/resetPassword/' + token;

    const userLinkResponse = new UserLinkResponse(user, link);

    // Send reset email with link
    return userLinkResponse;
  }

  async emailVerification(token: string) {
    // Check that token is valid
    try {
      const decoded = verifyToken<EmailVerificationJwtPayload>(token);
      const user = await this.dataSource.getUser(decoded.id);
      //Check that user exist
      if (user && decoded.type === 'emailVerification') {
        await this.dataSource.setUserEmailVerified(user.id);

        return true;
      } else {
        return rejection('Can not verify user', { user, decoded });
      }
    } catch (error) {
      return rejection(
        'Can not verify email, please contact user office for help',
        {},
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

  @ValidateArgs(updatePasswordValidationSchema)
  @Authorized()
  async updatePassword(
    agent: UserWithRole | null,
    { id, password }: { id: number; password: string }
  ): Promise<BasicUserDetails | Rejection> {
    const isUpdatingOwnUser = agent?.id === id;
    if (!this.userAuth.isUserOfficer(agent) && !isUpdatingOwnUser) {
      return rejection(
        'Can not update password because of insufficient permissions',
        {
          id,
          agent,
          code: ApolloServerErrorCodeExtended.INSUFFICIENT_PERMISSIONS,
        }
      );
    }

    try {
      const hash = this.createHash(password);
      const user = await this.dataSource.getUser(id);
      if (user) {
        return this.dataSource.setUserPassword(user.id, hash);
      } else {
        return rejection('Could not update password. Used does not exist', {
          agent,
          id,
          code: ApolloServerErrorCodeExtended.NOT_FOUND,
        });
      }
    } catch (error) {
      return rejection(
        'Could not update password',
        {
          agent,
          id,
        },
        error
      );
    }
  }

  @ValidateArgs(userPasswordFieldBEValidationSchema)
  async resetPassword(
    agent: UserWithRole | null,
    { token, password }: { token: string; password: string }
  ): Promise<BasicUserDetails | Rejection> {
    // Check that token is valid
    try {
      const hash = this.createHash(password);
      const decoded = verifyToken<PasswordResetJwtPayload>(token);
      const user = await this.dataSource.getUser(decoded.id);

      //Check that user exist and that it has not been updated since token creation
      if (
        user &&
        user.updated === decoded.updated &&
        decoded.type === 'passwordReset'
      ) {
        return this.dataSource
          .setUserPassword(user.id, hash)
          .then((user) => user)
          .catch((err) => rejection('Could not reset password', { user }, err));
      }

      return rejection('Could not reset password incomplete data', {
        user,
        decoded,
        code: ApolloServerErrorCodeExtended.BAD_USER_INPUT,
      });
    } catch (error) {
      return rejection('Could not reset password', {}, error);
    }
  }

  @Authorized([Roles.USER_OFFICER])
  setUserEmailVerified(
    _: UserWithRole | null,
    id: number
  ): Promise<User | null> {
    return this.dataSource.setUserEmailVerified(id);
  }

  @Authorized([Roles.USER_OFFICER])
  setUserNotPlaceholder(
    _: UserWithRole | null,
    id: number
  ): Promise<User | null> {
    return this.dataSource.setUserNotPlaceholder(id);
  }
}

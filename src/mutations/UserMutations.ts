import {
  deleteUserValidationSchema,
  createUserByEmailInviteValidationSchema,
  createUserValidationSchema,
  updateUserValidationSchema,
  updateUserRolesValidationSchema,
  signInValidationSchema,
  getTokenForUserValidationSchema,
  resetPasswordByEmailValidationSchema,
  addUserRoleValidationSchema,
  updatePasswordValidationSchema,
  userPasswordFieldBEValidationSchema,
} from '@esss-swap/duo-validation';
import * as bcrypt from 'bcryptjs';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import UOWSSoapClient from '../datasources/stfc/UOWSSoapInterface';
import { UserDataSource } from '../datasources/UserDataSource';
import { EventBus, Authorized, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { EmailInviteResponse } from '../models/EmailInviteResponse';
import { isRejection, rejection, Rejection } from '../models/Rejection';
import { Roles, Role } from '../models/Role';
import {
  User,
  BasicUserDetails,
  UserWithRole,
  EmailVerificationJwtPayload,
  AuthJwtPayload,
  PasswordResetJwtPayload,
} from '../models/User';
import { UserRole } from '../models/User';
import { UserLinkResponse } from '../models/UserLinkResponse';
import { AddUserRoleArgs } from '../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../resolvers/mutations/CreateUserByEmailInviteMutation';
import { CreateUserArgs } from '../resolvers/mutations/CreateUserMutation';
import {
  UpdateUserArgs,
  UpdateUserRolesArgs,
} from '../resolvers/mutations/UpdateUserMutation';
import { signToken, verifyToken } from '../utils/jwt';
import { UserAuthorization } from '../utils/UserAuthorization';

@injectable()
export default class UserMutations {
  constructor(
    @inject(Tokens.UserDataSource) private dataSource: UserDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
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
  ): Promise<EmailInviteResponse | Rejection> {
    let userId: number | null = null;
    let role: UserRole = args.userRole;
    // Check if email exist in database and if user has been invited before
    const user = await this.dataSource.getByEmail(args.email);
    if (user && user.placeholder) {
      userId = user.id;

      return this.createEmailInviteResponse(userId, (agent as User).id, role);
    } else if (user) {
      return rejection(
        'Can not create account because account already exists',
        { args }
      );
    }

    if (
      args.userRole === UserRole.SEP_REVIEWER &&
      this.userAuth.isUserOfficer(agent)
    ) {
      userId = await this.dataSource.createInviteUser(args);
      await this.dataSource.setUserRoles(userId, [UserRole.SEP_REVIEWER]);
      role = UserRole.SEP_REVIEWER;
    } else if (args.userRole === UserRole.USER) {
      userId = await this.dataSource.createInviteUser(args);
      await this.dataSource.setUserRoles(userId, [UserRole.USER]);
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
      return rejection('Can not create user for this role', {
        args,
      });
    } else {
      return this.createEmailInviteResponse(userId, (agent as User).id, role);
    }
  }

  @ValidateArgs(createUserValidationSchema)
  @EventBus(Event.USER_CREATED)
  async create(
    agent: UserWithRole | null,
    args: CreateUserArgs
  ): Promise<UserLinkResponse | Rejection> {
    if (
      this.createHash(args.orcid) !== args.orcidHash &&
      !(process.env.NODE_ENV === 'development')
    ) {
      return rejection('Can not create user because of ORCID hash mismatch', {
        args,
      });
    }

    const hash = this.createHash(args.password);
    let organisationId = args.organisation;
    // Check if user has other org and if so create it
    if (args.otherOrganisation) {
      organisationId = await this.dataSource.createOrganisation(
        args.otherOrganisation,
        false
      );
    }

    //Check if email exist in database and if user has been invited
    let user = (await this.dataSource.getByEmail(args.email)) as UserWithRole;

    if (user && user.placeholder) {
      const changePassword = await this.updatePassword(user, {
        id: user.id,
        password: args.password,
      });
      const updatedUser = (await this.update(user, {
        id: user.id,
        placeholder: false,
        ...args,
      })) as UserWithRole;

      if (isRejection(updatedUser) || !changePassword) {
        return rejection('Can not create user', {
          updatedUser,
          changePassword,
        });
      }
      user = updatedUser;
    } else if (user) {
      return rejection('Can not create user because account already exists', {
        args,
      });
    } else {
      try {
        user = (await this.dataSource.create(
          args.user_title,
          args.firstname,
          args.middlename,
          args.lastname,
          `${args.firstname}.${args.lastname}.${args.orcid}`, // This is just for now, while we decide on the final format
          hash,
          args.preferredname,
          args.orcid,
          args.refreshToken,
          args.gender,
          args.nationality,
          args.birthdate,
          organisationId,
          args.department,
          args.position,
          args.email,
          args.telephone,
          args.telephone_alt
        )) as UserWithRole;
      } catch (error) {
        if ('code' in error && error.code === '23505') {
          return rejection(
            'Can not create user because account already exists',
            { args },
            error
          );
        }
      }
    }

    const roles = await this.dataSource.getUserRoles(user.id);

    //If user has no role assign it the user role
    if (!roles.length) {
      this.dataSource.setUserRoles(user.id, [UserRole.USER]);
    }

    if (!user) {
      return rejection('Could not create user', { args });
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
  @Authorized([Roles.USER_OFFICER, Roles.USER])
  @EventBus(Event.USER_UPDATED)
  async update(
    agent: UserWithRole | null,
    args: UpdateUserArgs
  ): Promise<User | Rejection> {
    const isUpdatingOwnUser = agent?.id === args.id;
    if (!this.userAuth.isUserOfficer(agent) && !isUpdatingOwnUser) {
      return rejection(
        'Can not update user because of insufficient permissions',
        { args, agent }
      );
    }

    let user = await this.dataSource.getUser(args.id); //Hacky

    if (!user) {
      return rejection('Can not update user because user does not exist', {
        args,
        agent,
      });
    }

    delete args.orcid;
    delete args.refreshToken;

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
      });
    }

    return this.dataSource
      .setUserRoles(args.id, args.roles)
      .then(() => user)
      .catch((err) => {
        return rejection(
          'Can not update user because an error occurred',
          { args, agent },
          err
        );
      });
  }

  @ValidateArgs(signInValidationSchema)
  async login(
    agent: UserWithRole | null,
    args: { email: string; password: string }
  ): Promise<string | Rejection> {
    const user = await this.dataSource.getByEmail(args.email);

    if (!user) {
      return rejection('Wrong username or password');
    }
    const roles = await this.dataSource.getUserRoles(user.id);
    const result = await this.dataSource.getPasswordByEmail(args.email);

    if (!result) {
      return rejection('Wrong username or password');
    }

    const valid = bcrypt.compareSync(args.password, result);

    if (!valid) {
      return rejection('Wrong email or password');
    }

    if (!user.emailVerified) {
      return rejection('Email is not verified');
    }

    const token = signToken<AuthJwtPayload>({
      user,
      roles,
      currentRole: roles[0],
    });

    return token;
  }

  @ValidateArgs(getTokenForUserValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async getTokenForUser(
    agent: UserWithRole | null,
    { userId }: { userId: number }
  ): Promise<string | Rejection> {
    const user = await this.dataSource.getUser(userId);

    if (!user) {
      return rejection(
        'Can not get token for user because user does not exist',
        { userId }
      );
    }

    const roles = await this.dataSource.getUserRoles(user.id);
    const token = signToken<AuthJwtPayload>({
      user,
      roles,
      currentRole: roles[0],
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
      });

      return freshToken;
    } catch (error) {
      return rejection('Bad token', { token }, error);
    }
  }

  async checkExternalToken(externalToken: string): Promise<string | Rejection> {
    try {
      const client = new UOWSSoapClient();

      const rawStfcUser = await client.getPersonDetailsFromSessionId(
        externalToken
      );
      if (!rawStfcUser) {
        return rejection('User not found', { externalToken });
      }
      const stfcUser = rawStfcUser.return;

      // Create dummy user if one does not exist in the proposals DB.
      // This is needed to satisfy the FOREIGN_KEY constraints
      // in tables that link to a user (such as proposals)
      const userNumber = parseInt(stfcUser.userNumber);
      const dummyUser = await this.dataSource.ensureDummyUserExists(userNumber);
      const roles = await this.dataSource.getUserRoles(dummyUser.id);

      const proposalsToken = signToken<AuthJwtPayload>({
        user: dummyUser,
        roles,
        currentRole: roles[0], // User role
      });

      return proposalsToken;
    } catch (error) {
      return rejection(
        'Error occurred during external authentication',
        {},
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

      // TODO: fixme
      const currentRole = decoded.roles.find(
        (role: Role) => role.id === selectedRoleId
      )!;

      const tokenWithRole = signToken<AuthJwtPayload>({
        user: decoded.user,
        roles: decoded.roles,
        currentRole,
      });

      return tokenWithRole;
    } catch (error) {
      return rejection('Bad token', { selectedRoleId }, error);
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
      return rejection('Could not find user by email', { args });
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
      //Check that user exist and that it has not been updated since token creation
      if (
        user &&
        user.updated === decoded.updated &&
        decoded.type === 'emailVerification'
      ) {
        await this.dataSource.setUserEmailVerified(user.id);

        return true;
      } else {
        return rejection('Can not verify user', { user });
      }
    } catch (error) {
      return rejection('Can not verify email', {}, error);
    }
  }

  @ValidateArgs(addUserRoleValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async addUserRole(agent: UserWithRole | null, args: AddUserRoleArgs) {
    return this.dataSource
      .addUserRole(args)
      .then(() => true)
      .catch((err) => {
        return rejection('Could not add user role', { agent, args }, err);
      });
  }

  @ValidateArgs(updatePasswordValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.USER])
  async updatePassword(
    agent: UserWithRole | null,
    { id, password }: { id: number; password: string }
  ): Promise<BasicUserDetails | Rejection> {
    const isUpdatingOwnUser = agent?.id === id;
    if (!this.userAuth.isUserOfficer(agent) && !isUpdatingOwnUser) {
      return rejection(
        'Can not update password because of insufficient permissions',
        { id, agent }
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
        });
      }
    } catch (error) {
      return rejection('Could not update password', { agent, id }, error);
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
          .catch((err) => {
            return rejection('Could not reset password', { user }, err);
          });
      }

      return rejection('Could not reset password incomplete data', {
        user,
        decoded,
      });
    } catch (error) {
      return rejection('Could not reset password', { error, token });
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

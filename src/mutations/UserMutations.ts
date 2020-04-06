import { to } from 'await-to-js';
import * as bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

import { UserDataSource } from '../datasources/UserDataSource';
import { Event } from '../events/event.enum';
import { EventBusDecorator } from '../events/EventBusDecorator';
import { ResetPasswordResponse } from '../models/ResetPasswordResponse';
import { User, checkUserArgs, BasicUserDetails } from '../models/User';
import { UserRole } from '../models/User';
import { isRejection, rejection, Rejection } from '../rejection';
import { AddUserRoleArgs } from '../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../resolvers/mutations/CreateUserByEmailInviteMutation';
import { CreateUserArgs } from '../resolvers/mutations/CreateUserMutation';
import { UpdateUserArgs } from '../resolvers/mutations/UpdateUserMutation';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class UserMutations {
  constructor(
    private dataSource: UserDataSource,
    private userAuth: UserAuthorization
  ) {}

  private secret = process.env.secret as string;

  createHash(password: string): string {
    //Check that password follows rules

    //Setting fixed salt for development
    //const salt = bcrypt.genSaltSync(10);
    const salt = '$2a$10$1svMW3/FwE5G1BpE7/CPW.';
    const hash = bcrypt.hashSync(password, salt);

    return hash;
  }

  @EventBusDecorator(Event.EMAIL_INVITE)
  async createUserByEmailInvite(
    agent: User | null,
    args: CreateUserByEmailInviteArgs
  ): Promise<
    { userId: number; inviterId: number; role: UserRole } | Rejection
  > {
    if (!agent) {
      return rejection('NOT_LOGGED');
    }
    // Check if email exist in database and if user has been invited before
    const user = await this.dataSource.getByEmail(args.email);
    if (user && user.placeholder) {
      return {
        userId: user.id,
        inviterId: agent.id,
        role: args.userRole,
      };
    } else if (user) {
      return rejection('ACCOUNT_EXIST');
    }

    if (
      args.userRole === UserRole.REVIEWER &&
      (await this.userAuth.isUserOfficer(agent))
    ) {
      const userId = await this.dataSource.createInviteUser(args);
      await this.dataSource.setUserRoles(userId, [UserRole.REVIEWER]);

      return {
        userId,
        inviterId: agent.id,
        role: UserRole.REVIEWER,
      };
    } else if (args.userRole === UserRole.USER) {
      const userId = await this.dataSource.createInviteUser(args);
      await this.dataSource.setUserRoles(userId, [UserRole.USER]);

      return {
        userId,
        inviterId: agent.id,
        role: UserRole.USER,
      };
    }

    return rejection('NOT_ALLOWED');
  }

  @EventBusDecorator(Event.USER_CREATED)
  async create(
    agent: User | null,
    args: CreateUserArgs
  ): Promise<{ user: User; link: string } | Rejection> {
    if (
      this.createHash(args.orcid) !== args.orcidHash &&
      !(process.env.NODE_ENV === 'development')
    ) {
      logger.logError('ORCID hash mismatch', { args });

      return rejection('ORCID_HASH_MISMATCH');
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
    let user = await this.dataSource.getByEmail(args.email);

    if (user && user.placeholder) {
      const changePassword = await this.updatePassword(
        user,
        user.id,
        args.password
      );
      const updatedUser = await this.update(user, {
        id: user.id,
        placeholder: false,
        password: hash,
        ...args,
      });

      if (isRejection(updatedUser) || !changePassword) {
        logger.logError('Could not create user', {
          updatedUser,
          changePassword,
        });

        return rejection('INTERNAL_ERROR');
      }
      user = updatedUser;
    } else {
      user = await this.dataSource.create(
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
      );
    }

    const roles = await this.dataSource.getUserRoles(user.id);

    //If user has no role assign it the user role
    if (!roles.length) {
      this.dataSource.setUserRoles(user.id, [UserRole.USER]);
    }

    if (!user) {
      logger.logError('Could not create user', { args });

      return rejection('INTERNAL_ERROR');
    }

    const token = jsonwebtoken.sign(
      {
        id: user.id,
        type: 'emailVerification',
        updated: user.updated,
      },
      this.secret,
      { expiresIn: '24h' }
    );

    // Email verification link
    const link = process.env.baseURL + '/emailVerification/' + token;

    return { user, link };
  }

  @EventBusDecorator(Event.USER_UPDATED)
  async update(
    agent: User | null,
    args: UpdateUserArgs
  ): Promise<User | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isUser(agent, args.id))
    ) {
      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    const checkArgs = checkUserArgs(args);
    if (isRejection(checkArgs)) {
      return checkArgs;
    }

    let user = await this.dataSource.get(args.id); //Hacky

    if (!user) {
      return rejection('INTERNAL_ERROR');
    }
    user = {
      ...user,
      ...args,
    };

    if (args.roles !== undefined) {
      if (!(await this.userAuth.isUserOfficer(agent))) {
        return rejection('INSUFFICIENT_PERMISSIONS');
      }
      const [err] = await to(this.dataSource.setUserRoles(args.id, args.roles));
      if (err) {
        logger.logError('Could not set user roles', { err });

        return rejection('INTERNAL_ERROR');
      }
    }

    return this.dataSource
      .update(user)
      .then(user => user)
      .catch(err => {
        logger.logException('Could not create user', err, { user });

        return rejection('INTERNAL_ERROR');
      });
  }

  async login(email: string, password: string): Promise<string | Rejection> {
    const user = await this.dataSource.getByEmail(email);

    if (!user) {
      return rejection('WRONG_EMAIL_OR_PASSWORD');
    }
    const roles = await this.dataSource.getUserRoles(user.id);
    const result = await this.dataSource.getPasswordByEmail(email);

    if (!result) {
      return rejection('WRONG_EMAIL_OR_PASSWORD');
    }

    const valid = bcrypt.compareSync(password, result);

    if (!valid) {
      return rejection('WRONG_EMAIL_OR_PASSWORD');
    }

    if (!user.emailVerified) {
      return rejection('EMAIL_NOT_VERIFIED');
    }
    const token = jsonwebtoken.sign({ user, roles }, this.secret, {
      expiresIn: process.env.tokenLife,
    });

    return token;
  }

  async getTokenForUser(
    agent: User | null,
    userId: number
  ): Promise<string | Rejection> {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    const user = await this.dataSource.get(userId);

    if (!user) {
      return rejection('USER_DOES_NOT_EXIST');
    }

    const roles = await this.dataSource.getUserRoles(user.id);
    const token = jsonwebtoken.sign({ user, roles }, this.secret, {
      expiresIn: process.env.tokenLife,
    });

    return token;
  }

  async token(token: string): Promise<string | Rejection> {
    try {
      const decoded: any = jsonwebtoken.verify(token, this.secret);
      const freshToken = jsonwebtoken.sign(
        { user: decoded.user, roles: decoded.roles },
        this.secret,
        {
          expiresIn: process.env.tokenLife,
        }
      );

      return freshToken;
    } catch (error) {
      logger.logError('Bad token', { token });

      return rejection('BAD_TOKEN');
    }
  }

  @EventBusDecorator(Event.USER_PASSWORD_RESET_EMAIL)
  async resetPasswordEmail(
    agent: User | null,
    email: string
  ): Promise<{ user: User; link: string } | Rejection> {
    const user = await this.dataSource.getByEmail(email);

    if (!user) {
      logger.logInfo('Could not find user by email', { email });

      return rejection('COULD_NOT_FIND_USER_BY_EMAIL');
    }

    const token = jsonwebtoken.sign(
      {
        id: user.id,
        type: 'passwordReset',
        updated: user.updated,
      },
      this.secret,
      { expiresIn: '24h' }
    );

    const link = process.env.baseURL + '/resetPassword/' + token;

    const resetPassResponse = new ResetPasswordResponse(user, link);

    // Send reset email with link
    return resetPassResponse;
  }

  async emailVerification(token: string) {
    // Check that token is valid
    try {
      const decoded: any = jsonwebtoken.verify(token, this.secret);
      const user = await this.dataSource.get(decoded.id);
      //Check that user exist and that it has not been updated since token creation
      if (
        user &&
        user.updated === decoded.updated &&
        decoded.type === 'emailVerification'
      ) {
        await this.dataSource.setUserEmailVerified(user.id);

        return true;
      } else {
        return rejection('COULD_NOT_VERIFY_USER');
      }
    } catch (error) {
      logger.logException('Could not verify email', error, { token });

      return rejection('COULD_NOT_VERIFY_USER');
    }
  }

  async addUserRole(agent: User | null, args: AddUserRoleArgs) {
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    return this.dataSource
      .addUserRole(args)
      .then(() => true)
      .catch(err => {
        logger.logException('Could not add user role', err, { agent });

        return rejection('INTERNAL_ERROR');
      });
  }
  async updatePassword(
    agent: User | null,
    id: number,
    password: string
  ): Promise<BasicUserDetails | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isUser(agent, id))
    ) {
      return rejection('NOT_ALLOWED');
    }
    try {
      const hash = this.createHash(password);
      const user = await this.dataSource.get(id);
      if (user) {
        return this.dataSource.setUserPassword(user.id, hash);
      } else {
        logger.logError('Could not update password. Used does not exist', {
          agent,
          id,
        });

        return rejection('USER_DOES_NOT_EXIST');
      }
    } catch (error) {
      logger.logException('Could not update password', error, { agent, id });

      return rejection('INTERNAL_ERROR');
    }
  }
  async resetPassword(
    token: string,
    password: string
  ): Promise<BasicUserDetails | Rejection> {
    // Check that token is valid
    try {
      const hash = this.createHash(password);
      // TODO: Define verify responce type and use that instead of any.
      const decoded: any = jsonwebtoken.verify(token, this.secret);
      const user = await this.dataSource.get(decoded.id);

      //Check that user exist and that it has not been updated since token creation
      if (
        user &&
        user.updated === decoded.updated &&
        decoded.type === 'passwordReset'
      ) {
        return this.dataSource
          .setUserPassword(user.id, hash)
          .then(user => user)
          .catch(err => {
            logger.logError('Could not reset password', { err });

            return rejection('INTERNAL_ERROR');
          });
      }
      logger.logError('Could not reset password incomplete data', {
        user,
        decoded,
      });

      return rejection('INTERNAL_ERROR');
    } catch (error) {
      logger.logError('Could not reset password', { error, token });

      return rejection('INTERNAL_ERROR');
    }
  }
}

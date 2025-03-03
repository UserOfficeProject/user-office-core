import 'reflect-metadata';
import { Role, Roles } from './Role';

export type AuthJwtPayload = {
  user: UserJWT;
  roles: Role[];
  currentRole: Role;
  externalToken?: string;
  isInternalUser?: boolean;
  impersonatingUserId?: number;
};

export type AuthJwtApiTokenPayload = { accessTokenId?: string };

type SpecialActionJwtPayload = {
  id: number;
  updated: string;
};

export type PasswordResetJwtPayload = SpecialActionJwtPayload & {
  type: 'passwordReset';
};

export class User {
  constructor(
    public id: number,
    public user_title: string,
    public firstname: string,
    public middlename: string | undefined,
    public lastname: string,
    public username: string,
    public preferredname: string | undefined,
    public oidcSub: string | null,
    public oauthRefreshToken: string | null,
    public oauthIssuer: string | null,
    public gender: string,
    public nationality: number,
    public birthdate: Date,
    public institutionId: number,
    public institution: string,
    public department: string,
    public position: string,
    public email: string,
    public telephone: string,
    public telephone_alt: string | undefined,
    public placeholder: boolean,
    public created: string,
    public updated: string
  ) {}
}

export interface UserWithRole extends UserJWT {
  currentRole: Role | undefined;
  impersonatingUserId?: number;
  accessPermissions?: Record<string, boolean>;
  isApiAccessToken?: boolean;
  externalToken?: string;
  isInternalUser?: boolean;
  externalTokenValid?: boolean;
}

export enum UserRole {
  USER = 1,
  USER_OFFICER,
  FAP_CHAIR,
  FAP_SECRETARY,
  FAP_REVIEWER,
  INSTRUMENT_SCIENTIST,
  EXPERIMENT_SAFETY_REVIEWER,
  INTERNAL_REVIEWER,
}

export const UserRoleShortCodeMap = {
  [UserRole.USER]: Roles.USER,
  [UserRole.USER_OFFICER]: Roles.USER_OFFICER,
  [UserRole.FAP_CHAIR]: Roles.FAP_CHAIR,
  [UserRole.FAP_SECRETARY]: Roles.FAP_SECRETARY,
  [UserRole.FAP_REVIEWER]: Roles.FAP_REVIEWER,
  [UserRole.INSTRUMENT_SCIENTIST]: Roles.INSTRUMENT_SCIENTIST,
  [UserRole.EXPERIMENT_SAFETY_REVIEWER]: Roles.EXPERIMENT_SAFETY_REVIEWER,
  [UserRole.INTERNAL_REVIEWER]: Roles.INTERNAL_REVIEWER,
} as const;

export class BasicUserDetails {
  constructor(
    public id: number,
    public firstname: string,
    public lastname: string,
    public preferredname: string,
    public institution: string,
    public institutionId: number,
    public position: string,
    public created: Date,
    public placeholder: boolean,
    public email: string,
    public country: string
  ) {}
}

export type UserJWT = Pick<
  User,
  | 'created'
  | 'email'
  | 'firstname'
  | 'id'
  | 'lastname'
  | 'oidcSub'
  | 'institutionId'
  | 'placeholder'
  | 'position'
  | 'preferredname'
>;

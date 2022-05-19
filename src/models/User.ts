import 'reflect-metadata';
import { Role, Roles } from './Role';

export type AuthJwtPayload = {
  user: User;
  roles: Role[];
  currentRole: Role;
  externalToken?: string;
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

export type EmailVerificationJwtPayload = SpecialActionJwtPayload & {
  type: 'emailVerification';
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
    public orcid: string,
    public refreshToken: string,
    public gender: string,
    public nationality: number,
    public birthdate: Date,
    public organisation: number,
    public department: string,
    public position: string,
    public email: string,
    public emailVerified: boolean,
    public telephone: string,
    public telephone_alt: string | undefined,
    public placeholder: boolean,
    public created: string,
    public updated: string
  ) {}
}

export interface UserWithRole extends User {
  currentRole: Role | undefined;
  impersonatingUserId?: number;
  accessPermissions?: any;
  isApiAccessToken?: boolean;
  externalToken?: string;
  externalTokenValid?: boolean;
}

export enum UserRole {
  USER = 1,
  USER_OFFICER,
  SEP_CHAIR,
  SEP_SECRETARY,
  SEP_REVIEWER,
  INSTRUMENT_SCIENTIST,
  SAMPLE_SAFETY_REVIEWER,
}

export const UserRoleShortCodeMap = {
  [UserRole.USER]: Roles.USER,
  [UserRole.USER_OFFICER]: Roles.USER_OFFICER,
  [UserRole.SEP_CHAIR]: Roles.SEP_CHAIR,
  [UserRole.SEP_SECRETARY]: Roles.SEP_SECRETARY,
  [UserRole.SEP_REVIEWER]: Roles.SEP_REVIEWER,
  [UserRole.INSTRUMENT_SCIENTIST]: Roles.INSTRUMENT_SCIENTIST,
  [UserRole.SAMPLE_SAFETY_REVIEWER]: Roles.SAMPLE_SAFETY_REVIEWER,
} as const;

export class BasicUserDetails {
  constructor(
    public id: number,
    public firstname: string,
    public lastname: string,
    public preferredname: string,
    public organisation: string,
    public position: string,
    public created: Date,
    public placeholder: boolean
  ) {}
}

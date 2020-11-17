import 'reflect-metadata';
import { Role } from './Role';

export type AuthJwtPayload = { user: User; roles: Role[]; currentRole: Role };

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
    public birthdate: string,
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
}

export enum UserRole {
  USER = 1,
  USER_OFFICER,
  REVIEWER,
  SEP_CHAIR,
  SEP_SECRETARY,
  SEP_REVIEWER,
  INSTRUMENT_SCIENTIST,
  SAMPLE_SAFETY_REVIEWER,
}

export class BasicUserDetails {
  constructor(
    public id: number,
    public firstname: string,
    public lastname: string,
    public organisation: string,
    public position: string,
    public created: Date,
    public placeholder: boolean
  ) {}
}

import 'reflect-metadata';
import { Role } from './Role';
export class User {
  constructor(
    public id: number,
    public user_title: string | null,
    public firstname: string,
    public middlename: string | null,
    public lastname: string,
    public username: string,
    public preferredname: string | null,
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
    public telephone_alt: string | null,
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
  USER_OFFICER = 2,
  REVIEWER = 3,
  SEP_CHAIR = 4,
  SEP_SECRETARY = 5,
  SEP_REVIEWER = 6,
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

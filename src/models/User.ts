import "reflect-metadata";
import { rejection } from "../rejection";
import { Field, Int, ObjectType } from "type-graphql";
import { UpdateUserArgs } from "../resolvers/mutations/UpdateUserMutation";

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

export enum UserRole {
  USER = 1,
  USEROFFICER = 2,
  REVIEWER = 3
}

export class BasicUserDetails {
  constructor(
    public id: number,
    public firstname: string,
    public lastname: string,
    public organisation: string,
    public position: string
  ) {}
}
export function checkUserArgs(args: UpdateUserArgs) {
  const { firstname, lastname } = args;
  if (firstname && firstname.length < 2) {
    return rejection("TOO_SHORT_NAME");
  }

  if (lastname && lastname.length < 2) {
    return rejection("TOO_SHORT_NAME");
  }

  return true;
}

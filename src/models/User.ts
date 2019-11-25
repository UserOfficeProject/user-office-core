import { rejection, Rejection } from "../rejection";

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
    public created: string,
    public updated: string
  ) {}

  roles(args: any, context: any) {
    return context.queries.user.dataSource.getUserRoles(this.id);
  }

  reviews(args: any, context: any) {
    return context.queries.review.dataSource.getUserReviews(this.id);
  }

  proposals(args: any, context: any) {
    return context.queries.proposal.dataSource.getUserProposals(this.id);
  }
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

export interface UsersArgs {
  first?: number;
  offset?: number;
  filter?: string;
  usersOnly?: boolean;
  subtractUsers?: [number];
}

export interface CreateUserArgs {
  user_title: string;
  firstname: string;
  middlename: string;
  lastname: string;
  username: string;
  password: string;
  preferredname: string;
  orcid: string;
  orcidHash: string;
  refreshToken: string;
  gender: string;
  nationality: number;
  birthdate: string;
  organisation: number;
  department: string;
  position: string;
  email: string;
  telephone: string;
  telephone_alt: string;
}

export interface UpdateUserArgs {
  id: number;
  user_title?: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  username?: string;
  preferredname?: string;
  gender?: string;
  nationality?: number;
  birthdate?: string;
  organisation?: number;
  department?: string;
  position?: string;
  email?: string;
  telephone?: string;
  telephone_alt?: string;
  roles?: number[];
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

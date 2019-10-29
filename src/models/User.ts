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
    public nationality: string,
    public birthdate: string,
    public organisation: string,
    public department: string,
    public organisation_address: string,
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

export interface UpdateUserArgs {
  agent: User | null;
  id: number;
  user_title?: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
  username?: string;
  password?: string;
  preferredname?: string;
  gender?: string;
  nationality?: string;
  birthdate?: string;
  organisation?: string;
  department?: string;
  organisation_address?: string;
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

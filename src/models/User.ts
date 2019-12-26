import "reflect-metadata";
import { rejection } from "../rejection";
import { Field, Int, ObjectType } from "type-graphql";
import { UpdateUserArgs } from "../resolvers/UpdateUserMutation";
@ObjectType()
export class User {
  @Field(type => Int)
  public id: number;

  @Field(type => String, { nullable: true })
  public user_title: string | null;

  @Field()
  public firstname: string;

  @Field(type => String, { nullable: true })
  public middlename: string | null;

  @Field()
  public lastname: string;

  @Field()
  public username: string;

  @Field(type => String, { nullable: true })
  public preferredname: string | null;

  @Field()
  public orcid: string;

  @Field()
  public refreshToken: string;

  @Field()
  public gender: string;

  @Field()
  public nationality: number;

  @Field()
  public birthdate: string;

  @Field()
  public organisation: number;

  @Field()
  public department: string;

  @Field()
  public position: string;

  @Field()
  public email: string;

  @Field()
  public emailVerified: boolean;

  @Field()
  public telephone: string;

  @Field(type => String, { nullable: true })
  public telephone_alt: string | null;

  @Field()
  public placeholder: boolean;

  @Field()
  public created: string;

  @Field()
  public updated: string;
  constructor(
    id: number,
    user_title: string | null,
    firstname: string,
    middlename: string | null,
    lastname: string,
    username: string,
    preferredname: string | null,
    orcid: string,
    refreshToken: string,
    gender: string,
    nationality: number,
    birthdate: string,
    organisation: number,
    department: string,
    position: string,
    email: string,
    emailVerified: boolean,
    telephone: string,
    telephone_alt: string | null,
    placeholder: boolean,
    created: string,
    updated: string
  ) {
    this.id = id;
    this.user_title = user_title;
    this.firstname = firstname;
    this.middlename = middlename;
    this.lastname = lastname;
    this.username = username;
    this.preferredname = preferredname;
    this.orcid = orcid;
    this.refreshToken = refreshToken;
    this.gender = gender;
    this.nationality = nationality;
    this.birthdate = birthdate;
    this.organisation = organisation;
    this.department = department;
    this.position = position;
    this.email = email;
    this.emailVerified = emailVerified;
    this.telephone = telephone;
    this.telephone_alt = telephone_alt;
    this.placeholder = placeholder;
    this.created = created;
    this.updated = updated;
  }

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

@ObjectType()
export class BasicUserDetails {
  @Field(type => Int)
  public id: number;
  @Field()
  public firstname: string;
  @Field()
  public lastname: string;
  @Field()
  public organisation: string;
  @Field()
  public position: string;

  constructor(
    id: number,
    firstname: string,
    lastname: string,
    organisation: string,
    position: string
  ) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.organisation = organisation;
    this.position = position;
  }
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

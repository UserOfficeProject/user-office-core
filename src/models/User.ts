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

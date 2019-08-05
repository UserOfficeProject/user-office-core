var { buildSchema } = require("graphql")

export default buildSchema(`
type Query {
    proposal(id: ID!): Proposal
    proposals(filter: String, first: Int, offset: Int): ProposalQueryResult
    user(id: ID!): User
    users(filter: String, first: Int, offset: Int): UserQueryResult
    roles: [Roles]
  }

  type Rejection {
    reason: String
  }

  type ProposalQueryResult {
    proposals: [Proposal]
    totalCount: Int
  }

  type UserQueryResult {
    users: [User]
    totalCount: Int
  }

  type ProposalMutationResult {
    proposal: Proposal
    error: String
  }

  type UserMutationResult {
    user: User
    error: String
  }

  type LoginMutationResult {
    user: User
    token: String
  }

  type Mutation {
    createProposal: ProposalMutationResult
    updateProposal(id: ID!, title: String, abstract: String, status: Int, users: [Int]): ProposalMutationResult
    approveProposal(id: Int!): ProposalMutationResult
    submitProposal(id: Int!): ProposalMutationResult
    rejectProposal(id: Int!): ProposalMutationResult
    createUser(
        title: String, 
        firstname: String!, 
        middlename:String, 
        lastname: String!, 
        username: String!, 
        password: String!,
        preferredname: String,
        orcid: String!,
        gender: String!,
        nationality: String!,
        birthdate: String!,
        organisation: String!,
        department: String!,
        organisation_address: String!,
        position: String!,
        email: String!,
        telephone: String!,
        telephone_alt: String
        ): UserMutationResult
    updateUser(id: ID!, firstname: String, lastname: String, roles: [Int]): UserMutationResult
    addUserRole(userID: Int!, roleID: Int!): Boolean
    login(username: String!, password: String!): LoginMutationResult
  }

""" We can use node interfaces for the types so ESS and Max IV can have different types """


type Roles {
  id: Int
  shortCode: String
  title: String
}

type Proposal {
    id: Int
    title: String
    abstract: String
    status: Int
    users: [User!]
    proposer: Int
    created: String
    updated: String
}

type User {
    id: Int
    firstname: String
    lastname: String
    username: String
    proposals: [Proposal!]
    roles:[Roles]
    created: String
    updated: String
}


`);

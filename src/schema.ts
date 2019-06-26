var { buildSchema } = require("graphql");

export default buildSchema(`
type Query {
    proposal(id: ID!): Proposal
    proposals: [Proposal]
    user(id: ID!): User
    users: [User]
    roles: [Roles]
  }

  type Rejection {
    reason: String
  }

  type ProposalMutationResult {
    proposal: Proposal
    error: String
  }

  type UserMutationResult {
    user: User
    error: String
  }

  type Mutation {
    createProposal: ProposalMutationResult
    updateProposal(id: ID!, title: String, abstract: String, status: Int, users: [Int]): ProposalMutationResult
    approveProposal(id: Int!): ProposalMutationResult
    submitProposal(id: Int!): ProposalMutationResult
    rejectProposal(id: Int!): ProposalMutationResult
    createUser(firstname: String!, lastname: String!, username: String!, password: String!): UserMutationResult
    updateUser(id: ID!, firstname: String, lastname: String, roles: [Int]): UserMutationResult
    addUserRole(userID: Int!, roleID: Int!): Boolean
    login(username: String!, password: String!): String
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
}

type User {
    id: Int
    firstname: String
    lastname: String
    proposals: [Proposal!]
    roles:[Roles]
}

`);

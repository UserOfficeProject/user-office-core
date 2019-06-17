var { buildSchema } = require("graphql");

export default buildSchema(`
type Query {
    proposal(id: ID!): Proposal
    proposals: [Proposal]
    user(id: ID!): User
    users: [User]
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
    createProposal(abstract: String!, status: Int!, users: [Int!]): ProposalMutationResult
    updateProposal(id: ID!, abstract: String, status: Int, users: [Int]): ProposalMutationResult
    approveProposal(id: Int!): ProposalMutationResult
    createUser(firstname: String!, lastname: String!): UserMutationResult
  }

""" We can use node interfaces for the types so ESS and Max IV can have different types """

type Proposal {
    id: Int
    abstract: String
    status: Int
    users: [User!]
}

type User {
    id: Int
    firstname: String
    lastname: String
    proposals: [Proposal!]
    roles:[String]
}

`);

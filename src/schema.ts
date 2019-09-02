var { buildSchema } = require("graphql");

export default buildSchema(`
type Query {
    proposal(id: ID!): Proposal
    proposals(filter: String, first: Int, offset: Int): ProposalQueryResult
    user(id: ID!): User
    users(filter: String, first: Int, offset: Int): UserQueryResult
    roles: [Roles]
    review(id: ID!): Review
    proposalTemplate: ProposalTemplateResult
    call(id: ID!): Call
    calls: [Call]
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

  type CallMutationResult {
    call: Call
    error: String
  }

  type UserMutationResult {
    user: User
    error: String
  }

  type ProposalTemplateResult {
    template: ProposalTemplate
    error: String
  }

  type Mutation {
    createProposal: ProposalMutationResult
    updateProposal(id:ID!, answers:[ProposalAnswer], status: Int, users: [Int]): ProposalMutationResult
    approveProposal(id: Int!): ProposalMutationResult
    submitProposal(id: Int!): ProposalMutationResult
    rejectProposal(id: Int!): ProposalMutationResult
    createCall(shortCode: String!, startCall: String!, endCall: String!, startReview: String!, endReview: String!, startNotify: String!, endNotify: String!, cycleComment: String!, surveyComment: String!): CallMutationResult
    token(token: String!): String
    createUser(
        user_title: String, 
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
    login(username: String!, password: String!): String
    addUserForReview(userID: Int!, proposalID: Int!): Boolean
    removeUserForReview(reviewID: Int!): Boolean
    addReview(reviewID: Int!, comment: String!, grade: Int!): Review
    resetPasswordEmail(email: String!): Boolean
    resetPassword(token: String!, password: String!): Boolean
  }

type Roles {
  id: Int
  shortCode: String
  title: String
}

type Call {
  id: Int
  shortCode: String
  startCall: String
  endCall: String
  startReview: String
  endReview: String
  startNotify: String
  endNotify: String
  cycleComment: String
  surveyComment: String
}

type Proposal {
    id: ID
    title: String
    abstract: String
    status: Int
    users: [User!]
    proposer: Int
    created: String
    updated: String
    reviews: [Review]
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
    reviews: [Review]
    email: String
}

type Review {
  id: Int
  proposal: Proposal
  reviewer: User
  comment: String
  grade: Int
  status: Int
}

type ProposalTemplate {
    topics: [Topic]
}

type Topic {
  topic_id:Int,
  topic_title: String,
  fields:[ProposalTemplateField]
}
  
type ProposalTemplateField {
    proposal_question_id: String,
    data_type: String,
    question: String,

    config: String,
    dependencies: [FieldDependency]
}
  
type FieldDependency {
    proposal_question_dependency: String,
    proposal_question_id: String,
    condition: String,
}

input ProposalAnswer {
  proposal_question_id: ID!,
  answer: String
}

`);

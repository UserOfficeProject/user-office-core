var { buildSchema } = require("graphql");
import { makeExecutableSchema } from "graphql-tools";
import { typeDefs as proposal } from "./schemas/proposal";

export default makeExecutableSchema({
  typeDefs: [
    proposal,
    `
type Query {
    user(id: ID!): User
    users(filter: String, first: Int, offset: Int): UserQueryResult
    roles: [Roles]
    review(id: ID!): Review
    call(id: ID!): Call
    calls: [Call]
    getPageContent(id: PageName!): String
    fileMetadata(fileIds:[String]): [FileMetadata]
    getOrcIDInformation(authorizationCode: String): OrcIDInformation
  }

  type OrcIDInformation {
    firstname: String,
    lastname: String,
    orcid: String
    orcidHash: String
    refreshToken: String
  }

  type Rejection {
    reason: String
  }

  type UserQueryResult {
    users: [User]
    totalCount: Int
  }

  type FilesMutationResult {
    files: [String]
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

  type LoginMutationResult {
    token: String
    error: String
  }

  type ProposalTemplateResult {
    template: ProposalTemplate
    error: String
  }

  type Mutation {
    setPageContent(id: PageName!, text: String): Boolean
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
        orcidHash: String!,
        refreshToken: String!,
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
    addUserForReview(userID: Int!, proposalID: Int!): Boolean
    removeUserForReview(reviewID: Int!): Boolean
    addReview(reviewID: Int!, comment: String!, grade: Int!): Review
    resetPasswordEmail(email: String!): Boolean
    resetPassword(token: String!, password: String!): Boolean
    emailVerification(token: String!): Boolean
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

enum PageName {
  HOMEPAGE
  HELPPAGE
}

type FileMetadata {
  fileId:String,
  originalFileName:String,
  mimeType:String,
  sizeInBytes:Int,
  createdDate:String
}
`
  ]
});

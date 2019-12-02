var { buildSchema } = require("graphql");
import { makeExecutableSchema } from "graphql-tools";
import { typeDefs as proposal } from "./schemas/proposal";
import { typeDefs as user } from "./schemas/user";
import { typeDefs as admin } from "./schemas/admin";

export default makeExecutableSchema({
  typeDefs: [
    proposal,
    user,
    admin,
    `
type Query {
    review(id: ID!): Review
    call(id: ID!): Call
    calls: [Call]
    getPageContent(id: PageName!): String
    fileMetadata(fileIds:[String]): [FileMetadata]
  }



  type Rejection {
    reason: String
  }


  type FilesMutationResult {
    files: [String]
    error: String
  }

  type CallMutationResult {
    call: Call
    error: String
  }



  type ProposalTemplateResult {
    template: ProposalTemplate
    error: String
  }

  type Mutation {
    createCall(shortCode: String!, startCall: String!, endCall: String!, startReview: String!, endReview: String!, startNotify: String!, endNotify: String!, cycleComment: String!, surveyComment: String!): CallMutationResult
    addReview(reviewID: Int!, comment: String!, grade: Int!): Review
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
  PRIVACYPAGE
  COOKIEPAGE
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

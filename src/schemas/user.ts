export const typeDefs = `
    extend type Query {
        user(id: ID!): User
        basicUserDetails(id: ID!): BasicUserDetails
        roles: [Roles]
        users(filter: String, first: Int, offset: Int, usersOnly: Boolean, subtractUsers: [Int]): UserQueryResult
        getOrcIDInformation(authorizationCode: String): OrcIDInformation
    }

    extend type Mutation {
        token(token: String!): String
        addUserForReview(userID: Int!, proposalID: Int!): Boolean
        removeUserForReview(reviewID: Int!): Boolean
        addUserRole(userID: Int!, roleID: Int!): Boolean
        updateUser(
          id: Int!, 
          user_title: String, 
          firstname: String, 
          middlename:String, 
          lastname: String, 
          preferredname: String,
          gender: String,
          nationality: String,
          birthdate: String,
          organisation: String,
          department: String,
          organisation_address: String,
          position: String,
          email: String,
          telephone: String,
          telephone_alt: String, 
          roles: [Int]): UserMutationResult
        updatePassword(id: Int!,  password: String!): Boolean
        login(username: String!, password: String!): LoginMutationResult
        resetPasswordEmail(email: String!): Boolean
        resetPassword(token: String!, password: String!): Boolean
        emailVerification(token: String!): Boolean
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
    }

  type LoginMutationResult {
    token: String
    error: String
  }

    type OrcIDInformation {
        firstname: String,
        lastname: String,
        orcid: String
        orcidHash: String
        refreshToken: String
      }

    type UserQueryResult {
        users: [User]
        totalCount: Int
    }
    type UserMutationResult {
        user: User
        error: String
    }
    type User {
        id: Int
        user_title: String, 
        firstname: String, 
        middlename:String, 
        lastname: String, 
        username: String, 
        preferredname: String,
        orcid: String,
        orcidHash: String,
        refreshToken: String,
        gender: String,
        nationality: String,
        birthdate: String,
        organisation: String,
        department: String,
        organisation_address: String,
        position: String,
        email: String,
        telephone: String,
        telephone_alt: String
        proposals: [Proposal!]
        roles:[Roles]
        created: String
        updated: String
        reviews: [Review]
    }
    type BasicUserDetails {
      id: Int,
      firstname: String, 
      lastname: String, 
      organisation: String
    }
    type Roles {
        id: Int
        shortCode: String
        title: String
      }
`;

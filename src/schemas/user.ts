export const typeDefs = `
    extend type Query {
        user(id: ID!): User
        basicUserDetails(id: ID!): BasicUserDetails
        roles: [Roles]
        users(filter: String, first: Int, offset: Int, usersOnly: Boolean, subtractUsers: [Int]): UserQueryResult
        getOrcIDInformation(authorizationCode: String): OrcIDInformation
        checkEmailExist(email:String): Boolean
        getFields: Fields
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
          nationality: Int,
          birthdate: String,
          organisation: Int,
          department: String,
          position: String,
          email: String,
          telephone: String,
          telephone_alt: String, 
          roles: [Int]): UserMutationResult
        updatePassword(id: Int!,  password: String!): BasicUserDetailsMutationResult
        login(email: String!, password: String!): LoginMutationResult
        resetPasswordEmail(email: String!): Boolean
        resetPassword(token: String!, password: String!): Boolean
        emailVerification(token: String!): Boolean
        createUserByEmailInvite(firstname: String!, lastname: String!, email: String!): Int
        createUser(
            user_title: String, 
            firstname: String!, 
            middlename:String, 
            lastname: String!, 
            password: String!,
            preferredname: String,
            orcid: String!,
            orcidHash: String!,
            refreshToken: String!,
            gender: String!,
            nationality: Int!,
            birthdate: String!,
            organisation: Int!,
            department: String!,
            position: String!,
            email: String!,
            telephone: String!,
            telephone_alt: String
            otherOrganisation: String
            ): UserMutationResult
    }

  type Fields {
    nationalities: [Entry]
    countries: [Entry]
    institutions: [Entry]
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
        token: String
      }
    type Entry{
      id: Int
      value: String
    }
    type UserQueryResult {
        users: [BasicUserDetails]
        totalCount: Int
    }
    type UserMutationResult {
      user: User
      error: String
    }
    type BasicUserDetailsMutationResult {
      user: BasicUserDetails
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
        nationality: Int,
        birthdate: String,
        organisation: Int,
        department: String,
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

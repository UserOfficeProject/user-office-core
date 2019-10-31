export const typeDefs = `
    extend type Query {
        proposal(id: ID!): Proposal
        proposals(filter: String, first: Int, offset: Int): ProposalQueryResult
        proposalTemplate: ProposalTemplate
    }

    extend type Mutation {
        createProposal: ProposalMutationResult
        updateProposal(id:ID!, title: String, abstract: String, answers:[ProposalAnswerInput], topicsCompleted:[Int], status: Int, users: [Int]): ProposalMutationResult
        updateProposalFiles(proposal_id:ID!, question_id:ID!, files:[String]): FilesMutationResult
        
        approveProposal(id: Int!): ProposalMutationResult
        submitProposal(id: Int!): ProposalMutationResult
        rejectProposal(id: Int!): ProposalMutationResult
        deleteProposal(id: Int!): ProposalMutationResult

        createTopic(sortOrder:Int!): ProposalTemplateMutationResult
        updateTopic(id:Int!, title: String, isEnabled: Boolean): TopicMutationResult
        updateFieldTopicRel(topic_id:Int!, field_ids:[String]): VoidMutationResult
        updateProposalTemplateField(id:String!, question:String, config:String, isEnabled:Boolean, dependencies:[FieldDependencyInput]): ProposalTemplateMutationResult
        createTemplateField(topicId:Int!, dataType:String!): ProposalTemplateFieldMutationResult
        deleteTemplateField(id:String!): ProposalTemplateMutationResult
        deleteTopic(id:Int!): VoidMutationResult
        updateTopicOrder(topicOrder:[Int]!): VoidMutationResult
    }


    type ProposalQueryResult {
        proposals: [Proposal]
        totalCount: Int
    }

    type ProposalMutationResult {
        proposal: Proposal
        error: String
    }

    type TopicMutationResult {
        topic: Topic
        error: String
    }

    type VoidMutationResult {
        error: String
    }

    type ProposalTemplateFieldMutationResult {
        field: ProposalTemplateField
        error: String
    }

    type ProposalTemplateMutationResult {
        template: ProposalTemplate
        error: String
    }



    type Topic {
        topic_id:Int,
        topic_title: String,
        sort_order:Int,
    }



    type Proposal {
        id: Int
        title: String
        abstract: String
        status: Int
        users: [User!]
        proposer: Int
        questionary: Questionary
        created: String
        updated: String
        reviews: [Review]
        shortCode:String
    }

    type Questionary {
        steps: [QuestionaryStep]
    }

    type QuestionaryStep {
        topic:Topic,
        isCompleted: Boolean,
        fields:[QuestionaryField]
    }

    type QuestionaryField {
        proposal_question_id: String,
        data_type: String,
        question: String,
        topic_id:Int,
        config: String,
        dependencies: [FieldDependency],
        value: String
    }



    type ProposalTemplate {
        steps: [ProposalTemplateStep]
    }

    type ProposalTemplateStep {
        topic: Topic,
        fields:[ProposalTemplateField]
    }

    type ProposalTemplateField {
        proposal_question_id: String,
        data_type: String,
        question: String,
        topic_id:Int,
        config: String,
        dependencies: [FieldDependency]
    }
    

    type FieldDependency {
        proposal_question_dependency: String,
        proposal_question_id: String,
        condition: String,
    }

    input ProposalAnswerInput {
        proposal_question_id: ID!,
        data_type:String,
        value: String
    }

    



    input FieldDependencyInput {
        proposal_question_dependency: String,
        proposal_question_id: String,
        condition: String,
    }

    input TopicInput {
        topic_id:Int,
        topic_title: String
    }

    type ProposalAnswer {
        proposal_question_id: ID!,
        answer: String
    }
`;

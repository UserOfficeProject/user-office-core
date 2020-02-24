import {
  EvaluatorOperator,
  FieldConfig,
  FieldDependency,
  ProposalTemplate,
  ProposalTemplateField,
  Questionary
} from "../generated/sdk";
import { DataType } from "../generated/sdk";

export const create1Topic3FieldWithDependenciesQuestionary = (): Questionary => {
  return {
    steps: [
      {
        topic: {
          topic_title: "General information",
          topic_id: 0,
          sort_order: 1,
          is_enabled: true
        },
        isCompleted: false,
        fields: [
          {
            proposal_question_id: "ttl_general",
            natural_key: "ttl_general",
            data_type: DataType.EMBELLISHMENT,
            question: "",
            config: {
              html: "General information",
              plain: "General information",
              small_label: "",
              required: false,
              tooltip: ""
            },
            value: "",
            sort_order: 1,
            topic_id: 0,
            dependencies: []
          },
          {
            proposal_question_id: "has_links_with_industry",
            natural_key: "has_links_with_industry",
            data_type: DataType.SELECTION_FROM_OPTIONS,
            question: "Has links with industry",
            config: {
              variant: "radio",
              options: ["yes", "no"],
              small_label: "",
              required: false,
              tooltip: ""
            },
            value: "",
            sort_order: 2,
            topic_id: 0,
            dependencies: []
          },
          {
            proposal_question_id: "links_with_industry",
            natural_key: "links_with_industry",
            data_type: DataType.TEXT_INPUT,
            question: "If yes, please describe:",
            config: {
              min: 0,
              max: 1000000,
              multiline: false,
              placeholder: "Please specify links with industry",
              small_label: "",
              required: false,
              tooltip: ""
            },
            value: "",
            sort_order: 2,
            topic_id: 0,
            dependencies: [
              {
                proposal_question_dependency: "has_links_with_industry",
                condition: {
                  condition: EvaluatorOperator.EQ,
                  params: "yes"
                },
                proposal_question_id: "links_with_industry"
              }
            ]
          }
        ]
      }
    ]
  };
};

export const create1TopicFieldlessTemplate = (): ProposalTemplate => {
  return {
    steps: [
      {
        topic: {
          topic_id: 0,
          topic_title: "General information",
          sort_order: 0,
          is_enabled: true
        },
        fields: []
      }
    ]
  };
};

export const createDummyField = (values: {
  data_type?: DataType;
  proposal_question_id?: string;
  natural_key?: string;
  sort_order?: number;
  topic_id?: number;
  question?: string;
  config?: FieldConfig;
  dependencies?: FieldDependency[];
}): ProposalTemplateField => {
  return {
    proposal_question_id:
      values.proposal_question_id || "random_field_name_" + Math.random(),
    natural_key: values.natural_key || "is_dangerous",
    data_type: values.data_type || DataType.TEXT_INPUT,
    sort_order: values.sort_order || Math.round(Math.random() * 100),
    question: values.question || "Some random question",
    config: values.config || {
      required: false,
      small_label: "",
      tooltip: "",
      min: 0,
      max: 0
    },
    topic_id: values.topic_id || Math.round(Math.random() * 10),
    dependencies: values.dependencies || []
  };
};

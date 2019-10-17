import {
  ProposalTemplate,
  DataType,
  FieldDependency,
  Topic,
  FieldConfig,
  ProposalTemplateField,
  FieldCondition
} from "../model/ProposalModel";
import { EvaluatorOperator } from "../model/ConditionEvaluator";

export const createTemplate = () => {
  return ProposalTemplate.fromObject({
    topics: [
      {
        topic_title: "General information",
        topic_id: 1,
        fields: [
          {
            proposal_question_id: "ttl_general",
            data_type: "EMBELLISHMENT",
            question: "",
            config: '{"html":"<h2>Indicators</h2>"}',
            value: null,
            dependencies: []
          },
          {
            proposal_question_id: "has_links_with_industry",
            data_type: "SELECTION_FROM_OPTIONS",
            question: "Links with industry?",
            config:
              '{"required":true, "options":["yes", "no"], "variant":"radio"}',
            value: '{"value":"no"}',
            dependencies: []
          },
          {
            proposal_question_id: "links_with_industry",
            data_type: "TEXT_INPUT",
            question: "If yes, please describe:",
            config: '{"placeholder":"Please specify links with industry"}',
            value: null,
            dependencies: [
              {
                proposal_question_dependency: "has_links_with_industry",
                condition: '{ "condition": "eq", "params":"yes"}',
                proposal_question_id: "links_with_industry"
              }
            ]
          },
          {
            proposal_question_id: "is_student_proposal",
            data_type: "SELECTION_FROM_OPTIONS",
            question: "Are any of the co-proposers students?",
            config:
              '{"required":true, "options":["yes", "no"], "variant":"radio"}',
            value: '{"value":"yes"}',
            dependencies: []
          },
          {
            proposal_question_id: "is_towards_degree",
            data_type: "SELECTION_FROM_OPTIONS",
            question: "Does the proposal work towards a students degree?",
            config:
              '{"required":true, "options":["yes", "no"], "variant":"radio"}',
            value: '{"value":"yes"}',
            dependencies: []
          },
          {
            proposal_question_id: "ttl_delivery_date",
            data_type: "EMBELLISHMENT",
            question: "",
            config: '{"html":"<h2>Final delivery date</h2>"}',
            value: null,
            dependencies: []
          },
          {
            proposal_question_id: "final_delivery_date",
            data_type: "DATE",
            question: "Choose a date",
            config: '{"min":"now", "required":true}',
            value: '{"value":"2019-09-26T08:57:00.000Z"}',
            dependencies: []
          },
          {
            proposal_question_id: "final_delivery_date_motivation",
            data_type: "TEXT_INPUT",
            question: "Please motivate the chosen date",
            config:
              '{"min":10, "multiline":true, "max":500, "small_label":"(e.g. based on awarded beamtime, or described intention to apply)"}',
            value: '{"value":""}',
            dependencies: []
          }
        ]
      }
    ]
  });
};

export const createFieldlessTemplate = () => {
  return ProposalTemplate.fromObject({
    topics: [
      {
        topic_title: "General information",
        topic_id: 0,
        fields: []
      }
    ]
  });
};

export const createDummyTemplate = () => {
  const hasLinksToField = createDummyField({
    proposal_question_id: "hasLinksToField",
    data_type: DataType.SELECTION_FROM_OPTIONS
  });
  const linksToField = createDummyField({
    proposal_question_id: "linksToField",
    data_type: DataType.TEXT_INPUT,
    dependencies: [
      new FieldDependency(
        "linksToField",
        "hasLinksToField",
        new FieldCondition(EvaluatorOperator.EQ, "yes")
      )
    ]
  });

  return new ProposalTemplate([
    new Topic(1, "General information", 0, true, [
      hasLinksToField,
      linksToField
    ])
  ]);
};

const createDummyField = (values: {
  data_type?: DataType;
  proposal_question_id?: string;
  sort_order?: number;
  topic_id?: number;
  question?: string;
  config?: FieldConfig;
  dependencies?: FieldDependency[];
}): ProposalTemplateField => {
  return new ProposalTemplateField(
    values.proposal_question_id || "random_field_name_" + Math.random(),
    values.data_type || DataType.TEXT_INPUT,
    values.sort_order || Math.round(Math.random() * 100),
    values.question || "Some random question",
    values.config || {},
    values.topic_id || Math.round(Math.random() * 10),
    "",
    values.dependencies || []
  );
};

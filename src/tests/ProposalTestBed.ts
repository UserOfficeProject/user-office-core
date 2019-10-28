import {
  ProposalTemplate,
  DataType,
  FieldDependency,
  Topic,
  FieldConfig,
  ProposalTemplateField,
  FieldCondition,
  TemplateStep,
  Questionary,
  QuestionaryStep,
  QuestionaryField
} from "../models/ProposalModel";
import { EvaluatorOperator } from "../models/ConditionEvaluator";
import { Proposal } from "../models/Proposal";

export const create1Topic3FieldWithDependenciesQuestionary = () => {
  return new Questionary([
    new QuestionaryStep(new Topic(0, "General information", 0, true), false, [
      new QuestionaryField(
        new ProposalTemplateField(
          "ttl_general",
          DataType.EMBELLISHMENT,
          0,
          "",
          JSON.stringify({
            html: "General informaiton",
            plain: "General information"
          }),
          0,
          []
        ),
        ""
      ),
      new QuestionaryField(
        new ProposalTemplateField(
          "has_links_with_industry",
          DataType.SELECTION_FROM_OPTIONS,
          1,
          "Has links with industry",
          JSON.stringify({ options: ["yes", "no"], variant: "radio" }),
          0,
          []
        ),
        ""
      ),
      new QuestionaryField(
        new ProposalTemplateField(
          "links_with_industry",
          DataType.TEXT_INPUT,
          2,
          "If yes, please describe:",
          JSON.stringify({ placeholder: "Please specify links with industry" }),
          0,
          [
            new FieldDependency(
              "links_with_industry",
              "has_links_with_industry",
              JSON.stringify(new FieldCondition(EvaluatorOperator.EQ, "yes"))
            )
          ]
        ),
        ""
      )
    ])
  ]);
};

export const create1TopicFieldlessTemplate = () => {
  return new ProposalTemplate([
    new TemplateStep(new Topic(0, "General information", 0, true), [])
  ]);
};

export const createDummyField = (values: {
  data_type?: DataType;
  proposal_question_id?: string;
  sort_order?: number;
  topic_id?: number;
  question?: string;
  config?: string;
  dependencies?: FieldDependency[];
}): ProposalTemplateField => {
  return new ProposalTemplateField(
    values.proposal_question_id || "random_field_name_" + Math.random(),
    values.data_type || DataType.TEXT_INPUT,
    values.sort_order || Math.round(Math.random() * 100),
    values.question || "Some random question",
    values.config || JSON.stringify({}),
    values.topic_id || Math.round(Math.random() * 10),
    values.dependencies || []
  );
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
        JSON.stringify(new FieldCondition(EvaluatorOperator.EQ, "yes")) // TODO SWAP-341. Remove stringifying
      )
    ]
  });

  return new ProposalTemplate([
    new TemplateStep(new Topic(1, "General information", 1, true), [
      hasLinksToField,
      linksToField
    ])
  ]);
};

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

export const create1Topic3FieldWithDependenciesQuestionary = () => {
  return new Questionary([
    new QuestionaryStep(new Topic(0, "General information", 0, true), false, [
      new QuestionaryField(
        new ProposalTemplateField(
          "ttl_general",
          DataType.Embellishment,
          0,
          "",
          { html: "General informaiton", plain: "General information" },
          0,
          []
        ),
        ""
      ),
      new QuestionaryField(
        new ProposalTemplateField(
          "has_links_with_industry",
          DataType.SelectionFromOptions,
          1,
          "Has links with industry",
          { options: ["yes", "no"], variant: "radio" },
          0,
          []
        ),
        ""
      ),
      new QuestionaryField(
        new ProposalTemplateField(
          "links_with_industry",
          DataType.TextInput,
          2,
          "If yes, please describe:",
          { placeholder: "Please specify links with industry" },
          0,
          [
            new FieldDependency(
              "links_with_industry",
              "has_links_with_industry",
              new FieldCondition(EvaluatorOperator.EQ, "yes")
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
  config?: FieldConfig;
  dependencies?: FieldDependency[];
}): ProposalTemplateField => {
  return new ProposalTemplateField(
    values.proposal_question_id || "random_field_name_" + Math.random(),
    values.data_type || DataType.TextInput,
    values.sort_order || Math.round(Math.random() * 100),
    values.question || "Some random question",
    values.config || {},
    values.topic_id || Math.round(Math.random() * 10),
    values.dependencies || []
  );
};

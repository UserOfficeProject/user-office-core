import { EvaluatorOperator } from "../models/ConditionEvaluator";
import {
  DataType,
  FieldCondition,
  FieldDependency,
  ProposalTemplate,
  ProposalTemplateField,
  Questionary,
  QuestionaryField,
  QuestionaryStep,
  TemplateStep,
  Topic,
  createConfig
} from "../models/ProposalModel";
import {
  EmbellishmentConfig,
  SelectionFromOptionsConfig,
  TextInputConfig,
  FieldConfigType
} from "../resolvers/types/FieldConfig";

export const create1Topic3FieldWithDependenciesQuestionary = () => {
  return new Questionary([
    new QuestionaryStep(new Topic(0, "General information", 0, true), false, [
      new QuestionaryField(
        new ProposalTemplateField(
          "ttl_general",
          "ttl_general",
          DataType.EMBELLISHMENT,
          0,
          "",
          createConfig<EmbellishmentConfig>(new EmbellishmentConfig(), {
            plain: "General information",
            html: "<h1>General information</h1>"
          }),
          0,
          []
        ),
        ""
      ),
      new QuestionaryField(
        new ProposalTemplateField(
          "has_links_with_industry",
          "has_links_with_industry",
          DataType.SELECTION_FROM_OPTIONS,
          1,
          "Has links with industry",
          createConfig<SelectionFromOptionsConfig>(
            new SelectionFromOptionsConfig(),
            {
              options: ["yes", "no"],
              variant: "radio"
            }
          ),
          0,
          []
        ),
        ""
      ),
      new QuestionaryField(
        new ProposalTemplateField(
          "links_with_industry",
          "links_with_industry",
          DataType.TEXT_INPUT,
          2,
          "If yes, please describe:",
          createConfig<TextInputConfig>(new TextInputConfig(), {
            placeholder: "Please specify links with industry",
            multiline: true
          }),
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
  natural_key?: string;
  sort_order?: number;
  topic_id?: number;
  question?: string;
  config?: typeof FieldConfigType;
  dependencies?: FieldDependency[];
}): ProposalTemplateField => {
  return new ProposalTemplateField(
    values.proposal_question_id || "random_field_name_" + Math.random(),
    values.natural_key || "is_dangerous",
    values.data_type || DataType.TEXT_INPUT,
    values.sort_order || Math.round(Math.random() * 100),
    values.question || "Some random question",
    values.config || { required: false, tooltip: "", small_label: "" },
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
        new FieldCondition(EvaluatorOperator.EQ, "yes")
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

export const createDummyTopic = (
  id: number,
  values: {
    title?: string;
    sortOrder?: number;
    isEnabled?: boolean;
  }
) => {
  return new Topic(
    id,
    values.title || "General information",
    values.sortOrder || 0,
    values.isEnabled || true
  );
};

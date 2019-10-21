import {
  create1Topic3FieldWithDependenciesQuestionary,
  create1TopicFieldlessTemplate
} from "../test/ProposalTestBed";
import {
  getAllFields,
  getFieldById,
  getTopicById,
  getQuestionaryStepByTopicId
} from "./ProposalModelFunctions";

test("Can parse object", () => {
  var template = create1Topic3FieldWithDependenciesQuestionary();
  debugger;
  expect(getAllFields(template).length).toBe(3);
  expect(getFieldById(template, "links_with_industry")!.dependencies).not.toBe(
    null
  );
  expect(
    getFieldById(template, "links_with_industry")!.dependencies!.length
  ).toBe(1);

  var fieldlessTemplate = create1TopicFieldlessTemplate();
  expect(getQuestionaryStepByTopicId(fieldlessTemplate, 0)!.fields.length).toBe(
    0
  );
  expect(getTopicById(fieldlessTemplate, 1)).toBe(undefined);
});

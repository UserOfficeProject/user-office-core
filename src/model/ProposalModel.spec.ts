import {
  createTemplate,
  createFieldlessTemplate
} from "../test/ProposalTestBed";
import { ProposalTemplate } from "./ProposalModel";

test("Can parse object", () => {
  var template = createTemplate();
  debugger;
  expect(ProposalTemplate.getAllFields(template).length).toBe(8);
  expect(
    ProposalTemplate.getFieldById(template, "links_with_industry")!.dependencies
  ).not.toBe(null);
  expect(
    ProposalTemplate.getFieldById(template, "links_with_industry")!
      .dependencies!.length
  ).toBe(1);

  var fieldlessTemplate = createFieldlessTemplate();
  expect(
    ProposalTemplate.getTopicById(fieldlessTemplate, 0)!.fields.length
  ).toBe(0);
  expect(ProposalTemplate.getTopicById(fieldlessTemplate, 1)).toBe(undefined);
});

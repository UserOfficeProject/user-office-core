import {createTemplate, createFieldlessTemplate} from "../test/ProposalTestBed"

test("Can parse object", () => {
  var template = createTemplate();
  expect(template.getAllFields().length).toBe(4);
  expect(template.getFieldById("links_with_industry").dependencies).not.toBe(null);
  expect(template.getFieldById("links_with_industry").dependencies!.length).toBe(1);

  var fieldlessTemplate = createFieldlessTemplate();
  expect(fieldlessTemplate.getTopicById(0)!.fields.length).toBe(0)
  expect(fieldlessTemplate.getTopicById(1)).toBe(undefined)
});


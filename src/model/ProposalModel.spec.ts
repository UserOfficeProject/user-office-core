import {createTemplate} from "../test/ProposalTestBed"

test("Can parse object", () => {
  var template = createTemplate();
  expect(template.fields.length).toBe(4);
  expect(template.getFieldById("links_with_industry").dependencies).not.toBe(null);
  expect(template.getFieldById("links_with_industry").dependencies!.length).toBe(1);
});


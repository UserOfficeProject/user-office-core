import { createTemplate } from "../test/ProposalTestBed";
import { ProposalTemplate } from "./ProposalModel";

test("Is dependency checking working", () => {
  let template = createTemplate();
  expect(
    ProposalTemplate.areDependenciesSatisfied(
      template,
      "has_links_with_industry"
    )
  ).toBe(true);

  expect(
    ProposalTemplate.areDependenciesSatisfied(template, "links_with_industry")
  ).toBe(false);
});

test("Updating value changes dependency sattisfaction", () => {
  let template = createTemplate();

  expect(
    ProposalTemplate.areDependenciesSatisfied(template, "links_with_industry")
  ).toBe(false);

  ProposalTemplate.getFieldById(template, "has_links_with_industry")!.value =
    "yes";
  expect(
    ProposalTemplate.areDependenciesSatisfied(template, "links_with_industry")
  ).toBe(true);
});

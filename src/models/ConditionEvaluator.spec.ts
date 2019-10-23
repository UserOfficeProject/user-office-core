import { create1Topic3FieldWithDependenciesQuestionary } from "../tests/ProposalTestBed";
import { ProposalTemplate } from "./ProposalModel";
import {
  areDependenciesSatisfied,
  getFieldById
} from "./ProposalModelFunctions";

test("Is dependency checking working", () => {
  let template = create1Topic3FieldWithDependenciesQuestionary();
  expect(areDependenciesSatisfied(template, "has_links_with_industry")).toBe(
    true
  );

  expect(areDependenciesSatisfied(template, "links_with_industry")).toBe(false);
});

test("Updating value changes dependency sattisfaction", () => {
  let template = create1Topic3FieldWithDependenciesQuestionary();

  expect(areDependenciesSatisfied(template, "links_with_industry")).toBe(false);

  getFieldById(template, "has_links_with_industry")!.value = "yes";
  expect(areDependenciesSatisfied(template, "links_with_industry")).toBe(true);
});

import {createTemplate} from "../test/ProposalTestBed"

test("Is dependency checking working", () => {
  let template = createTemplate();
  expect(template.areDependenciesSatisfied("has_links_with_industry")).toBe(true);
  expect(template.areDependenciesSatisfied("links_with_industry")).toBe(false);
});

test("Updating value changes dependency sattisfaction", () => {
    let template = createTemplate();
    expect(template.areDependenciesSatisfied("links_with_industry")).toBe(false);
    template.getFieldById("has_links_with_industry").value = "yes";
    expect(template.areDependenciesSatisfied("links_with_industry")).toBe(true);
})
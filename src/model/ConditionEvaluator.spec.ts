import { ProposalTemplate, ProposalTemplateField } from "./ProposalModel";
import { ConditionEvaluator } from "./ConditionEvaluator";

var template:ProposalTemplate;
var conditionEvaluator:ConditionEvaluator

beforeEach(() => {
    conditionEvaluator = new ConditionEvaluator();
    template = new ProposalTemplate({
      "fields": [
          {
            "proposal_question_id": "has_links_with_industry",
            "dependencies": [],
            "data_type": "SELECTION_FROM_OPTIONS",
            "question": "Links with industry?",
            "config": "{\"variant\":\"radio\", \"options\":[\"yes\", \"no\"], \"topic\":\"general_info\"}"
          },
          {
            "proposal_question_id": "links_with_industry",
            "dependencies": [
              {
                "proposal_question_dependency": "has_links_with_industry",
                "condition": "{ \"condition\": \"equals\", \"params\":\"yes\" }",
                "proposal_question_id": "links_with_industry"
              }
            ],
            "data_type": "SMALL_TEXT",
            "question": "Please specify",
            "config": "{\"max\":300, \"min\":2,\"topic\":\"general_info\"}"
          }
        ]
    });
  });

  test("Is dependency checking working", () => {
    expect(template.areDependenciesSatisfied("has_links_with_industry")).toBe(true);
    expect(template.areDependenciesSatisfied("links_with_industry")).toBe(false);
  });
  
  test("Updating value changes dependency sattisfaction", () => {
      expect(template.areDependenciesSatisfied("links_with_industry")).toBe(false);
      template.getFieldById("has_links_with_industry").value = "yes";
      expect(template.areDependenciesSatisfied("links_with_industry")).toBe(true);
  })
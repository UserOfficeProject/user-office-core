import { ProposalTemplate } from "../model/ProposalModel";

export const createTemplate = () => {
    return new ProposalTemplate({
        "topics": [
          {
          "topic_title":"General information",
          "topic_id":0,
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
              },
              {
                "proposal_question_id": "final_delivery_date",
                "dependencies": [],
                "data_type": "DATE",
                "question": "Final delivery date",
                "config": "{\"topic\":\"general_info\"}"
              },
              {
                "proposal_question_id": "final_delivery_date_motivation",
                "dependencies": [],
                "data_type": "LARGE_TEXT",
                "question": "Please motivate the chosen date",
                "config": "{\"small_label\":\"(e.g. based on awarded beamtime, or described intention to apply)\",\"topic\":\"general_info\"}"
              }
            ]
          }
        ]
      });
}


export const createFieldlessTemplate = () =>
{
  return new ProposalTemplate({
    "topics": [
      {
      "topic_title":"General information",
      "topic_id":0,
      "fields": []
      }
    ]
  });
}

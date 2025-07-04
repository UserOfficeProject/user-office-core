export const experimentBody = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Experiment Risk Assessment</title>
    <link href="http://localhost:4500/static/css/bootstrap.min.css" rel="stylesheet" />
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 14px;
      }
      .page-border {
        border: 4px solid;
        padding: 30px;
        margin: 30px auto;
        box-sizing: border-box;
        max-width: 1000px;
      }
      .page-border-red {
        border-color: red;
      }
      .page-border-green {
        border-color: green;
      }
      .page-border-yellow {
        border-color: goldenrod;
      }
      .section-title {
        background-color: #f0f0f0;
        font-size: 18px;
        font-weight: bold;
        border-radius: 4px;
        margin-top: 30px;
        margin-bottom: 30px;
      }
      .field-label {
        font-weight: 600;
      }
      .sample-block {
        border-left: 4px solid #ccc;
        padding-left: 15px;
        margin-bottom: 25px;
      }
    </style>
  </head>
  <body>
    <div id="pageBorder" class="page-border">
      <div class="text-center fw-bold fs-4 mb-4">Experiment Risk Assessment</div>

      <div class="d-flex justify-content-between mb-4 fw-bold fs-6">
        <div>{{principalInvestigator.firstname}} {{principalInvestigator.lastname}}</div>
        <div>{{ $readableDate experiment.startsAt }} – {{ $readableDate experiment.endsAt }}</div>
        <div>ID: {{ experiment.experimentId }}</div>
      </div>

      <div class="mb-4">
        <div>Experiment Number: <strong >{{ experiment.experimentId }}</strong></div>
        <div class="fst-italic mt-1">
          {{#if ($eq experimentSafetyStatus.shortCode 'ESF_APPROVED')}}
            Approved
          {{else if ($eq experimentSafetyStatus.shortCode 'ESF_REJECTED')}}
            Rejected
          {{/if}}
        </div>

        <div class="d-flex justify-content-between mt-3">
          <div>
            <div class="fw-bold">Experimenter</div>
            {{principalInvestigator.firstname}} {{principalInvestigator.lastname}}
          </div>
          <div>
            <div class="fw-bold">Principal Investigator</div>
            {{principalInvestigator.firstname}} {{principalInvestigator.lastname}}
          </div>
        </div>
      </div>
      
      <div class="section-title">Information by Safety Review Team</div>
      <div class="mb-3">
        {{#if ($eq this.safetyReviewQuestionary.answers.hazard_type_selection "Radioactive")}}
          <img src="http://localhost:4500/static/images/Radioactive.jpg" style="height: 100px;" />
        {{else if ($eq this.safetyReviewQuestionary.answers.hazard_type_selection "Hot")}}
          <img src="http://localhost:4500/static/images/Hot.jpg" style="height: 100px;" />
        {{else if ($eq this.safetyReviewQuestionary.answers.hazard_type_selection "Explosive")}}
          <img src="http://localhost:4500/static/images/Explosive.jpg" style="height: 100px;" />
        {{/if}}
        <h5 class="mt-2">{{ this.safetyReviewQuestionary.answers.hazard_type_selection }}</h5>
      </div>

      {{#each this.safetyReviewQuestionary.questionarySteps}}
        {{#each this.fields}}
          {{#if ($in question.dataType 'NUMBER_INPUT' 'BOOLEAN' 'INTERVAL' 'DATE' 'DYNAMIC_MULTIPLE_CHOICE' 'SELECTION_FROM_OPTIONS' 'TEXT_INPUT' 'RICH_TEXT_INPUT')}}
          <div class="mb-2">
            <span class="field-label">{{ this.question.question }}</span>:
            <span>
              {{#if ($eq this.question.dataType 'NUMBER_INPUT')}} 
                {{#if this.value.value}} {{this.value.value}} {{ this.value.unit.unit }} {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'BOOLEAN')}} 
                {{#if this.value}} Yes {{else}} No {{/if}} 
              {{else if ($eq this.question.dataType 'INTERVAL')}} 
                {{#if ($or this.value.min this.value.max)}} 
                  {{ this.value.min }} - {{ this.value.max }} 
                  {{#if this.value.unit}} {{ this.value.unit.unit }} {{/if}} 
                {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'DATE')}} 
                {{#if this.value}} {{$utcDate this.value}} {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'DYNAMIC_MULTIPLE_CHOICE')}} 
                {{#if this.value}} {{$join this.value ', '}} {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'SELECTION_FROM_OPTIONS')}} 
                {{#if this.value}} {{$join this.value ', '}} {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'TEXT_INPUT')}} 
                {{#if this.value}} {{ this.value }} {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'RICH_TEXT_INPUT')}} 
                {{#if this.value}} {{{this.value}}} {{else}} <em>Left blank</em> {{/if}} 
              {{/if}}
            </span>
          </div>
          {{/if}}
        {{/each}}
      {{/each}}

      <div class="section-title">Experiment Safety Input Submitted by the Experimenter</div>
      {{#each this.esiQuestionary.questionarySteps}}
        {{#each this.fields}}
          {{#if ($in question.dataType 'NUMBER_INPUT' 'BOOLEAN' 'INTERVAL' 'DATE' 'DYNAMIC_MULTIPLE_CHOICE' 'SELECTION_FROM_OPTIONS' 'TEXT_INPUT' 'RICH_TEXT_INPUT')}}
          <div class="mb-2">
            <span class="field-label">{{ this.question.question }}</span>:
            <span>
              {{#if ($eq this.question.dataType 'NUMBER_INPUT')}} 
                {{#if this.value.value}} {{this.value.value}} {{ this.value.unit.unit }} {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'BOOLEAN')}} 
                {{#if this.value}} Yes {{else}} No {{/if}} 
              {{else if ($eq this.question.dataType 'INTERVAL')}} 
                {{#if ($or this.value.min this.value.max)}} 
                  {{ this.value.min }} - {{ this.value.max }} 
                  {{#if this.value.unit}} {{ this.value.unit.unit }} {{/if}} 
                {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'DATE')}} 
                {{#if this.value}} {{$utcDate this.value}} {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'DYNAMIC_MULTIPLE_CHOICE')}} 
                {{#if this.value}} {{$join this.value ', '}} {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'SELECTION_FROM_OPTIONS')}} 
                {{#if this.value}} {{$join this.value ', '}} {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'TEXT_INPUT')}} 
                {{#if this.value}} {{ this.value }} {{else}} <em>Left blank</em> {{/if}} 
              {{else if ($eq this.question.dataType 'RICH_TEXT_INPUT')}} 
                {{#if this.value}} {{{this.value}}} {{else}} <em>Left blank</em> {{/if}} 
              {{/if}}
            </span>
          </div>
          {{/if}}
        {{/each}}
      {{/each}}

      <div class="section-title">Samples Submitted by the Experimenter</div>
      {{#each experimentSamples}}
        <div class="sample-block">
          <div class="fw-bold fs-6 mb-3">Sample: {{this.sample.title}}</div>
          {{#each this.sampleESIQuestionary.questionarySteps}}
            {{#each this.fields}}
              {{#if ($in question.dataType 'NUMBER_INPUT' 'BOOLEAN' 'INTERVAL' 'DATE' 'DYNAMIC_MULTIPLE_CHOICE' 'SELECTION_FROM_OPTIONS' 'TEXT_INPUT' 'RICH_TEXT_INPUT')}}
              <div class="mb-2">
                <span class="field-label">{{ this.question.question }}</span>:
                <span>
                  {{#if ($eq this.question.dataType 'NUMBER_INPUT')}} 
                    {{#if this.value.value}} 
                      {{this.value.value}} {{ this.value.unit.unit }} 
                    {{else}} <em>Left blank</em> {{/if}} 
                  {{else if ($eq this.question.dataType 'BOOLEAN')}} 
                    {{#if this.value}} Yes {{else}} No {{/if}} 
                  {{else if ($eq this.question.dataType 'INTERVAL')}} 
                    {{#if ($or this.value.min this.value.max)}} 
                      {{ this.value.min }} - {{ this.value.max }} 
                      {{#if this.value.unit}} {{ this.value.unit.unit }} {{/if}} 
                    {{else}} <em>Left blank</em> {{/if}} 
                  {{else if ($eq this.question.dataType 'DATE')}} 
                    {{#if this.value}} {{$utcDate this.value}} {{else}} <em>Left blank</em> {{/if}} 
                  {{else if ($eq this.question.dataType 'DYNAMIC_MULTIPLE_CHOICE')}} 
                    {{#if this.value}} {{$join this.value ', '}} {{else}} <em>Left blank</em> {{/if}} 
                  {{else if ($eq this.question.dataType 'SELECTION_FROM_OPTIONS')}} 
                    {{#if this.value}} {{$join this.value ', '}} {{else}} <em>Left blank</em> {{/if}} 
                  {{else if ($eq this.question.dataType 'TEXT_INPUT')}} 
                    {{#if this.value}} {{ this.value }} {{else}} <em>Left blank</em> {{/if}} 
                  {{else if ($eq this.question.dataType 'RICH_TEXT_INPUT')}} 
                    {{#if this.value}} {{{this.value}}} {{else}} <em>Left blank</em> {{/if}} 
                  {{/if}}
                </span>
              </div>
              {{/if}}
            {{/each}}
          {{/each}}
        </div>
      {{/each}}
    </div>

    <script>
      const category = '{{ this.safetyReviewQuestionary.answers.hazard_category_selection }}';
      const pageBorder = document.getElementById('pageBorder');
      pageBorder.classList.remove('page-border-red', 'page-border-green', 'page-border-yellow');
      switch (category) {
        case 'HIGH':
          pageBorder.classList.add('page-border-red');
          break;
        case 'MEDIUM':
          pageBorder.classList.add('page-border-yellow');
          break;
        case 'LOW':
          pageBorder.classList.add('page-border-green');
          break;
      }
    </script>
  </body>
</html>
`;

export const experimentHeader = ``;

export const experimentFooter = ``;

export const experimentDummyData = `{
  "data": {
    "proposal": {
      "primaryKey": 5,
      "title": "Simulating PDF 1",
      "abstract": "Simulating PDF 1",
      "proposerId": 2,
      "statusId": 8,
      "created": "2025-05-23T11:23:56.934Z",
      "updated": "2025-05-23T11:32:28.493Z",
      "proposalId": "835612",
      "finalStatus": 1,
      "callId": 36,
      "questionaryId": 48,
      "commentForUser": "",
      "commentForManagement": "",
      "notified": false,
      "submitted": true,
      "referenceNumberSequence": 0,
      "managementDecisionSubmitted": true,
      "submittedDate": "2025-05-23T11:28:54.816Z",
      "experimentSequence": 2
    },
    "principalInvestigator": {
      "id": 2,
      "firstname": "Anders",
      "lastname": "Andersson",
      "preferredname": "Alexander",
      "institution": "Other",
      "institutionId": 1,
      "position": "Liaison",
      "created": "2025-05-12T09:41:03.374Z",
      "placeholder": false,
      "email": "Aaron_Harris49@gmail.com"
    },
    "experiment": {
      "experimentPk": 2,
      "experimentId": "835612-1",
      "startsAt": "2025-05-25T07:00:00.000Z",
      "endsAt": "2025-05-26T07:00:00.000Z",
      "scheduledEventId": 40,
      "proposalPk": 5,
      "status": "ACTIVE",
      "localContactId": null,
      "instrumentId": 1,
      "createdAt": "2025-05-23T11:32:28.493Z",
      "updatedAt": "2025-05-23T11:32:28.493Z",
      "referenceNumberSequence": 1
    },
    "experimentSafety": {
      "experimentSafetyPk": 4,
      "experimentPk": 2,
      "esiQuestionaryId": 52,
      "esiQuestionarySubmittedAt": "2025-05-23T11:36:51.473Z",
      "createdBy": 2,
      "statusId": 21,
      "safetyReviewQuestionaryId": 54,
      "reviewedBy": 2,
      "createdAt": "2025-05-23T11:33:34.356Z",
      "updatedAt": "2025-05-23T11:52:56.809Z",
      "instrumentScientistDecision": null,
      "instrumentScientistComment": null,
      "experimentSafetyReviewerDecision": 1,
      "experimentSafetyReviewerComment": "All safety measures have been reviewed and deemed adequate. Ensure ongoing risk assessments during the experiment. Emergency protocols must be clearly communicated to all personnel involved at the experiment site."
    },
    "expermientSafetyStatus": {
      "id": 21,
      "shortCode": "ESF_APPROVED",
      "name": "Experiment Safety Approved",
      "description": "The experiment safety has been approved by the safety review team.",
      "isDefault": false,
      "entityType": "EXPERIMENT_SAFETY"
    },
    "esiQuestionary": {
      "questionarySteps": [
        {
          "questionaryId": 52,
          "topic": {
            "id": 37,
            "title": "New experiment safety input",
            "templateId": 35,
            "sortOrder": 0,
            "isEnabled": true
          },
          "isCompleted": true,
          "fields": [
            {
              "question": {
                "categoryId": 1,
                "id": "proposal_esi_basis",
                "naturalKey": "proposal_esi_basis",
                "dataType": "PROPOSAL_ESI_BASIS",
                "question": "Proposal ESI basis",
                "config": {
                  "tooltip": "",
                  "required": false,
                  "small_label": ""
                }
              },
              "topicId": 37,
              "sortOrder": 0,
              "config": {
                "tooltip": "",
                "required": false,
                "small_label": ""
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": null,
              "value": null
            },
            {
              "question": {
                "categoryId": 1,
                "id": "text_input_1731936230475",
                "naturalKey": "text_input_1731936230475",
                "dataType": "TEXT_INPUT",
                "question": "Is there any other hazards that could be expected at the experiment site?",
                "config": {
                  "required": true,
                  "small_label": "",
                  "tooltip": "",
                  "htmlQuestion": "",
                  "isHtmlQuestion": false,
                  "min": null,
                  "max": null,
                  "multiline": false,
                  "placeholder": "",
                  "isCounterHidden": false
                }
              },
              "topicId": 37,
              "sortOrder": 1,
              "config": {
                "required": true,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": null,
                "max": null,
                "multiline": false,
                "placeholder": "",
                "isCounterHidden": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 320,
              "value": "Yes, several potential hazards may be present at the experiment site depending on the setup. These include electrical hazards from equipment, chemical exposure from spills or fumes, and biological risks if handling microorganisms. Mechanical injuries from tools, fire hazards from flammable materials, or radiation exposure may also occur. Additionally, slips, trips, and falls due to cluttered or wet areas are possible. Poor ventilation, extreme temperatures, or noise could impact safety. A comprehensive risk assessment must be conducted beforehand to identify and mitigate these hazards. Proper training, protective equipment, and emergency procedures should be in place to ensure a safe environment."
            }
          ]
        }
      ],
      "answers": {
        "proposal_esi_basis": null,
        "text_input_1731936230475": "Yes, several potential hazards may be present at the experiment site depending on the setup. These include electrical hazards from equipment, chemical exposure from spills or fumes, and biological risks if handling microorganisms. Mechanical injuries from tools, fire hazards from flammable materials, or radiation exposure may also occur. Additionally, slips, trips, and falls due to cluttered or wet areas are possible. Poor ventilation, extreme temperatures, or noise could impact safety. A comprehensive risk assessment must be conducted beforehand to identify and mitigate these hazards. Proper training, protective equipment, and emergency procedures should be in place to ensure a safe environment."
      }
    },
    "safetyReviewQuestionary": {
      "questionarySteps": [
        {
          "questionaryId": 54,
          "topic": {
            "id": 4,
            "title": "Hazards",
            "templateId": 4,
            "sortOrder": 0,
            "isEnabled": true
          },
          "isCompleted": true,
          "fields": [
            {
              "question": {
                "categoryId": 12,
                "id": "exp_safety_review_basis",
                "naturalKey": "exp_safety_review_basis",
                "dataType": "EXP_SAFETY_REVIEW_BASIS",
                "question": "Experiment Safety review basic information",
                "config": {
                  "tooltip": "",
                  "required": false,
                  "small_label": ""
                }
              },
              "topicId": 4,
              "sortOrder": 0,
              "config": {
                "tooltip": "",
                "required": false,
                "small_label": ""
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": null,
              "value": null
            },
            {
              "question": {
                "categoryId": 12,
                "id": "number_input_1748000383113",
                "naturalKey": "number_input_1748000383113",
                "dataType": "NUMBER_INPUT",
                "question": "Activity of nuclides (Bq)",
                "config": {
                  "small_label": "",
                  "required": true,
                  "tooltip": "",
                  "units": [],
                  "numberValueConstraint": null
                }
              },
              "topicId": 4,
              "sortOrder": 1,
              "config": {
                "small_label": "",
                "required": true,
                "tooltip": "",
                "units": [],
                "numberValueConstraint": null
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 332,
              "value": {
                "unit": null,
                "value": 1,
                "siValue": 1
              }
            },
            {
              "question": {
                "categoryId": 12,
                "id": "number_input_1748000403569",
                "naturalKey": "number_input_1748000403569",
                "dataType": "NUMBER_INPUT",
                "question": "Dose rate (uSv/Hr):",
                "config": {
                  "small_label": "",
                  "required": true,
                  "tooltip": "",
                  "units": [],
                  "numberValueConstraint": null
                }
              },
              "topicId": 4,
              "sortOrder": 2,
              "config": {
                "small_label": "",
                "required": true,
                "tooltip": "",
                "units": [],
                "numberValueConstraint": null
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 333,
              "value": {
                "unit": null,
                "value": 1,
                "siValue": 1
              }
            },
            {
              "question": {
                "categoryId": 12,
                "id": "selection_from_options_1748000429923",
                "naturalKey": "selection_from_options_1748000429923",
                "dataType": "SELECTION_FROM_OPTIONS",
                "question": "Containment",
                "config": {
                  "small_label": "",
                  "required": false,
                  "tooltip": "",
                  "variant": "radio",
                  "options": [
                    "Cold Box",
                    "Hot Box"
                  ],
                  "isMultipleSelect": false
                }
              },
              "topicId": 4,
              "sortOrder": 3,
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": "",
                "variant": "radio",
                "options": [
                  "Cold Box",
                  "Hot Box"
                ],
                "isMultipleSelect": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 334,
              "value": [
                "Cold Box"
              ]
            },
            {
              "question": {
                "categoryId": 12,
                "id": "text_input_1748000472287",
                "naturalKey": "text_input_1748000472287",
                "dataType": "TEXT_INPUT",
                "question": "Facility Internal Code",
                "config": {
                  "required": true,
                  "small_label": "",
                  "tooltip": "",
                  "htmlQuestion": "",
                  "isHtmlQuestion": false,
                  "min": null,
                  "max": null,
                  "multiline": false,
                  "placeholder": "",
                  "isCounterHidden": false
                }
              },
              "topicId": 4,
              "sortOrder": 4,
              "config": {
                "required": true,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": null,
                "max": null,
                "multiline": false,
                "placeholder": "",
                "isCounterHidden": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 335,
              "value": "BIO-FAC-12A"
            },
            {
              "question": {
                "categoryId": 12,
                "id": "selection_from_options_1748001057358",
                "naturalKey": "hazard_category_selection",
                "dataType": "SELECTION_FROM_OPTIONS",
                "question": "Hazard Category",
                "config": {
                  "small_label": "",
                  "required": true,
                  "tooltip": "",
                  "variant": "radio",
                  "options": [
                    "LOW",
                    "MEDIUM",
                    "HIGH"
                  ],
                  "isMultipleSelect": false
                }
              },
              "topicId": 4,
              "sortOrder": 5,
              "config": {
                "small_label": "",
                "required": true,
                "tooltip": "",
                "variant": "radio",
                "options": [
                  "LOW",
                  "MEDIUM",
                  "HIGH"
                ],
                "isMultipleSelect": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 336,
              "value": [
                "HIGH"
              ]
            },
            {
              "question": {
                "categoryId": 12,
                "id": "selection_from_options_1748001098877",
                "naturalKey": "hazard_type_selection",
                "dataType": "SELECTION_FROM_OPTIONS",
                "question": "Hazard Type",
                "config": {
                  "small_label": "",
                  "required": false,
                  "tooltip": "",
                  "variant": "radio",
                  "options": [
                    "Radioactive",
                    "Hot",
                    "Explosive"
                  ],
                  "isMultipleSelect": false
                }
              },
              "topicId": 4,
              "sortOrder": 6,
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": "",
                "variant": "radio",
                "options": [
                  "Radioactive",
                  "Hot",
                  "Explosive"
                ],
                "isMultipleSelect": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 337,
              "value": [
                "Radioactive"
              ]
            }
          ]
        },
        {
          "questionaryId": 54,
          "topic": {
            "id": 55,
            "title": "Disposal/Removal",
            "templateId": 4,
            "sortOrder": 1,
            "isEnabled": true
          },
          "isCompleted": true,
          "fields": [
            {
              "question": {
                "categoryId": 12,
                "id": "text_input_1748000538044",
                "naturalKey": "text_input_1748000538044",
                "dataType": "TEXT_INPUT",
                "question": "How is the Displosal being handled?",
                "config": {
                  "required": true,
                  "small_label": "",
                  "tooltip": "",
                  "htmlQuestion": "",
                  "isHtmlQuestion": false,
                  "min": null,
                  "max": null,
                  "multiline": false,
                  "placeholder": "",
                  "isCounterHidden": false
                }
              },
              "topicId": 55,
              "sortOrder": 0,
              "config": {
                "required": true,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": null,
                "max": null,
                "multiline": false,
                "placeholder": "",
                "isCounterHidden": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 344,
              "value": "Disposal is managed in accordance with safety and environmental regulations. All waste materials are categorized, labeled, and stored properly before being collected by certified disposal services. Hazardous substances are handled with special procedures to prevent contamination. Regular audits ensure compliance with disposal protocols and proper documentation is maintained."
            }
          ]
        },
        {
          "questionaryId": 54,
          "topic": {
            "id": 56,
            "title": "Transport Information",
            "templateId": 4,
            "sortOrder": 2,
            "isEnabled": true
          },
          "isCompleted": true,
          "fields": [
            {
              "question": {
                "categoryId": 12,
                "id": "text_input_1748000566303",
                "naturalKey": "text_input_1748000566303",
                "dataType": "TEXT_INPUT",
                "question": "UN",
                "config": {
                  "required": false,
                  "small_label": "",
                  "tooltip": "",
                  "htmlQuestion": "",
                  "isHtmlQuestion": false,
                  "min": null,
                  "max": null,
                  "multiline": false,
                  "placeholder": "",
                  "isCounterHidden": false
                }
              },
              "topicId": 56,
              "sortOrder": 0,
              "config": {
                "required": false,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": null,
                "max": null,
                "multiline": false,
                "placeholder": "",
                "isCounterHidden": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 339,
              "value": "1234"
            },
            {
              "question": {
                "categoryId": 12,
                "id": "text_input_1748000603450",
                "naturalKey": "text_input_1748000603450",
                "dataType": "TEXT_INPUT",
                "question": "PG I ",
                "config": {
                  "required": false,
                  "small_label": "",
                  "tooltip": "",
                  "htmlQuestion": "",
                  "isHtmlQuestion": false,
                  "min": null,
                  "max": null,
                  "multiline": false,
                  "placeholder": "",
                  "isCounterHidden": false
                }
              },
              "topicId": 56,
              "sortOrder": 1,
              "config": {
                "required": false,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": null,
                "max": null,
                "multiline": false,
                "placeholder": "",
                "isCounterHidden": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 340,
              "value": "Substances presenting high danger"
            },
            {
              "question": {
                "categoryId": 12,
                "id": "text_input_1748000612898",
                "naturalKey": "text_input_1748000612898",
                "dataType": "TEXT_INPUT",
                "question": "Proper Shipping Name",
                "config": {
                  "required": false,
                  "small_label": "",
                  "tooltip": "",
                  "htmlQuestion": "",
                  "isHtmlQuestion": false,
                  "min": null,
                  "max": null,
                  "multiline": false,
                  "placeholder": "",
                  "isCounterHidden": false
                }
              },
              "topicId": 56,
              "sortOrder": 2,
              "config": {
                "required": false,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": null,
                "max": null,
                "multiline": false,
                "placeholder": "",
                "isCounterHidden": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 341,
              "value": "MAERSK"
            },
            {
              "question": {
                "categoryId": 12,
                "id": "text_input_1748000592588",
                "naturalKey": "text_input_1748000592588",
                "dataType": "TEXT_INPUT",
                "question": "Subsidiary Hazard",
                "config": {
                  "required": false,
                  "small_label": "",
                  "tooltip": "",
                  "htmlQuestion": "",
                  "isHtmlQuestion": false,
                  "min": null,
                  "max": null,
                  "multiline": false,
                  "placeholder": "",
                  "isCounterHidden": false
                }
              },
              "topicId": 56,
              "sortOrder": 4,
              "config": {
                "required": false,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": null,
                "max": null,
                "multiline": false,
                "placeholder": "",
                "isCounterHidden": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 342,
              "value": "A subsidiary hazard is a secondary risk associated with a substance or activity, in addition to its primary hazard. For example, a chemical may be primarily flammable but also pose a toxic or corrosive risk. Subsidiary hazards must be clearly identified to ensure proper handling, storage, and emergency response."
            },
            {
              "question": {
                "categoryId": 12,
                "id": "text_input_1748000582062",
                "naturalKey": "text_input_1748000582062",
                "dataType": "TEXT_INPUT",
                "question": "Class",
                "config": {
                  "required": false,
                  "small_label": "",
                  "tooltip": "",
                  "htmlQuestion": "",
                  "isHtmlQuestion": false,
                  "min": null,
                  "max": null,
                  "multiline": false,
                  "placeholder": "",
                  "isCounterHidden": false
                }
              },
              "topicId": 56,
              "sortOrder": 5,
              "config": {
                "required": false,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": null,
                "max": null,
                "multiline": false,
                "placeholder": "",
                "isCounterHidden": false
              },
              "dependencies": [],
              "dependenciesOperator": "AND",
              "answerId": 343,
              "value": "1 Explosive"
            }
          ]
        }
      ],
      "answers": {
        "exp_safety_review_basis": null,
        "number_input_1748000383113": {
          "unit": null,
          "value": 1,
          "siValue": 1
        },
        "number_input_1748000403569": {
          "unit": null,
          "value": 1,
          "siValue": 1
        },
        "selection_from_options_1748000429923": [
          "Cold Box"
        ],
        "text_input_1748000472287": "BIO-FAC-12A",
        "hazard_category_selection": [
          "HIGH"
        ],
        "hazard_type_selection": [
          "Radioactive"
        ],
        "text_input_1748000538044": "Disposal is managed in accordance with safety and environmental regulations. All waste materials are categorized, labeled, and stored properly before being collected by certified disposal services. Hazardous substances are handled with special procedures to prevent contamination. Regular audits ensure compliance with disposal protocols and proper documentation is maintained.",
        "rich_text_input_1748249172725": "<p><em><strong>asdasdasdasdasdadas</strong></em></p>",
        "text_input_1748000566303": "1234",
        "text_input_1748000603450": "Substances presenting high danger",
        "text_input_1748000612898": "MAERSK",
        "text_input_1748000592588": "A subsidiary hazard is a secondary risk associated with a substance or activity, in addition to its primary hazard. For example, a chemical may be primarily flammable but also pose a toxic or corrosive risk. Subsidiary hazards must be clearly identified to ensure proper handling, storage, and emergency response.",
        "text_input_1748000582062": "1 Explosive"
      }
    },
    "instrument": {
      "id": 1,
      "name": "Instrument1",
      "shortCode": "Instrument1",
      "description": "Instrument1",
      "managerUserId": 2
    },
    "localContact": null,
    "experimentSamples": [
      {
        "experimentSample": {
          "experimentPk": 2,
          "sampleId": 4,
          "isEsiSubmitted": true,
          "sampleEsiQuestionaryId": 53,
          "createdAt": "2025-05-23T11:33:37.774Z",
          "updatedAt": "2025-05-23T11:33:37.774Z"
        },
        "sample": {
          "id": 4,
          "title": "Sample 1 ",
          "creatorId": 2,
          "proposalPk": 5,
          "questionaryId": 50,
          "questionId": "sample_declaration_1747832567995",
          "isPostProposalSubmission": false,
          "safetyStatus": 0,
          "safetyComment": "",
          "created": "2025-05-23T11:27:57.958Z",
          "shipmentId": null
        },
        "sampleESIQuestionary": {
          "questionarySteps": [
            {
              "questionaryId": 53,
              "topic": {
                "id": 38,
                "title": "New experiment safety input",
                "templateId": 36,
                "sortOrder": 0,
                "isEnabled": true
              },
              "isCompleted": true,
              "fields": [
                {
                  "question": {
                    "categoryId": 2,
                    "id": "sample_esi_basis",
                    "naturalKey": "sample_esi_basis",
                    "dataType": "SAMPLE_ESI_BASIS",
                    "question": "Sample ESI basic information",
                    "config": {
                      "tooltip": "",
                      "required": false,
                      "small_label": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 0,
                  "config": {
                    "tooltip": "",
                    "required": false,
                    "small_label": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": null,
                  "value": null
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602681963527",
                    "naturalKey": "boolean_1602681963527",
                    "dataType": "BOOLEAN",
                    "question": "Are there any Radioactive hazards associated with your sample?",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 1,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 269,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "embellishment_1601536727146",
                    "naturalKey": "embellishment_1601536727146_sample",
                    "dataType": "EMBELLISHMENT",
                    "question": "New question",
                    "config": {
                      "html": "<div class='row' style='caret-color: #000000; font-family: -webkit-standard; text-size-adjust: auto;'><div class='col col-12 apex-col-auto'><div id='P67_SMPL_MSG_CONTAINER' class='t-Form-fieldContainer t-Form-fieldContainer--hiddenLabel rel-col  apex-item-wrapper apex-item-wrapper--display-only '><div class='t-Form-inputContainer col col-10'><div class='t-Form-itemWrapper'><span id='P67_SMPL_MSG' class='display_only apex-item-display-only'>When entering your sample(s), please include information for the entire composition; e.g. solvents, substrates, buffers, films, and other matrices in addition to the part of the sample(s) that is the primary focus of your analysis.<br />In case of solutions, please include highest concentration anticipated (mass).<span class='Apple-converted-space'>&nbsp;</span><a id='myLink' href='#'></a></span><label id='P67_SMPL_NM_LABEL' class='t-Form-label' for='P67_SMPL_NM'></label></div></div></div></div></div>",
                      "plain": "Sample Embellishment",
                      "omitFromPdf": true
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 2,
                  "config": {
                    "html": "<div class='row' style='caret-color: #000000; font-family: -webkit-standard; text-size-adjust: auto;'><div class='col col-12 apex-col-auto'><div id='P67_SMPL_MSG_CONTAINER' class='t-Form-fieldContainer t-Form-fieldContainer--hiddenLabel rel-col  apex-item-wrapper apex-item-wrapper--display-only '><div class='t-Form-inputContainer col col-10'><div class='t-Form-itemWrapper'><span id='P67_SMPL_MSG' class='display_only apex-item-display-only'>When entering your sample(s), please include information for the entire composition; e.g. solvents, substrates, buffers, films, and other matrices in addition to the part of the sample(s) that is the primary focus of your analysis.<br />In case of solutions, please include highest concentration anticipated (mass).<span class='Apple-converted-space'>&nbsp;</span><a id='myLink' href='#'></a></span><label id='P67_SMPL_NM_LABEL' class='t-Form-label' for='P67_SMPL_NM'></label></div></div></div></div></div>",
                    "plain": "Sample Embellishment",
                    "omitFromPdf": true
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": null,
                  "value": null
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773459215",
                    "naturalKey": "boolean_1602773459215",
                    "dataType": "BOOLEAN",
                    "question": "10 Tesla Magnet",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 3,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 270,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "file_upload_1747832647573",
                    "naturalKey": "file_upload_1747832647573",
                    "dataType": "FILE_UPLOAD",
                    "question": "Upload",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": "",
                      "file_type": [
                        ".pdf"
                      ],
                      "pdf_page_limit": 1,
                      "max_files": 1,
                      "omitFromPdf": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 4,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": "",
                    "file_type": [
                      ".pdf"
                    ],
                    "pdf_page_limit": 1,
                    "max_files": 1,
                    "omitFromPdf": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 271,
                  "value": [
                    {
                      "id": "a86246a0-516f-4bec-a599-79ac1abb78ec"
                    }
                  ]
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1747832636160",
                    "naturalKey": "boolean_1747832636160",
                    "dataType": "BOOLEAN",
                    "question": "Yes/No",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 5,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 272,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1602681978151",
                    "naturalKey": "text_input_1602681978151",
                    "dataType": "TEXT_INPUT",
                    "question": "Please give more details (max 100 characters)",
                    "config": {
                      "required": true,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": true,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 6,
                  "config": {
                    "required": true,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": true,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 273,
                  "value": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1603713538053",
                    "naturalKey": "text_input_1603713538053",
                    "dataType": "TEXT_INPUT",
                    "question": "Total number of the same sample",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 7,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 274,
                  "value": "23"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1603713303928",
                    "naturalKey": "text_input_1603713303928",
                    "dataType": "TEXT_INPUT",
                    "question": "Please give details",
                    "config": {
                      "required": true,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 8,
                  "config": {
                    "required": true,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 275,
                  "value": "Lorem ipsum dolor sit amet consectetur"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602682083541",
                    "naturalKey": "boolean_1602682083541",
                    "dataType": "BOOLEAN",
                    "question": "Is your sample sensitive to water vapour?",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 9,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 276,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773488341",
                    "naturalKey": "boolean_1602773488341",
                    "dataType": "BOOLEAN",
                    "question": "Water Bath",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 10,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 277,
                  "value": false
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "embellishment_1602684762285",
                    "naturalKey": "embellishment_1602684762285",
                    "dataType": "EMBELLISHMENT",
                    "question": "New question",
                    "config": {
                      "html": "<p><span style='color: #8a6d3b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; background-color: #fcf8e3;'>Please note that a more detailed Experiment Risk Assessment will be required for all successful proposals before an experiment is run.</span></p>",
                      "plain": "New embellishment",
                      "omitFromPdf": true
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 11,
                  "config": {
                    "html": "<p><span style='color: #8a6d3b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; background-color: #fcf8e3;'>Please note that a more detailed Experiment Risk Assessment will be required for all successful proposals before an experiment is run.</span></p>",
                    "plain": "New embellishment",
                    "omitFromPdf": true
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": null,
                  "value": null
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1603713560048",
                    "naturalKey": "text_input_1603713560048",
                    "dataType": "TEXT_INPUT",
                    "question": "Temperature required for neutron measurement",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 12,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 278,
                  "value": "23"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1602684572056",
                    "naturalKey": "text_input_1602684572056",
                    "dataType": "TEXT_INPUT",
                    "question": "Please give details (max 100 characters)",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": true,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 13,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": true,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 279,
                  "value": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1603713516881",
                    "naturalKey": "text_input_1603713516881",
                    "dataType": "TEXT_INPUT",
                    "question": "Density (g/cm*3)",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 14,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 280,
                  "value": "111"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1602681886438",
                    "naturalKey": "text_input_1602681886438",
                    "dataType": "TEXT_INPUT",
                    "question": "Details of any specialist equipment or user supplied equipment",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 15,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 281,
                  "value": "Additional Details"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773442532",
                    "naturalKey": "boolean_1602773442532",
                    "dataType": "BOOLEAN",
                    "question": "7.5 Tesla Magnet",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 16,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 282,
                  "value": false
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773280956",
                    "naturalKey": "boolean_1602773280956",
                    "dataType": "BOOLEAN",
                    "question": "CCR",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 17,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 283,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773331017",
                    "naturalKey": "boolean_1602773331017",
                    "dataType": "BOOLEAN",
                    "question": "Cryofurnace",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 18,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 284,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602684475301",
                    "naturalKey": "boolean_1602684475301",
                    "dataType": "BOOLEAN",
                    "question": "Are there any other hazards associated with experiment equipment? ",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 19,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 285,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1602681867032",
                    "naturalKey": "text_input_1602681867032",
                    "dataType": "TEXT_INPUT",
                    "question": "Magnetic field strength(T)",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 20,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 286,
                  "value": "33"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "selection_from_options_1601536990025",
                    "naturalKey": "selection_from_options_1601536990025",
                    "dataType": "SELECTION_FROM_OPTIONS",
                    "question": "Special Requirements",
                    "config": {
                      "small_label": "",
                      "required": true,
                      "tooltip": "",
                      "variant": "radio",
                      "options": [
                        "Extremely fragile",
                        "None",
                        "Open under low ppm O2/H2O",
                        "Store at -20C",
                        "Store at -80C",
                        "Store at 4C",
                        "Store in desiccator",
                        "Store in helium glove box",
                        "Store in nitrogen dry box",
                        "Store under vacuum",
                        "Other"
                      ],
                      "isMultipleSelect": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 21,
                  "config": {
                    "small_label": "",
                    "required": true,
                    "tooltip": "",
                    "variant": "radio",
                    "options": [
                      "Extremely fragile",
                      "None",
                      "Open under low ppm O2/H2O",
                      "Store at -20C",
                      "Store at -80C",
                      "Store at 4C",
                      "Store in desiccator",
                      "Store in helium glove box",
                      "Store in nitrogen dry box",
                      "Store under vacuum",
                      "Other"
                    ],
                    "isMultipleSelect": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 287,
                  "value": [
                    "Store at 4C"
                  ]
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773765442",
                    "naturalKey": "boolean_1602773765442",
                    "dataType": "BOOLEAN",
                    "question": "Explosive",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 22,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 288,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "selection_from_options_1601536868245",
                    "naturalKey": "selection_from_options_1601536868245",
                    "dataType": "SELECTION_FROM_OPTIONS",
                    "question": "Form",
                    "config": {
                      "small_label": "",
                      "required": true,
                      "tooltip": "",
                      "variant": "radio",
                      "options": [
                        "None",
                        "Nanomaterials",
                        "Polycrystal",
                        "Polymer",
                        "Powder",
                        "Single Crystal",
                        "Soil",
                        "Thin Film",
                        "Liquid",
                        "Gas",
                        "Other"
                      ],
                      "isMultipleSelect": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 23,
                  "config": {
                    "small_label": "",
                    "required": true,
                    "tooltip": "",
                    "variant": "radio",
                    "options": [
                      "None",
                      "Nanomaterials",
                      "Polycrystal",
                      "Polymer",
                      "Powder",
                      "Single Crystal",
                      "Soil",
                      "Thin Film",
                      "Liquid",
                      "Gas",
                      "Other"
                    ],
                    "isMultipleSelect": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 289,
                  "value": [
                    "Polymer"
                  ]
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1602681814172",
                    "naturalKey": "text_input_1602681814172",
                    "dataType": "TEXT_INPUT",
                    "question": "Temperatur Range(K)",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 24,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 290,
                  "value": "11"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773395929",
                    "naturalKey": "boolean_1602773395929",
                    "dataType": "BOOLEAN",
                    "question": "High Pressure",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 25,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 291,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "selection_from_options_1603713436108",
                    "naturalKey": "selection_from_options_1603713436108",
                    "dataType": "SELECTION_FROM_OPTIONS",
                    "question": "Sample mass or volume",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": "",
                      "variant": "dropdown",
                      "options": [
                        "ug",
                        "mg",
                        "g",
                        "kg",
                        "uL",
                        "mL",
                        "L"
                      ],
                      "isMultipleSelect": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 26,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": "",
                    "variant": "dropdown",
                    "options": [
                      "ug",
                      "mg",
                      "g",
                      "kg",
                      "uL",
                      "mL",
                      "L"
                    ],
                    "isMultipleSelect": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 292,
                  "value": [
                    "mg"
                  ]
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1602676349290",
                    "naturalKey": "text_input_1602676349290",
                    "dataType": "TEXT_INPUT",
                    "question": "Please give details",
                    "config": {
                      "required": true,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 27,
                  "config": {
                    "required": true,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 293,
                  "value": "adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773734839",
                    "naturalKey": "boolean_1602773734839",
                    "dataType": "BOOLEAN",
                    "question": "Flammable",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 28,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 294,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773256185",
                    "naturalKey": "boolean_1602773256185",
                    "dataType": "BOOLEAN",
                    "question": "Helium Cryostat",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 29,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 295,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1602681849961",
                    "naturalKey": "text_input_1602681849961",
                    "dataType": "TEXT_INPUT",
                    "question": "Pressure range(MPa)",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 30,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 296,
                  "value": "22"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773373453",
                    "naturalKey": "boolean_1602773373453",
                    "dataType": "BOOLEAN",
                    "question": "Furnace",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 31,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 297,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773700421",
                    "naturalKey": "boolean_1602773700421",
                    "dataType": "BOOLEAN",
                    "question": "Corrosive",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 32,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 298,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773302193",
                    "naturalKey": "boolean_1602773302193",
                    "dataType": "BOOLEAN",
                    "question": "T < 1K cryostat",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 33,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 299,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "selection_from_options_1602684676663",
                    "naturalKey": "selection_from_options_1602684676663",
                    "dataType": "SELECTION_FROM_OPTIONS",
                    "question": "After the experiment the sample will be",
                    "config": {
                      "small_label": "",
                      "required": true,
                      "tooltip": "",
                      "variant": "dropdown",
                      "options": [
                        "Removed By User",
                        "Returned to user by RAL (when inactive)",
                        "Diposed of by RAL"
                      ],
                      "isMultipleSelect": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 34,
                  "config": {
                    "small_label": "",
                    "required": true,
                    "tooltip": "",
                    "variant": "dropdown",
                    "options": [
                      "Removed By User",
                      "Returned to user by RAL (when inactive)",
                      "Diposed of by RAL"
                    ],
                    "isMultipleSelect": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 300,
                  "value": [
                    "Removed By User"
                  ]
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "file_upload_1601537324380",
                    "naturalKey": "file_upload_1601537324380",
                    "dataType": "FILE_UPLOAD",
                    "question": "Add File(s)  Please attach all related Safety Data Sheets (SDS) and Crystallographic Information (CIF) files.",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": "",
                      "file_type": [],
                      "pdf_page_limit": 0,
                      "max_files": 1,
                      "omitFromPdf": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 35,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": "",
                    "file_type": [],
                    "pdf_page_limit": 0,
                    "max_files": 1,
                    "omitFromPdf": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 301,
                  "value": []
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773419327",
                    "naturalKey": "boolean_1602773419327",
                    "dataType": "BOOLEAN",
                    "question": "1.5 Tesla Magnet",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 36,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 302,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773317392",
                    "naturalKey": "boolean_1602773317392",
                    "dataType": "BOOLEAN",
                    "question": "T < 0.3K cryostat",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 37,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 303,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1603713162762",
                    "naturalKey": "text_input_1603713162762",
                    "dataType": "TEXT_INPUT",
                    "question": "Quantity (e.g.weight, volume, thickness)",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 38,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 304,
                  "value": "100"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602684552338",
                    "naturalKey": "boolean_1602684552338",
                    "dataType": "BOOLEAN",
                    "question": "Are there any other hazards associated with the experiment?",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 39,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 305,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773508081",
                    "naturalKey": "boolean_1602773508081",
                    "dataType": "BOOLEAN",
                    "question": "Sample Changer",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 40,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 306,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773353268",
                    "naturalKey": "boolean_1602773353268",
                    "dataType": "BOOLEAN",
                    "question": "Gas Handling",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 41,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 307,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773780009",
                    "naturalKey": "other_hazard",
                    "dataType": "BOOLEAN",
                    "question": "Other",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 42,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 308,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773681572",
                    "naturalKey": "boolean_1602773681572",
                    "dataType": "BOOLEAN",
                    "question": "Toxic",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 43,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 309,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602682066934",
                    "naturalKey": "boolean_1602682066934",
                    "dataType": "BOOLEAN",
                    "question": "Is your sample sensitive to air?",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 44,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 310,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1602684496739",
                    "naturalKey": "text_input_1602684496739",
                    "dataType": "TEXT_INPUT",
                    "question": "Please give details (max 100 characters)",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": true,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 45,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": true,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 311,
                  "value": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1603874407022",
                    "naturalKey": "text_input_1603874407022",
                    "dataType": "TEXT_INPUT",
                    "question": "Additional components",
                    "config": {
                      "required": true,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 46,
                  "config": {
                    "required": true,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 312,
                  "value": "Additional Components"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1602682939107",
                    "naturalKey": "text_input_1602682939107",
                    "dataType": "TEXT_INPUT",
                    "question": "Please give details (max 255 characters)",
                    "config": {
                      "required": true,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": true,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 47,
                  "config": {
                    "required": true,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": true,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 313,
                  "value": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1603713145780",
                    "naturalKey": "text_input_1603713145780",
                    "dataType": "TEXT_INPUT",
                    "question": "Chemical formula",
                    "config": {
                      "required": true,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": true
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 48,
                  "config": {
                    "required": true,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": true
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 314,
                  "value": "H2)4Ds"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602682007458",
                    "naturalKey": "boolean_1602682007458",
                    "dataType": "BOOLEAN",
                    "question": "Are there any Biological hazards associated with your sample?",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 49,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 315,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602773230906",
                    "naturalKey": "boolean_1602773230906",
                    "dataType": "BOOLEAN",
                    "question": "Do Not Know",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 50,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 316,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "text_input_1602682027045",
                    "naturalKey": "text_input_1602682027045",
                    "dataType": "TEXT_INPUT",
                    "question": "Please give more details (max 100 characters)",
                    "config": {
                      "required": false,
                      "small_label": "",
                      "tooltip": "",
                      "htmlQuestion": null,
                      "isHtmlQuestion": false,
                      "min": null,
                      "max": null,
                      "multiline": false,
                      "placeholder": "",
                      "isCounterHidden": false
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 51,
                  "config": {
                    "required": false,
                    "small_label": "",
                    "tooltip": "",
                    "htmlQuestion": null,
                    "isHtmlQuestion": false,
                    "min": null,
                    "max": null,
                    "multiline": false,
                    "placeholder": "",
                    "isCounterHidden": false
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 317,
                  "value": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat"
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1603874937965",
                    "naturalKey": "boolean_1603874937965",
                    "dataType": "BOOLEAN",
                    "question": "Mechanical processing (e.g. stress-straining)",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 52,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 318,
                  "value": true
                },
                {
                  "question": {
                    "categoryId": 2,
                    "id": "boolean_1602682237551",
                    "naturalKey": "boolean_1602682237551",
                    "dataType": "BOOLEAN",
                    "question": "Are there any other hazards associated with your sample?",
                    "config": {
                      "small_label": "",
                      "required": false,
                      "tooltip": ""
                    }
                  },
                  "topicId": 38,
                  "sortOrder": 53,
                  "config": {
                    "small_label": "",
                    "required": false,
                    "tooltip": ""
                  },
                  "dependencies": [],
                  "dependenciesOperator": "AND",
                  "answerId": 319,
                  "value": true
                }
              ]
            }
          ],
          "answers": {
            "sample_esi_basis": null,
            "boolean_1602681963527": true,
            "embellishment_1601536727146_sample": null,
            "boolean_1602773459215": true,
            "file_upload_1747832647573": [
              {
                "id": "a86246a0-516f-4bec-a599-79ac1abb78ec"
              }
            ],
            "boolean_1747832636160": true,
            "text_input_1602681978151": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat",
            "text_input_1603713538053": "23",
            "text_input_1603713303928": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat",
            "boolean_1602682083541": true,
            "boolean_1602773488341": false,
            "embellishment_1602684762285": null,
            "text_input_1603713560048": "23",
            "text_input_1602684572056": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat",
            "text_input_1603713516881": "111",
            "text_input_1602681886438": "Additional Details",
            "boolean_1602773442532": false,
            "boolean_1602773280956": true,
            "boolean_1602773331017": true,
            "boolean_1602684475301": true,
            "text_input_1602681867032": "33",
            "selection_from_options_1601536990025": [
              "Store at 4C"
            ],
            "boolean_1602773765442": true,
            "selection_from_options_1601536868245": [
              "Polymer"
            ],
            "text_input_1602681814172": "11",
            "boolean_1602773395929": true,
            "selection_from_options_1603713436108": [
              "mg"
            ],
            "text_input_1602676349290": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat",
            "boolean_1602773734839": true,
            "boolean_1602773256185": true,
            "text_input_1602681849961": "22",
            "boolean_1602773373453": true,
            "boolean_1602773700421": true,
            "boolean_1602773302193": true,
            "selection_from_options_1602684676663": [
              "Removed By User"
            ],
            "file_upload_1601537324380": [],
            "boolean_1602773419327": true,
            "boolean_1602773317392": true,
            "text_input_1603713162762": "100",
            "boolean_1602684552338": true,
            "boolean_1602773508081": true,
            "boolean_1602773353268": true,
            "other_hazard": true,
            "boolean_1602773681572": true,
            "boolean_1602682066934": true,
            "text_input_1602684496739": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat",
            "text_input_1603874407022": "Additional Components",
            "text_input_1602682939107": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat",
            "text_input_1603713145780": "H2)4Ds",
            "boolean_1602682007458": true,
            "boolean_1602773230906": true,
            "text_input_1602682027045": "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat",
            "boolean_1603874937965": true,
            "boolean_1602682237551": true
          }
        },
        "attachments": [
          {
            "id": "a86246a0-516f-4bec-a599-79ac1abb78ec"
          }
        ]
      }
    ],
    "attachments": [
      {
        "id": "a86246a0-516f-4bec-a599-79ac1abb78ec"
      }
    ]
  }
}`;

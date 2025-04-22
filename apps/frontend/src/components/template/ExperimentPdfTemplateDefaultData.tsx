export const experimentBody = `<html lang="en">
<head>
  <meta charset="utf-8" />

  <!-- Bootstrap CSS -->
  <link
    href="http://localhost:4500/static/css/bootstrap.min.css"
    rel="stylesheet"
    integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9"
    crossorigin="anonymous"
  />

  <link href="http://localhost:4500/fonts/segoeui" rel="stylesheet">

  <style>
    body {
      font-size: 16px;
      line-height: 2;
      font-family: SegoeUI;
    }
    td,
    td h6 {
      line-height: 1.5;
    }
    .bold {
      font-weight: bold;
    }
    .w-40 {
      width: 40%;
    }
    .w-60 {
      width: 60%;
    }
    .no-break-inside {
      break-inside: avoid;
    }
    .break-before {
      break-before: page;
    }
    .link-page a::after {
      content: target-counter(attr(href), page);
    }

    .link-page::after {
      content: ', ';
    }

    .link-page:last-of-type::after {
      content: none;
    }

    .index-value::after {
      content: ' – ';
    }
  </style>
  <script src="http://localhost:4500/static/js/paged.polyfill.min.js"></script>
</head>

<body>
  <div id="bookIndex"></div>
  <div id="listindexgenerated"></div>
  <div class="root break-before" style="background: 'red'">
    <div class="container-fluid m-0 p-0">
      <div class="row" data-book-index="Experiment Summary">
        <div class="col">
          <h2 class="text-center mb-4 bold">{{ experiment.experimentId }}</h2>
          <div class="mb-4">
            <h4 class="bold">Experiment Details</h4>
            <div class="my-2">
              <span class="bold">Experiment ID:</span> {{ experiment.experimentId }}
            </div>
            <div class="my-2">
              <span class="bold">Proposal ID:</span> {{ proposal.proposalId }}
            </div>
            <div class="my-2">
              <span class="bold">Start Date:</span> {{$utcDate experiment.startsAt}}
            </div>
            <div class="my-2">
              <span class="bold">End Date:</span> {{$utcDate experiment.endsAt}}
            </div>
            {{#if instrument}}
            <div class="my-2">
              <span class="bold">Instrument:</span> {{ instrument.name }}
            </div>
            {{/if}}
            {{#if localContact}}
            <div class="my-2">
              <span class="bold">Local Contact:</span> {{ localContact.firstname }} {{ localContact.lastname }}
            </div>
            {{/if}}
          </div>

          <div class="mb-4">
            <h4 class="bold">Proposal Summary</h4>
            <div class="my-2">
              <span class="bold">Title:</span> {{ proposal.title }}
            </div>
            <div class="my-2">
              <span class="bold">Abstract:</span> {{ proposal.abstract }}
            </div>
          </div>

          <div>
            <h4 class="bold" class="mb-2">Experiment Team</h4>
            <div class="row">
              <div class="col-4">
                <p>Principal Investigator:</p>
              </div>
              <div class="col-8">
                <span
                  >{{ principalInvestigator.firstname }} {{
                  principalInvestigator.lastname }}, {{
                  principalInvestigator.position }}, {{
                  principalInvestigator.institution }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="break-before"
        data-book-index="Samples"
      >
        <h3 class="bold my-3">Samples</h3>
        {{#each samples}}
          <h4 class="bold my-3">Sample: {{this.sample.title}}</h4>
          <div class="row my-3">
            <div class="col">
              <table class="border w-100">
                <tbody class="border">
                  {{#each this.sampleQuestionaryFields}} 
                    {{#if ($eq this.question.dataType 'EMBELLISHMENT')}}
                      {{#if ($notEq this.config.omitFromPdf true )}}
                        <tr class="border-bottom">
                          <td class="p-3 border-right" colspan="2">
                            <h5 class="bold m-0">{{ this.config.plain }}</h5>
                          </td>
                        </tr>
                      {{/if}}
                    {{ else }}
                      <tr class="border-bottom no-break-inside">
                        <td class="p-3 border-right w-40">
                          <h6 class="bold m-0">{{ this.question.question }}</h6>
                        </td>
                        <td class="p-3 w-60">
                          {{#if ($eq this.question.dataType 'SAMPLE_DECLARATION')}}
                          {{#unless this.value}}
                          <div class="mb-2"><em>Left blank</em></div>
                          {{/unless}} {{#each this.value}} {{ this.title }} -
                          <em>See appendix</em>
                          <br /><br />
                          {{/each}} {{else if ($eq this.question.dataType
                          'NUMBER_INPUT')}} {{#if this.value.value}} {{
                          this.value.value }} {{ this.value.unit.unit }} {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType 'BOOLEAN')}}
                          {{#if this.value}}Yes{{else}}No{{/if}} {{else if ($eq
                          this.question.dataType 'INTERVAL')}} {{#if ($or this.value.min
                          this.value.max)}} {{ this.value.min }} - {{ this.value.max }}
                          {{#if this.value.unit}} {{ this.value.unit.unit }} {{/if}}
                          {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType 'DATE')}} {{#if
                          this.value}} {{$utcDate this.value}} {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType
                          'SELECTION_FROM_OPTIONS')}} {{#if this.value}} {{#if
                          ($isArray this.value)}} {{ this.value }} {{else}} {{ this.value
                          }} {{/if}} {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType
                          'TEXT_INPUT')}} {{#if this.value}} {{ this.value }}
                          {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType
                          'RICH_TEXT_INPUT')}} {{#if this.value}} {{{this.value}}}
                          {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType
                          'INSTRUMENT_PICKER')}} {{#if this.value}} {{{this.value}}}
                          {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType
                          'FILE_UPLOAD')}} {{!-- {{#if this.value}} {{{$attachment
                          this.value ../../attachmentsFileMeta}}} {{else}}
                          <em>Left blank</em>
                          {{/if}} --}} {{/if}}
                        </td>
                      </tr>
                    {{/if}} 
                  {{/each}}
                </tbody>
              </table>
            </div>
          </div>
        {{/each}}
      </div>

      <div
        class="break-before"
        data-book-index="Generic Templates"
      >
        <h3 class="bold my-3">Generic Templates</h3>
        {{#each genericTemplates}}
          <h4 class="bold my-3">Template: {{this.genericTemplate.title}}</h4>
          <div class="row my-3">
            <div class="col">
              <table class="border w-100">
                <tbody class="border">
                  {{#each this.genericTemplateQuestionaryFields}} 
                    {{#if ($eq this.question.dataType 'EMBELLISHMENT')}}
                      {{#if ($notEq this.config.omitFromPdf true )}}
                        <tr class="border-bottom">
                          <td class="p-3 border-right" colspan="2">
                            <h5 class="bold m-0">{{ this.config.plain }}</h5>
                          </td>
                        </tr>
                      {{/if}}
                    {{ else }}
                      <tr class="border-bottom no-break-inside">
                        <td class="p-3 border-right w-40">
                          <h6 class="bold m-0">{{ this.question.question }}</h6>
                        </td>
                        <td class="p-3 w-60">
                          {{#if ($eq this.question.dataType 'SAMPLE_DECLARATION')}}
                          {{#unless this.value}}
                          <div class="mb-2"><em>Left blank</em></div>
                          {{/unless}} {{#each this.value}} {{ this.title }} -
                          <em>See appendix</em>
                          <br /><br />
                          {{/each}} {{else if ($eq this.question.dataType
                          'NUMBER_INPUT')}} {{#if this.value.value}} {{
                          this.value.value }} {{ this.value.unit.unit }} {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType 'BOOLEAN')}}
                          {{#if this.value}}Yes{{else}}No{{/if}} {{else if ($eq
                          this.question.dataType 'INTERVAL')}} {{#if ($or this.value.min
                          this.value.max)}} {{ this.value.min }} - {{ this.value.max }}
                          {{#if this.value.unit}} {{ this.value.unit.unit }} {{/if}}
                          {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType 'DATE')}} {{#if
                          this.value}} {{$utcDate this.value}} {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType
                          'SELECTION_FROM_OPTIONS')}} {{#if this.value}} {{#if
                          ($isArray this.value)}} {{ this.value }} {{else}} {{ this.value
                          }} {{/if}} {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType
                          'TEXT_INPUT')}} {{#if this.value}} {{ this.value }}
                          {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType
                          'RICH_TEXT_INPUT')}} {{#if this.value}} {{{this.value}}}
                          {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType
                          'INSTRUMENT_PICKER')}} {{#if this.value}} {{{this.value}}}
                          {{else}}
                          <em>Left blank</em>
                          {{/if}} {{else if ($eq this.question.dataType
                          'FILE_UPLOAD')}} {{!-- {{#if this.value}} {{{$attachment
                          this.value ../../attachmentsFileMeta}}} {{else}}
                          <em>Left blank</em>
                          {{/if}} --}} {{/if}}
                        </td>
                      </tr>
                    {{/if}} 
                  {{/each}}
                </tbody>
              </table>
            </div>
          </div>
        {{/each}}
      </div>
    </div>
  </div>
</body>
<script>
  function createIndex(config) {
    let indexElements = document.querySelectorAll("[data-book-index]");
    let indices = [];
    let num = 0;
    for (let i = 0; i < indexElements.length; ++i) {
      let indexElement = indexElements[i];

      // create array with all data-book-index
      let indexKey = indexElement.dataset.bookIndex;
      let indexKeyFirst = indexKey.slice(0, 1);

      let indexParent = indexElement.dataset.bookIndexParent;
      indices.push({ indexKey, indexParent });

      // create id for span whithout
      num++;
      if (indexElement.id == '') {
        indexElement.id = 'book-index-' + num;
      }
    }

    // create <ul> element for the index
    let indexElementDiv = document.querySelector(config.indexElement);
    let indexUl = document.createElement('ul');
    indexUl.id = 'list-index-generated';
    indexElementDiv.appendChild(indexUl);

    // create <li> element for the index
    indices.forEach((index) => {
      // create <li> element for the index
      let indexNewLi = document.createElement('li');
      indexNewLi.classList.add('list-index-element');

      const indexKey = index.indexKey;
      const indexParent = index.indexParent;

      indexNewLi.dataset.listIndex = indexKey;
      if (indexParent) indexNewLi.dataset.listIndexParent = indexParent;
      indexUl.appendChild(indexNewLi);
    });

    let indexLi = document
      .getElementById('list-index-generated')
      .getElementsByClassName('list-index-element');

    for (var n = 0; n < indexLi.length; n++) {
      // find data and add HTML of the list
      let dataIndex = indexLi[n].dataset.listIndex;
      let spanIndex = document.querySelectorAll(
        "[data-book-index='" + dataIndex + "']"
      );
      indexLi[n].innerHTML =
        '<span class="index-value">' +
        dataIndex +
        '</span><span class="links-pages"></span>';

      // add span for link page
      spanIndex.forEach(function (elem) {
        let spanIndexId;
        spanIndexId = elem.id;
        let spanPage = document.createElement('span');
        spanPage.classList.add('link-page');
        spanPage.innerHTML = '<a href="#' + spanIndexId + '"></a>';
        indexLi[n]
          .getElementsByClassName('links-pages')[0]
          .appendChild(spanPage);
      });
    }
  }
  createIndex({
    indexElement: '#bookIndex',
  });
</script>
</html>
`;

export const experimentHeader = `<style>
  .logo { max-height: 54px; max-width: 150px; padding: 0; }
  .experiment-header-title{ font-size: 13px; float: right; color: rgb(0, 163,
  218); } .flex{ display: flex; padding-left: 10px; padding-right: 10px;
  justify-content: space-between; align-items: center; } .border{ border-bottom:
  2px solid rgb(0, 163, 218); width: 80%; }
</style>

<div class='border' style='width: 80%;margin: -13px auto 0 auto;'>
  <div class='flex'>
    <img src='{{{$readAsBase64 logoPath}}}' class='logo' />
    {{#if experiment.experimentId}}<p class='experiment-header-title'>Experiment
        <br />{{experiment.experimentId}}</p>
    {{/if}}
  </div>
</div>`;

export const experimentFooter = `<html>
  <head>
    <style type='text/css'>
      .content-footer { width: 100%; font-family: SegoeUI; color: black;
      padding: 15px; -webkit-print-color-adjust: exact; vertical-align: middle;
      font-size: 12px; margin-top: 0; display: inline-block; text-align: right;
      }
    </style>
  </head>
  <body>
    {{! Section containing page number }}
    <div class='content-footer'>
      Page
      <span class='pageNumber'></span>
      of
      <span class='totalPages'></span>
    </div>
  </body>
</html>
`;

export const experimentSampleDeclaration = `<html lang='en'>
  <head>
    <meta charset='utf-8' />

    <!-- Bootstrap CSS -->
    <link
      href='http://localhost:4501/static/css/bootstrap.min.css'
      rel='stylesheet'
    />

    <link href='http://localhost:4501/fonts/segoeui' rel='stylesheet' />

    <style>
      body { font-size: 16px; line-height: 2; font-family: SegoeUI; } td, td h6
      { line-height: 1.5; } .bold { font-weight: bold; } .w-40 { width: 40%; }
      .w-60 { width: 60%; } .no-break-inside { break-inside: avoid; }
      .break-before { break-before: page; } .link-page a::after { content:
      target-counter(attr(href), page); } .link-page::after { content: ', '; }
      .link-page:last-of-type::after { content: none; } .index-value::after {
      content: ' – '; }
    </style>
  </head>

  <body>
    <div class='container-fluid pt-5'>
      <div class='row'>
        <div class='col'>
          <h4 class='title'>Sample: {{sample.title}}</h4>
          <div class='row my-3'>
            <div class='col'>
              <table class='border w-100'>
                <tbody class='border'>
                  {{#each sampleQuestionaryFields}}
                    {{#if ($eq this.question.dataType 'EMBELLISHMENT')}}
                      {{#if ($notEq this.config.omitFromPdf true)}}
                        <tr class='border-bottom'>
                          <td class='p-3 border-right' colspan='2'>
                            <h5 class='bold m-0'>{{this.config.plain}}</h5>
                          </td>
                        </tr>
                      {{/if}}
                    {{else}}
                      <tr class='border-bottom no-break-inside'>
                        <td class='p-3 border-right w-40'>
                          <h6 class='bold m-0'>{{this.question.question}}</h6>
                        </td>
                        <td class='p-3 w-60'>
                          {{#if ($eq this.question.dataType 'SAMPLE_DECLARATION')}}
                            {{#unless this.value}}
                              <div class='mb-2'><em>Left blank</em></div>
                            {{/unless}}
                            {{#each this.value}}
                              {{this.title}} - <em>See appendix</em><br /><br />
                            {{/each}}
                          {{else if ($eq this.question.dataType 'NUMBER_INPUT')}}
                            {{#if this.value.value}}
                              {{this.value.value}} {{this.value.unit.unit}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if ($eq this.question.dataType 'BOOLEAN')}}
                            {{#if this.value}}Yes{{else}}No{{/if}}
                          {{else if ($eq this.question.dataType 'INTERVAL')}}
                            {{#if ($or this.value.min this.value.max)}}
                              {{this.value.min}} - {{this.value.max}}
                              {{#if this.value.unit}} {{this.value.unit.unit}} {{/if}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if ($eq this.question.dataType 'DATE')}}
                            {{#if this.value}}
                              {{$utcDate this.value}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if ($eq this.question.dataType 'SELECTION_FROM_OPTIONS')}}
                            {{#if this.value}}
                              {{#if ($isArray this.value)}}
                                {{this.value}}
                              {{else}}
                                {{this.value}}
                              {{/if}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if ($eq this.question.dataType 'TEXT_INPUT')}}
                            {{#if this.value}}
                              {{this.value}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if ($eq this.question.dataType 'RICH_TEXT_INPUT')}}
                            {{#if this.value}}
                              {{{this.value}}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if ($eq this.question.dataType 'FILE_UPLOAD')}}
                            {{#if this.value}}
                              See attachment below
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{/if}}
                        </td>
                      </tr>
                    {{/if}}
                  {{/each}}
                </tbody>
              </table>
            </div>
          </div>

          <h5 class='title'>Status:</h5>
          {{sample.status}}

          {{#if sample.safetyComment}}
            <h5 class='title mt-3'>Comment:</h5>
            {{sample.safetyComment}}
          {{/if}}
        </div>
      </div>
    </div>
  </body>
</html>
`;

export const experimentDummyData = `{
  "data": {
    "experiment": {
      "experimentPk": 1,
      "experimentId": "EXP-12345",
      "startsAt": "2023-10-20T08:00:00.000Z",
      "endsAt": "2023-10-25T16:00:00.000Z",
      "scheduledEventId": 1,
      "proposalPk": 4,
      "status": "ACTIVE",
      "localContactId": 3,
      "instrumentId": 1,
      "createdAt": "2023-10-10T13:32:18.172Z",
      "updatedAt": "2023-10-10T13:32:18.172Z"
    },
    "proposal": {
      "primaryKey": 4,
      "title": "New Proposal",
      "abstract": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
      "proposerId": 1,
      "statusId": 1,
      "created": "2023-10-18T11:38:15.429Z",
      "updated": "2023-10-18T11:39:02.691Z",
      "proposalId": "268490",
      "callId": 1,
      "questionaryId": 4,
      "notified": false,
      "submitted": true,
      "referenceNumberSequence": 3,
      "managementTimeAllocation": null,
      "managementDecisionSubmitted": false
    },
    "principalInvestigator": {
      "id": 1,
      "firstname": "Carl",
      "lastname": "Carlsson",
      "preferredname": "Carl",
      "institution": "Other",
      "institutionId": 1,
      "position": "Strategist",
      "created": "2023-10-10T13:32:18.172Z",
      "placeholder": false,
      "email": "Javon4@hotmail.com"
    },
    "localContact": {
      "id": 3,
      "firstname": "Emma",
      "lastname": "Johnson",
      "preferredname": "Emma",
      "institution": "STFC",
      "institutionId": 2,
      "position": "Instrument Scientist",
      "created": "2023-10-10T13:32:18.172Z",
      "placeholder": false,
      "email": "emma.johnson@stfc.ac.uk"
    },
    "instrument": {
      "id": 1,
      "name": "LoKi",
      "shortCode": "LOKI",
      "description": "High-bandwidth small-angle neutron scattering instrument",
      "managerUserId": 3
    },
    "questionarySteps": [],
    "samples": [
      {
        "sample": {
          "id": 1,
          "title": "Sample 1",
          "creatorId": 1,
          "questionaryId": 6,
          "safetyStatus": "LOW_RISK",
          "safetyComment": "",
          "isPostProposalSubmission": false,
          "created": "2023-10-18T11:38:15.429Z",
          "proposalPk": 4,
          "questionId": "sample_declaration_1666269436134"
        },
        "sampleQuestionaryFields": [
          {
            "question": {
              "categoryId": 1,
              "id": "boolean_1674814267658",
              "naturalKey": "boolean_1674814267658",
              "dataType": "BOOLEAN",
              "question": "Is the sample hazardous?",
              "config": {
                "small_label": "",
                "required": true,
                "tooltip": ""
              }
            },
            "topicId": 42,
            "sortOrder": 0,
            "config": {
              "small_label": "",
              "required": true,
              "tooltip": ""
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 1,
            "value": false
          }
        ]
      }
    ],
    "genericTemplates": [
      {
        "genericTemplate": {
          "id": 1,
          "title": "Data Collection Parameters",
          "creatorId": 1,
          "proposalPk": 4,
          "questionaryId": 5,
          "questionId": "generic_template_1674814357714",
          "created": "2023-10-18T11:38:39.861Z"
        },
        "genericTemplateQuestionaryFields": [
          {
            "question": {
              "categoryId": 1,
              "id": "text_input_1674814357714",
              "naturalKey": "text_input_1674814357714",
              "dataType": "TEXT_INPUT",
              "question": "Data collection notes",
              "config": {
                "required": false,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": null,
                "max": null,
                "multiline": true,
                "placeholder": "",
                "isCounterHidden": false
              }
            },
            "topicId": 43,
            "sortOrder": 0,
            "config": {
              "required": false,
              "small_label": "",
              "tooltip": "",
              "htmlQuestion": "",
              "isHtmlQuestion": false,
              "min": null,
              "max": null,
              "multiline": true,
              "placeholder": "",
              "isCounterHidden": false
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 3,
            "value": "Standard data collection with 5 minute exposure times at room temperature."
          }
        ]
      }
    ]
  },
  "userRole": {
    "shortCode": "user",
    "title": "User"
  }
}`;

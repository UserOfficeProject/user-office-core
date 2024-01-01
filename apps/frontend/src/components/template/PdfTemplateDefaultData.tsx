export const body = `<html lang="en">
<head>
  <meta charset="utf-8" />

  <!-- Bootstrap CSS -->
  <link
    href="http://localhost:4501/static/css/bootstrap.min.css"
    rel="stylesheet"
    integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9"
    crossorigin="anonymous"
  />

  <link href="http://localhost:4501/fonts/segoeui" rel="stylesheet">

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
  <script src="http://localhost:4501/static/js/paged.polyfill.min.js"></script>
</head>

<body>
  <div id="bookIndex"></div>
  <div id="listindexgenerated"></div>
  <div class="root break-before" style="background: 'red'">
    <div class="container-fluid m-0 p-0">
      <div class="row" data-book-index="Proposal Summary">
        <div class="col">
          <h2 class="text-center mb-4 bold">{{ proposal.title }}</h2>
          <div class="mb-4">
            <h4 class="bold">Proposal ID</h4>
            {{ proposal.proposalId }} {{userRole.shortCode}}
          </div>
          {{#if ($eq userRole.shortCode "user_officers")}}
            Visible to User officer
          {{/if}}
          <div class="mb-4">
            <h4 class="bold">Brief Summary</h4>
            {{ proposal.abstract }}
          </div>

          <div>
            <h4 class="bold" class="mb-2">Proposal Team</h4>
            <div class="row">
              <div class="col-4">
                <p>Proposal Investigator:</p>
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
            {{#if coProposers }}
            <div class="row">
              <div class="col-4">
                <p>Co-Investigator:</p>
              </div>
              <div class="col-8">
                {{#each coProposers}}
                <span
                  >{{ this.firstname }} {{ this.lastname }}, {{
                  this.institution }}</span
                >
                {{/each}}
              </div>
            </div>
            {{/if}}
          </div>
        </div>
      </div>

      <div
        class="break-before"
        data-book-index="Proposal Questionary"
      >
        {{#each questionarySteps}} {{#unless ($eq this.topic.title "Proposal text") }}
        <h4
          class="bold my-3"
          data-book-index-parent="Proposal Questionary"
          data-book-index="{{{this.topic.title}}}"
        >
          {{ this.topic.title }}
        </h4>
        <div class="row my-3">
          <div class="col">
            <table class="border w-100">
              <tbody class="border">
                {{#each this.fields}} 
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
                      this.question.dataType 'INTERVAL')}} {{#if ($or
                      this.value.min this.value.max)}} {{ this.value.min }} - {{
                      this.value.max }} {{#if this.value.unit}} {{
                      this.value.unit.unit }} {{/if}} {{else}}
                      <em>Left blank</em>
                      {{/if}} {{else if ($eq this.question.dataType 'DATE')}}
                      {{#if this.value}} {{$utcDate this.value}} {{else}}
                      <em>Left blank</em>
                      {{/if}} {{else if ($eq this.question.dataType
                      'DYNAMIC_MULTIPLE_CHOICE')}} {{#if this.value}} {{$join
                      this.value ', '}} {{else}}
                      <em>Left blank</em>
                      {{/if}} {{else if ($eq this.question.dataType
                      'SELECTION_FROM_OPTIONS')}} {{#if this.value}} {{$join
                      this.value ', '}} {{else}}
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
        {{/unless}} {{/each}}
      </div>

      {{#each questionarySteps}} {{#if ($eq this.topic.title "Proposal text")
      }}
      <div class="break-before" data-book-index="Proposal Text">
        <h4 class="bold" class="my-3">{{ this.topic.title }}</h4>
        <div class="row my-3">
          <div class="col">
            {{#each this.fields}}
            <div class="no-break-inside">
              {{#if ($eq this.question.dataType 'EMBELLISHMENT')}}
                {{#if ($notEq this.config.omitFromPdf true )}}
                  <h5 class="bold my-3">{{ this.config.plain }}</h5>
                {{/if}}
              {{ else }}
              <div class="no-break-inside">
                <h5 class="bold my-3">{{ this.question.question }}</h5>
                {{#if ($eq this.question.dataType 'SAMPLE_DECLARATION')}}
                {{#unless this.value}}
                <div class="mb-2"><em>Left blank</em></div>
                {{/unless}} {{#each this.value}} {{ this.title }} -
                <em>See appendix</em>
                <br /><br />
                {{/each}} {{else if ($eq this.question.dataType
                'NUMBER_INPUT')}} {{#if this.value.value}} {{ this.value.value
                }} {{ this.value.unit.unit }} {{else}}
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
                'DYNAMIC_MULTIPLE_CHOICE')}} {{#if this.value}} {{$join
                this.value ', '}} {{else}}
                <em>Left blank</em>
                {{/if}} {{else if ($eq this.question.dataType
                'SELECTION_FROM_OPTIONS')}} {{#if this.value}} {{$join
                this.value ', '}} {{else}}
                <em>Left blank</em>
                {{/if}} {{else if ($eq this.question.dataType 'TEXT_INPUT')}}
                {{#if this.value}} {{ this.value }} {{else}}
                <em>Left blank</em>
                {{/if}} {{else if ($eq this.question.dataType
                'RICH_TEXT_INPUT')}} {{#if this.value}} {{{this.value}}}
                {{else}}
                <em>Left blank</em>
                {{/if}} {{else if ($eq this.question.dataType
                'INSTRUMENT_PICKER')}} {{#if this.value}} {{{this.value}}}
                {{else}}
                <em>Left blank</em>
                {{/if}} {{else if ($eq this.question.dataType 'FILE_UPLOAD')}}
                {{#if this.value}} {{{$attachment this.value
                ../../attachmentsFileMeta}}} {{else}}
                <em>Left blank</em>
                {{/if}} {{/if}}
              </div>
              {{/if}}
            </div>
            {{/each}}
          </div>
        </div>
      </div>
      {{/if}} {{/each}}

      <div
        class="row mt-4 my-3"
        data-book-index="Technical Review"
      >
        <div class="col">
          <h4 class="bold" class="mb-4">Technical Review</h4>

          <div class="row my-2">
            <div class="col-4 bold">Status:</div>
            <div class="col-8">{{ technicalReview.status }}</div>
          </div>

          <div class="row my-2">
            <div class="col-4 bold">Time Allocation:</div>
            <div class="col-8">{{ technicalReview.timeAllocation }}</div>
          </div>

          <div class="row my-2">
            <div class="col-4 bold">Comment:</div>
            <div class="col-8">{{ technicalReview.publicComment }}</div>
          </div>
        </div>
      </div>

      {{#if sepReviews}} {{#each sepReviews}}
      <div class="row mt-4 my-3" data-book-index="SEP Reviews">
        <div class="col">
          <h4 class="bold" class="mb-4">SEP REVIEW {{ $sum @index 1 }}</h4>

          <div class="row my-2">
            <div class="col-4 bold">Grade:</div>
            <div class="col-8">{{ this.grade }}</div>
          </div>

          <div class="row my-2">
            <div class="col-4 bold">Comment:</div>
            <div class="col-8">{{ this.comment }}</div>
          </div>
        </div>
      </div>
      {{/each}} {{/if}}
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

export const footer = `<html>
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

export const header = `<style>
  .logo { max-height: 54px; max-width: 150px; padding: 0; }
  .proposal-header-title{ font-size: 13px; float: right; color: rgb(0, 163,
  218); } .flex{ display: flex; padding-left: 10px; padding-right: 10px;
  justify-content: space-between; align-items: center; } .border{ border-bottom:
  2px solid rgb(0, 163, 218); width: 80%; }
</style>

<div class='border' style='width: 80%;margin: -13px auto 0 auto;'>
  <div class='flex'>
    <img src='{{{$readAsBase64 logoPath}}}' class='logo' />
    {{#if proposal.proposalId}}<p class='proposal-header-title'>Proposal
        <br />{{proposal.proposalId}}</p>
    {{/if}}
  </div>
</div>`;

export const sampleDeclaration = `<html lang='en'>
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
                          {{#if ($eq this.question.dataType 'NUMBER_INPUT')}}
                            {{#if this.value.value}}
                              {{this.value.value}}
                              {{this.value.unit.unit}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if ($eq this.question.dataType 'BOOLEAN')}}
                            {{#if this.value}}Yes{{else}}No{{/if}}
                          {{else if ($eq this.question.dataType 'INTERVAL')}}
                            {{#if ($or this.value.min this.value.max)}}
                              {{this.value.min}}
                              -
                              {{this.value.max}}
                              {{#if this.value.unit}}
                                {{this.value.unit.unit}}
                              {{/if}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if ($eq this.question.dataType 'DATE')}}
                            {{#if this.value}} {{$utcDate this.value}} {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if
                            ($eq
                              this.question.dataType 'DYNAMIC_MULTIPLE_CHOICE'
                            )
                          }}
                            {{#if this.value}}
                              {{$join this.value ', '}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if
                            ($eq
                              this.question.dataType 'SELECTION_FROM_OPTIONS'
                            )
                          }}
                            {{#if this.value}}
                              {{$join this.value ', '}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if ($eq this.question.dataType 'TEXT_INPUT')}}
                            {{#if this.value}}
                              {{this.value}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if
                            ($eq this.question.dataType 'RICH_TEXT_INPUT')
                          }}
                            {{#if this.value}}
                              {{{this.value}}}
                            {{else}}
                              <em>Left blank</em>
                            {{/if}}
                          {{else if
                            ($eq this.question.dataType 'INSTRUMENT_PICKER')
                          }}
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

export const dummyData = `{
  "data": {
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
      "organizationId": 1,
      "position": "Strategist",
      "created": "2023-10-10T13:32:18.172Z",
      "placeholder": false,
      "email": "Javon4@hotmail.com"
    },
    "coProposers": [
      {
        "id": 4,
        "firstname": "Benjamin",
        "lastname": "Beckley",
        "preferredname": "Benjamin",
        "institution": "Other",
        "organizationId": 1,
        "position": "Management",
        "created": "2023-10-18T11:38:15.429Z",
        "placeholder": false,
        "email": "ben@inbox.com"
      }
    ],
    "questionarySteps": [
      {
        "questionaryId": 4,
        "topic": {
          "id": 41,
          "title": "Samples & Info",
          "templateId": 39,
          "sortOrder": 1,
          "isEnabled": true
        },
        "isCompleted": true,
        "fields": [
          {
            "question": {
              "categoryId": 1,
              "id": "date_1661426719613",
              "naturalKey": "date_1661426719613",
              "dataType": "DATE",
              "question": "When do you want to come?",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": "",
                "includeTime": false,
                "maxDate": null,
                "minDate": null,
                "defaultDate": null
              }
            },
            "topicId": 41,
            "sortOrder": 0,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": "",
              "includeTime": false,
              "maxDate": null,
              "minDate": null,
              "defaultDate": null
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 4,
            "value": null
          },
          {
            "question": {
              "categoryId": 1,
              "id": "sample_declaration_1666269436134",
              "naturalKey": "sample_declaration_1666269436134",
              "dataType": "SAMPLE_DECLARATION",
              "question": "Samples",
              "config": {
                "addEntryButtonLabel": "Add",
                "templateCategory": "SAMPLE_DECLARATION",
                "templateId": 36,
                "esiTemplateId": null,
                "small_label": "",
                "required": false,
                "maxEntries": null,
                "minEntries": null
              }
            },
            "topicId": 41,
            "sortOrder": 1,
            "config": {
              "addEntryButtonLabel": "Add",
              "templateCategory": "SAMPLE_DECLARATION",
              "templateId": 36,
              "esiTemplateId": null,
              "small_label": "",
              "required": false,
              "maxEntries": null,
              "minEntries": null
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": null,
            "value": []
          },
          {
            "question": {
              "categoryId": 1,
              "id": "selection_from_options_1605784613207",
              "naturalKey": "selection_from_options_instrument",
              "dataType": "SELECTION_FROM_OPTIONS",
              "question": "Select an instrument",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": "",
                "variant": "dropdown",
                "options": ["LoKi", "MX"],
                "isMultipleSelect": false
              }
            },
            "topicId": 41,
            "sortOrder": 2,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": "",
              "variant": "dropdown",
              "options": ["LoKi", "MX", "CRYO-EM"],
              "isMultipleSelect": true
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 5,
            "value": ["MX"]
          },
          {
            "question": {
              "categoryId": 1,
              "id": "generic_template_1674814357714",
              "naturalKey": "generic_template_1674814357714",
              "dataType": "GENERIC_TEMPLATE",
              "question": "MX",
              "config": {
                "addEntryButtonLabel": "Add",
                "copyButtonLabel": "",
                "canCopy": false,
                "isMultipleCopySelect": false,
                "isCompleteOnCopy": false,
                "templateCategory": "GENERIC_TEMPLATE",
                "templateId": 38,
                "small_label": "",
                "required": false,
                "maxEntries": "1",
                "minEntries": "1"
              }
            },
            "topicId": 41,
            "sortOrder": 5,
            "config": {
              "addEntryButtonLabel": "Add",
              "copyButtonLabel": "",
              "canCopy": false,
              "isMultipleCopySelect": false,
              "isCompleteOnCopy": false,
              "templateCategory": "GENERIC_TEMPLATE",
              "templateId": 38,
              "small_label": "",
              "required": false,
              "maxEntries": 1,
              "minEntries": 1
            },
            "dependencies": [
              {
                "questionId": "generic_template_1674814357714",
                "dependencyId": "selection_from_options_1605784613207",
                "dependencyNaturalKey": "selection_from_options_instrument",
                "condition": {
                  "params": "MX",
                  "condition": "eq"
                }
              }
            ],
            "dependenciesOperator": "AND",
            "answerId": null,
            "value": [
              {
                "id": 1,
                "title": "template 1",
                "creatorId": 1,
                "proposalPk": 4,
                "questionaryId": 5,
                "questionId": "generic_template_1674814357714",
                "created": "2023-10-18T11:38:39.861Z"
              }
            ]
          },
          {
            "question": {
              "categoryId": 1,
              "id": "boolean_1674812264143",
              "naturalKey": "boolean_1674812264143",
              "dataType": "BOOLEAN",
              "question": "Do you want sample environment for MX",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": ""
              }
            },
            "topicId": 41,
            "sortOrder": 6,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": ""
            },
            "dependencies": [
              {
                "questionId": "boolean_1674812264143",
                "dependencyId": "selection_from_options_1605784613207",
                "dependencyNaturalKey": "selection_from_options_instrument",
                "condition": {
                  "params": "MX",
                  "condition": "eq"
                }
              }
            ],
            "dependenciesOperator": "AND",
            "answerId": 6,
            "value": true
          },
          {
            "question": {
              "categoryId": 1,
              "id": "embellishment_1636710963252",
              "naturalKey": "embellishment_1636710963252",
              "dataType": "EMBELLISHMENT",
              "question": "New question",
              "config": {
                "html": "<p>Users can also submit Expression of Interest in the following&nbsp;<strong>Crystallisation </strong>services:</p>\\n<ul>\\n<li>Support for large protein crystal growth of either protiated or deuterated proteins (incl. sitting drop vapour diffusion, dialysis, batch, optimization, targeted screening, testing with X-rays)</li>\\n</ul>",
                "plain": "Crystallisation text",
                "omitFromPdf": true
              }
            },
            "topicId": 41,
            "sortOrder": 7,
            "config": {
              "html": "<p>Users can also submit Expression of Interest in the following&nbsp;<strong>Crystallisation </strong>services:</p>\\n<ul>\\n<li>Support for large protein crystal growth of either protiated or deuterated proteins (incl. sitting drop vapour diffusion, dialysis, batch, optimization, targeted screening, testing with X-rays)</li>\\n</ul>",
              "plain": "Crystallisation text",
              "omitFromPdf": true
            },
            "dependencies": [
              {
                "questionId": "embellishment_1636710963252",
                "dependencyId": "selection_from_options_1605784613207",
                "dependencyNaturalKey": "selection_from_options_instrument",
                "condition": {
                  "params": "MX",
                  "condition": "eq"
                }
              }
            ],
            "dependenciesOperator": "AND",
            "answerId": null,
            "value": null
          }
        ]
      },
      {
        "questionaryId": 4,
        "topic": {
          "id": 42,
          "title": "Sample environment",
          "templateId": 39,
          "sortOrder": 2,
          "isEnabled": true
        },
        "isCompleted": true,
        "fields": [
          {
            "question": {
              "categoryId": 1,
              "id": "boolean_1674821942563",
              "naturalKey": "boolean_1674821942563",
              "dataType": "BOOLEAN",
              "question": "Do you need lab-support?",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": ""
              }
            },
            "topicId": 42,
            "sortOrder": 0,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": ""
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 7,
            "value": true
          },
          {
            "question": {
              "categoryId": 1,
              "id": "final_delivery_date_motivation",
              "naturalKey": "final_delivery_date_motivation",
              "dataType": "TEXT_INPUT",
              "question": "Please give a brief explanation for the chosen date",
              "config": {
                "required": true,
                "small_label": "",
                "tooltip": "",
                "htmlQuestion": "",
                "isHtmlQuestion": false,
                "min": "1",
                "max": 500,
                "multiline": true,
                "placeholder": "(maximum 500 characters)",
                "isCounterHidden": false
              }
            },
            "topicId": 42,
            "sortOrder": 1,
            "config": {
              "required": true,
              "small_label": "",
              "tooltip": "",
              "htmlQuestion": "",
              "isHtmlQuestion": false,
              "min": 1,
              "max": 500,
              "multiline": true,
              "placeholder": "(maximum 500 characters)",
              "isCounterHidden": false
            },
            "dependencies": [
              {
                "questionId": "final_delivery_date_motivation",
                "dependencyId": "boolean_1674821942563",
                "dependencyNaturalKey": "boolean_1674821942563",
                "condition": {
                  "params": true,
                  "condition": "eq"
                }
              }
            ],
            "dependenciesOperator": "AND",
            "answerId": 8,
            "value": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, an"
          }
        ]
      }
    ],
    "attachments": [],
    "samples": [],
    "genericTemplates": [
      {
        "genericTemplate": {
          "id": 1,
          "title": "template 1",
          "creatorId": 1,
          "proposalPk": 4,
          "questionaryId": 5,
          "questionId": "generic_template_1674814357714",
          "created": "2023-10-18T11:38:39.861Z"
        },
        "genericTemplateQuestionaryFields": [
          {
            "question": {
              "categoryId": 7,
              "id": "generic_template_basis",
              "naturalKey": "generic_template_basis",
              "dataType": "GENERIC_TEMPLATE_BASIS",
              "question": "Template basic information",
              "config": {
                "titlePlaceholder": "Title",
                "questionLabel": "",
                "tooltip": "",
                "required": false,
                "small_label": ""
              }
            },
            "topicId": 39,
            "sortOrder": 0,
            "config": {
              "titlePlaceholder": "Title",
              "questionLabel": "",
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
              "categoryId": 7,
              "id": "boolean_1674814267658",
              "naturalKey": "boolean_1674814267658",
              "dataType": "BOOLEAN",
              "question": "New question",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": ""
              }
            },
            "topicId": 39,
            "sortOrder": 1,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": ""
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 1,
            "value": true
          },
          {
            "question": {
              "categoryId": 7,
              "id": "date_1674814304449",
              "naturalKey": "date_1674814304449",
              "dataType": "DATE",
              "question": "New question",
              "config": {
                "small_label": "",
                "required": false,
                "tooltip": "",
                "includeTime": false,
                "maxDate": null,
                "minDate": null,
                "defaultDate": null
              }
            },
            "topicId": 39,
            "sortOrder": 2,
            "config": {
              "small_label": "",
              "required": false,
              "tooltip": "",
              "includeTime": false,
              "maxDate": null,
              "minDate": null,
              "defaultDate": null
            },
            "dependencies": [],
            "dependenciesOperator": "AND",
            "answerId": 2,
            "value": "2023-10-19T22:00:00.000Z"
          },
          {
            "question": {
              "categoryId": 7,
              "id": "text_input_1674814274952",
              "naturalKey": "text_input_1674814274952",
              "dataType": "TEXT_INPUT",
              "question": "New question",
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
            "topicId": 39,
            "sortOrder": 3,
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
            "answerId": 3,
            "value": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
          }
        ]
      }
    ]
  },
  "userRole": {
    "id": 2,
    "shortCode": "user_officer",
    "title": "User Officer"
  }
}
`;

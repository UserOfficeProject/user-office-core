import {
  AllocationTimeUnits,
  DataType,
  FeatureId,
  Settings,
  SettingsId,
} from '@user-office-software-libs/shared-types';

// NOTE: Instruments, proposal and scheduled events are seeded only if resetDB(true).
export default {
  // NOTE: To be able to use this cy.getAndStoreAppSettings() should be called in the beforeEach section.
  getFormats: () => {
    const settings = window.localStorage.getItem('settings');

    let settingsMap = new Map<SettingsId, string>();

    if (settings) {
      settingsMap = new Map(
        JSON.parse(settings).map((setting: Settings) => [
          setting.id,
          setting.settingsValue,
        ])
      );
    }

    const dateFormat = settingsMap.get(SettingsId.DATE_FORMAT) || 'dd-MM-yyyy';
    const dateTimeFormat =
      settingsMap.get(SettingsId.DATE_TIME_FORMAT) || 'dd-MM-yyyy HH:mm';
    const statusFilter = settingsMap.get(
      SettingsId.DEFAULT_INST_SCI_STATUS_FILTER
    );
    const reviewerFilter = settingsMap.get(
      SettingsId.DEFAULT_INST_SCI_REVIEWER_FILTER
    );

    return { dateFormat, dateTimeFormat, statusFilter, reviewerFilter };
  },
  getCorrectFormatCase: (string: string) => {
    return string
      .split(' ')
      .map((part, index) =>
        index === 0 ? part.toUpperCase() : part.toLowerCase()
      )
      .join(' ');
  },
  call: {
    id: 1,
    shortCode: 'call 1',
    allocationTimeUnit: AllocationTimeUnits.DAY,
    endCall: '01-01-2030',
    callFapReviewEnded: false,
  },
  template: {
    id: 1,
    name: 'default template',
    topic: {
      id: 5,
      title: 'Topic title',
    },
  },
  questions: {
    boolean: {
      id: 'boolean_question',
      text: 'Boolean question from seeds',
      type: DataType.BOOLEAN,
    },
    date: {
      id: 'date_question',
      text: 'Date question from seeds',
      type: DataType.DATE,
    },
    embellishment: {
      id: 'embellishment_question',
      text: 'Embellishment question from seeds',
      type: DataType.EMBELLISHMENT,
    },
    fileUpload: {
      id: 'file_upload_question',
      text: 'File upload question from seeds',
      type: DataType.FILE_UPLOAD,
    },
    interval: {
      id: 'interval_question',
      text: 'Interval question from seeds',
      type: DataType.INTERVAL,
    },
    numberInput: {
      id: 'number_question',
      text: 'Number question from seeds',
      type: DataType.NUMBER_INPUT,
    },
    richTextInput: {
      id: 'rich_text_input_question',
      text: 'Rich text input question from seeds',
      type: DataType.RICH_TEXT_INPUT,
    },
    selectionFromOptions: {
      id: 'selection_from_options_question',
      text: 'Selection from options question from seeds',
      type: DataType.SELECTION_FROM_OPTIONS,
    },
    dynamicMultipleChoice: {
      id: 'dynamic_multiple_choice_question',
      text: 'Dynamic multiple choice question from seeds',
      type: DataType.DYNAMIC_MULTIPLE_CHOICE,
    },
    textInput: {
      id: 'text_input_question',
      text: 'Text input question from seeds',
      type: DataType.TEXT_INPUT,
    },
    instrumentPicker: {
      id: 'instrument_picker_question',
      text: 'Instrument Picker question from seeds',
      type: DataType.INSTRUMENT_PICKER,
    },
    addSamples: {
      id: 'sample_declaration_question',
      text: 'Add samples',
      type: DataType.SAMPLE_DECLARATION,
    },
    techniquePicker: {
      id: 'technique_picker_question',
      text: 'Technique Picker question from seeds',
      type: DataType.TECHNIQUE_PICKER,
    },
  },
  answers: {
    proposal: {
      boolean: {
        value: true,
      },
      date: {
        value: '01-01-2030',
      },
      embellishment: {
        value: '<h1>Embellishment value<h1>',
      },
      fileUpload: {
        value: { id: '1c4b2ca8-f849-42db-b5d6-35aba2b26f8b' },
      },
      interval: {
        value: {
          max: 100,
          min: 1,
          unit: {
            id: 'meter',
            unit: 'meter',
            symbol: 'm',
            quantity: 'length',
            siConversionFormula: 'x',
          },
          siMax: 100,
          siMin: 1,
        },
      },
      numberInput: {
        value: {
          unit: {
            id: 'centimeter',
            unit: 'centimeter',
            symbol: 'cm',
            quantity: 'length',
            siConversionFormula: 'x / 100',
          },
          value: 99,
          siValue: 0.99,
        },
      },
      richTextInput: {
        value: {},
      },
      selectionFromOptions: {
        value: ['One'],
      },
      dynamicMultipleChoice: {
        value: ['One'],
      },
      instrumentPicker: { value: { instrumentId: '1', timeRequested: '0' } },
      textInput: {
        value: 'Text input answer from seeds',
      },
      techniquePicker: { value: 1 },
    },
  },
  proposal: {
    id: 1,
    title: 'Test proposal',
    questionaryId: 1,
    shortCode: '999999',
  },
  instrument1: {
    id: 1,
    name: 'Instrument 1',
  },
  instrument2: {
    id: 2,
  },
  instrument3: {
    id: 3,
    name: 'Instrument 3',
  },
  technique1: {
    id: 1,
    name: 'Technique 1',
  },
  technique2: {
    id: 2,
    name: 'Technique 2',
  },
  fap: {
    id: 1,
    code: 'DEMAX',
  },
  roles: {
    user: 1,
    userOfficer: 2,
    fapChair: 4,
    fapSecretary: 5,
    fapReviewer: 6,
    instrumentScientist: 7,
    sampleSafetyReviewer: 8,
    internalReviewer: 9,
  },
  users: {
    user1: {
      id: 1,
      firstName: 'Carl',
      lastName: 'Carlsson',
      email: 'Javon4@hotmail.com',
      password: 'Test1234!',
    },
    user2: {
      id: 4,
      firstName: 'Benjamin',
      lastName: 'Beckley',
      email: 'ben@inbox.com',
      password: 'Test1234!',
    },
    user3: {
      id: 6,
      firstName: 'David',
      lastName: 'Dawson',
      email: 'david@teleworm.us',
      password: 'Test1234!',
    },
    reviewer: {
      id: 3,
      firstName: 'Nils',
      lastName: 'Nilsson',
      email: 'nils@ess.se',
      password: 'Test1234!',
    },
    officer: {
      id: 2,
      firstName: 'Anders',
      lastName: 'Andersson',
      email: 'Aaron_Harris49@gmail.com',
      password: 'Test1234!',
    },
    placeholderUser: {
      id: 5,
      firstName: 'Unverified email',
      lastName: 'Placeholder',
      email: 'unverified-user@example.com',
      password: '',
    },
  },
  proposalStatuses: {
    draft: {
      id: 1,
      name: 'DRAFT',
    },
    feasibilityReview: {
      id: 2,
      name: 'FEASIBILITY_REVIEW',
    },
    notFeasible: { id: 3 },
    fapSelection: { id: 4 },
    fapReview: {
      id: 5,
      name: 'FAP_REVIEW',
    },
    fapMeeting: {
      id: 12,
      name: 'FAP Meeting',
    },
    editableSubmitted: {
      id: 14,
      name: 'EDITABLE_SUBMITTED',
    },
    editableSubmittedInternal: {
      id: 15,
      name: 'EDITABLE_SUBMITTED_INTERNAL',
    },
  },
  scheduledEvents: {
    upcoming: {
      id: 996,
      startsAt: '07-01-2030 10:00',
      endsAt: '07-01-2030 11:00',
    },
    upcomingDraft: {
      startsAt: '07-01-2030 12:00',
      endsAt: '07-01-2030 13:00',
    },
    ended: {
      startsAt: '07-01-2020 10:00',
      endsAt: '07-01-2020 11:00',
    },
    completed: {
      startsAt: '07-02-2030 12:00',
      endsAt: '07-02-2030 13:00',
    },
  },
  features: {
    instrumentManagement: {
      id: FeatureId.INSTRUMENT_MANAGEMENT,
      description: 'Instrument management functionality',
      isEnabled: true,
    },
  },
  settings: {
    dateTimeFormat: {
      id: SettingsId.DATE_TIME_FORMAT,
      description: 'Format used to represent date with time without seconds.',
      settingsValue: 'dd-MM-yyyy HH:mm',
    },
  },
  redeemCodes: {
    validRedeemCode: {
      code: '123abc',
      placeholderUserId: 5,
      createdBy: 1,
    },
  },
  workflows: {
    defaultWorkflow: {
      id: 1,
    },
    defaultDroppableGroup: 'proposalWorkflowConnections_0',
  },
};

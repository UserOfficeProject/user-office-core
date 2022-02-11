// NOTE: Instruments, proposal and scheduled events are seeded only if resetDB(true).
export default {
  call: {
    id: 1,
    shortCode: 'call 1',
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
    addSamples: {
      id: 1,
      text: 'Add samples',
    },
  },
  proposal: {
    id: 1,
    title: 'Test proposal',
  },
  instrument1: {
    id: 1,
  },
  instrument2: {
    id: 2,
  },
  sep: {
    id: 1,
    code: 'DEMAX',
  },
  roles: {
    user: 1,
    userOfficer: 2,
    sepChair: 4,
    sepSecretary: 5,
    sepReviewer: 6,
    instrumentScientist: 7,
    sampleSafetyReviewer: 8,
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
    userOfficer: {
      id: 2,
      firstName: 'Anders',
      lastName: 'Andersson',
      email: 'Aaron_Harris49@gmail.com',
    },
    placeholder: {
      id: 5,
      firstName: 'Unverified email',
      lastName: 'Placeholder',
      email: 'unverified-user@example.com',
    },
  },
  proposalStatuses: {
    draft: {
      id: 1,
    },
    feasibilityReview: {
      id: 2,
    },
    notFeasible: { id: 3 },
    sepSelection: { id: 4 },
    sepReview: {
      id: 5,
    },
    sepMeeting: {
      id: 12,
    },
    editableSubmitted: {
      id: 14,
    },
  },
  scheduledEvents: {
    upcoming: {
      id: 996,
      startsAt: '2023-01-07 10:00',
      endsAt: '2023-01-07 11:00',
    },
    upcomingDraft: {
      startsAt: '2023-01-07 12:00',
      endsAt: '2023-01-07 13:00',
    },
    ended: {
      startsAt: '2020-01-07 10:00',
      endsAt: '2020-01-07 11:00',
    },
    completed: {
      startsAt: '2023-02-07 12:00',
      endsAt: '2023-02-07 13:00',
    },
  },
};

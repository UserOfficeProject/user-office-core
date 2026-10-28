import 'reflect-metadata';
import { container } from 'tsyringe';

import SettingsQueries from './SettingsQueries';
import { dummyUserOfficerWithRole } from '../datasources/mockups/UserDataSource';
import { Event } from '../events/event.enum';
import { WorkflowType } from '../models/Workflow';

const settingsQueries = container.resolve(SettingsQueries);

describe('SettingsQueries', () => {
  test('does not offer the unused all FAP reviewers selected event', async () => {
    const events = await settingsQueries.getAllEvents(
      dummyUserOfficerWithRole,
      WorkflowType.PROPOSAL
    );

    expect(events).not.toContainEqual(
      expect.objectContaining({
        name: 'PROPOSAL_ALL_FAP_REVIEWERS_SELECTED',
      })
    );
  });

  test('continues to offer supported FAP review workflow events', async () => {
    const events = await settingsQueries.getAllEvents(
      dummyUserOfficerWithRole,
      WorkflowType.PROPOSAL
    );

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: Event.PROPOSAL_FAP_REVIEW_SUBMITTED,
          description:
            'Event occurs when at least one proposal FAP review is submitted',
        }),
        expect.objectContaining({
          name: Event.PROPOSAL_ALL_FAP_REVIEWS_SUBMITTED,
        }),
      ])
    );
  });
});

import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import {
  CallDataSourceMock,
  dummyCallFactory,
} from '../datasources/mockups/CallDataSource';
import {
  CompletedExperiment,
  ExperimentDataSourceMock,
  ExperimentWithNonExistingProposalPk,
  OngoingExperiment,
  UpcomingExperimentWithExperiment,
} from '../datasources/mockups/ExperimentDataSource';
import {
  dummyQuestionFactory,
  dummyQuestionTemplateRelationFactory,
} from '../datasources/mockups/QuestionaryDataSource';
import { SampleDataSourceMock } from '../datasources/mockups/SampleDataSource';
import { TemplateDataSourceMock } from '../datasources/mockups/TemplateDataSource';
import {
  dummyPrincipalInvestigatorWithRole,
  dummyUserNotOnProposalWithRole,
} from '../datasources/mockups/UserDataSource';
import {
  ExperimentHasSample,
  ExperimentSafety,
  ExperimentStatus,
} from '../models/Experiment';
import { createConfig } from '../models/questionTypes/QuestionRegistry';
import { Rejection } from '../models/Rejection';
import { Sample } from '../models/Sample';
import { DataType } from '../models/Template';
import { SampleDeclarationConfig } from '../resolvers/types/FieldConfig';
import ExperimentMutations from './ExperimentMutation';

const experimentMutation = container.resolve(ExperimentMutations);
const calldatasource = container.resolve<CallDataSourceMock>(
  Tokens.CallDataSource
);
const sampleDataSource = container.resolve<SampleDataSourceMock>(
  Tokens.SampleDataSource
);
const templateDataSource = container.resolve<TemplateDataSourceMock>(
  Tokens.TemplateDataSource
);

describe('Test Experiment Safety', () => {
  beforeEach(() => {
    container
      .resolve<ExperimentDataSourceMock>(Tokens.ExperimentDataSource)
      .init();
  });

  test('Experiment User should not be able to create Experiment safety for an unexisting Experiments', async () => {
    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      300 // Experiment ID that does not exist
    );

    expect(experimentSafety).toBeInstanceOf(Rejection);
    expect((experimentSafety as Rejection).reason).toBe(
      'Can not create Experiment Safety, because experiment does not exist'
    );
  });

  test('Experiment User should not be able to create Experiment Safety for a completed Experiment', async () => {
    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      CompletedExperiment.experimentPk
    );

    expect(experimentSafety).toBeInstanceOf(Rejection);
    expect((experimentSafety as Rejection).reason).toBe(
      'Can not create Experiment Safety, because the experiment is not active'
    );
  });

  test('Experiment User should not be able to create Experiment safety for an ongoing Experiment', async () => {
    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      OngoingExperiment.experimentPk
    );

    expect(experimentSafety).toBeInstanceOf(Rejection);
    expect((experimentSafety as Rejection).reason).toBe(
      'Can not create Experiment Safety, because the experiment has already started'
    );
  });

  test('Experiment User should not be able to create Experiment safety for an Experiment, which is not connected to a valid Proposal', async () => {
    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      ExperimentWithNonExistingProposalPk.experimentPk
    );

    expect(experimentSafety).toBeInstanceOf(Rejection);
    expect((experimentSafety as Rejection).reason).toBe(
      'Can not create Experiment Safety for an experiment that is not connected to a valid Proposal'
    );
  });

  test('User who is not a part of the Proposal, should not be able to create Experiment Safety', async () => {
    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyUserNotOnProposalWithRole,
      OngoingExperiment.experimentPk
    );

    expect(experimentSafety).toBeInstanceOf(Rejection);
    expect((experimentSafety as Rejection).reason).toBe(
      'User is not authorized to create Experiment Safety for this experiment'
    );
  });

  test('User should not be able create Experiment Safety for an Experiment, whose Call does not have a Experiment Safety Form Questionary template', async () => {
    jest.spyOn(calldatasource, 'getCall').mockResolvedValue(dummyCallFactory());

    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );

    expect(experimentSafety).toBeInstanceOf(Rejection);
    expect((experimentSafety as Rejection).reason).toBe(
      'Can not create Experiment Safety, because system has no Experiment Safety template configured'
    );
  });

  test('User should be able to create Experiment Safety for an Experiment, whose Call has a Experiment Safety Form Questionary template', async () => {
    jest
      .spyOn(calldatasource, 'getCall')
      .mockResolvedValue(dummyCallFactory({ esiTemplateId: 1 }));

    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );

    expect(experimentSafety).toBeInstanceOf(ExperimentSafety);
  });

  test('User should not create duplicate Experiment Safety, instead get back the existing one', async () => {
    jest
      .spyOn(calldatasource, 'getCall')
      .mockResolvedValue(dummyCallFactory({ esiTemplateId: 1 }));

    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );
    expect(experimentSafety).toBeInstanceOf(ExperimentSafety);

    const experimentSafety2 = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );
    expect(experimentSafety2).toBeInstanceOf(Rejection);
  });
});

describe('Adding Samples to Experiment', () => {
  beforeEach(() => {
    container
      .resolve<ExperimentDataSourceMock>(Tokens.ExperimentDataSource)
      .init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('User can not add Sample to an Experiment that does not exist', async () => {
    const experimentHasSample = await experimentMutation.addSampleToExperiment(
      dummyPrincipalInvestigatorWithRole,
      {
        sampleId: 1,
        experimentPk: 300,
      }
    );

    expect(experimentHasSample).toBeInstanceOf(Rejection);
    expect((experimentHasSample as Rejection).reason).toBe(
      'No experiment found'
    );
  });

  test('User can not add Sample to an Experiment if there is no Experiment Safety', async () => {
    const experimentHasSample = await experimentMutation.addSampleToExperiment(
      dummyPrincipalInvestigatorWithRole,
      {
        sampleId: 1,
        experimentPk: OngoingExperiment.experimentPk,
      }
    );

    expect(experimentHasSample).toBeInstanceOf(Rejection);
    expect((experimentHasSample as Rejection).reason).toBe(
      'No experiment safety found'
    );
  });

  test('User who does not belong to an Experiment cannot add samples to it', async () => {
    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );

    expect(experimentSafety).toBeInstanceOf(ExperimentSafety);

    const experimentHasSample = await experimentMutation.addSampleToExperiment(
      dummyUserNotOnProposalWithRole,
      {
        sampleId: 1,
        experimentPk: UpcomingExperimentWithExperiment.experimentPk,
      }
    );

    expect(experimentHasSample).toBeInstanceOf(Rejection);
    expect((experimentHasSample as Rejection).reason).toBe(
      'User does not have permission to attach samples to the experiment'
    );
  });

  test('User cannot add unidentified sample to an Experiment', async () => {
    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );

    expect(experimentSafety).toBeInstanceOf(ExperimentSafety);

    const experimentHasSample = await experimentMutation.addSampleToExperiment(
      dummyPrincipalInvestigatorWithRole,
      {
        sampleId: 100,
        experimentPk: UpcomingExperimentWithExperiment.experimentPk,
      }
    );

    expect(experimentHasSample).toBeInstanceOf(Rejection);
    expect((experimentHasSample as Rejection).reason).toBe('No sample found');
  });

  test('User cannot add sample that does not contain a matching question', async () => {
    jest.spyOn(sampleDataSource, 'getSample').mockResolvedValue(
      new Sample(
        1,
        'title',
        1,
        1,
        1,
        'random_question_id', // This question id does not match the one in the template
        false,
        1,
        'safety comment',
        new Date(),
        1
      )
    );

    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );

    expect(experimentSafety).toBeInstanceOf(ExperimentSafety);
    const experimentHasSample = await experimentMutation.addSampleToExperiment(
      dummyPrincipalInvestigatorWithRole,
      {
        sampleId: 1,
        experimentPk: UpcomingExperimentWithExperiment.experimentPk,
      }
    );

    expect(experimentHasSample).toBeInstanceOf(Rejection);
    expect((experimentHasSample as Rejection).reason).toBe('No question found');
  });

  test('User cannot add Sample that does not have any ESI defined', async () => {
    jest
      .spyOn(templateDataSource, 'getQuestionTemplateRelation')
      .mockResolvedValue(
        dummyQuestionTemplateRelationFactory({
          question: dummyQuestionFactory({
            dataType: DataType.SAMPLE_DECLARATION,
          }),
          config: createConfig<SampleDeclarationConfig>(
            DataType.SAMPLE_DECLARATION,
            {
              esiTemplateId: null,
            }
          ),
        })
      );

    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );

    expect(experimentSafety).toBeInstanceOf(ExperimentSafety);
    const experimentHasSample = await experimentMutation.addSampleToExperiment(
      dummyPrincipalInvestigatorWithRole,
      {
        sampleId: 1,
        experimentPk: UpcomingExperimentWithExperiment.experimentPk,
      }
    );

    expect(experimentHasSample).toBeInstanceOf(Rejection);
    expect((experimentHasSample as Rejection).reason).toBe(
      'Esi template is not defined'
    );
  });

  test('User should be able to add Sample to an Experiment', async () => {
    jest
      .spyOn(templateDataSource, 'getQuestionTemplateRelation')
      .mockResolvedValue(
        dummyQuestionTemplateRelationFactory({
          question: dummyQuestionFactory({
            dataType: DataType.SAMPLE_DECLARATION,
          }),
          config: createConfig<SampleDeclarationConfig>(
            DataType.SAMPLE_DECLARATION,
            {
              esiTemplateId: 1,
            }
          ),
        })
      );

    const experimemntSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );

    expect(experimemntSafety).toBeInstanceOf(ExperimentSafety);

    const experimentHasSample = await experimentMutation.addSampleToExperiment(
      dummyPrincipalInvestigatorWithRole,
      {
        sampleId: 1,
        experimentPk: UpcomingExperimentWithExperiment.experimentPk,
      }
    );
    expect(experimentHasSample).toBeInstanceOf(ExperimentHasSample);
  });
});

describe('Removing Samples from Experiment', () => {
  // Reinitialize the experiment data source for each test
  beforeEach(() => {
    container
      .resolve<ExperimentDataSourceMock>(Tokens.ExperimentDataSource)
      .init();
  });

  test('User cannot remove sample from an Experiment that does not exist', async () => {
    const result = await experimentMutation.removeSampleFromExperiment(
      dummyPrincipalInvestigatorWithRole,
      {
        experimentPk: 300, // non-existent experiment
        sampleId: 1,
      }
    );

    expect(result).toBeInstanceOf(Rejection);
    expect((result as Rejection).reason).toBe('No experiment found');
  });

  test('User cannot remove sample if experiment safety does not exist', async () => {
    // Force getExperimentSafetyByExperimentPk to return null
    jest
      .spyOn(
        container.resolve<ExperimentDataSourceMock>(
          Tokens.ExperimentDataSource
        ),
        'getExperimentSafetyByExperimentPk'
      )
      .mockResolvedValueOnce(null);

    // Using an experiment that exists
    const result = await experimentMutation.removeSampleFromExperiment(
      dummyPrincipalInvestigatorWithRole,
      {
        experimentPk: UpcomingExperimentWithExperiment.experimentPk,
        sampleId: 1,
      }
    );

    expect(result).toBeInstanceOf(Rejection);
    expect((result as Rejection).reason).toBe('No experiment safety found');
  });

  test('User who is not authorized cannot remove samples from the Experiment', async () => {
    // First create experiment safety so that the experiment exists and safety is present
    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );
    expect(experimentSafety).toBeInstanceOf(ExperimentSafety);

    const result = await experimentMutation.removeSampleFromExperiment(
      dummyUserNotOnProposalWithRole,
      {
        experimentPk: UpcomingExperimentWithExperiment.experimentPk,
        sampleId: 1,
      }
    );

    expect(result).toBeInstanceOf(Rejection);
    expect((result as Rejection).reason).toBe(
      'User does not have permission to remove samples from the experiment'
    );
  });

  test('User should be able to remove sample from an Experiment', async () => {
    // First create experiment safety so that removal can proceed
    const experimentSafety = await experimentMutation.createExperimentSafety(
      dummyPrincipalInvestigatorWithRole,
      UpcomingExperimentWithExperiment.experimentPk
    );
    expect(experimentSafety).toBeInstanceOf(ExperimentSafety);

    const result = await experimentMutation.removeSampleFromExperiment(
      dummyPrincipalInvestigatorWithRole,
      {
        experimentPk: UpcomingExperimentWithExperiment.experimentPk,
        sampleId: 1,
      }
    );

    expect(result).toBeInstanceOf(ExperimentHasSample);
  });
});

describe('Cloning Samples from Experiment', () => {
  // Reset or initialize mocks if necessary
  beforeEach(() => {
    container
      .resolve<ExperimentDataSourceMock>(Tokens.ExperimentDataSource)
      .init();
  });

  test('User cannot clone sample if experiment sample does not exist', async () => {
    jest
      .spyOn(experimentMutation['dataSource'], 'getExperimentSample')
      .mockResolvedValue(null);
    const result = await experimentMutation.cloneExperimentSample(
      dummyPrincipalInvestigatorWithRole,
      { experimentPk: 1, sampleId: 1, newSampleTitle: 'Clone Title' }
    );
    expect(result).toBeInstanceOf(Rejection);
    expect((result as Rejection).reason).toBe('No experiment sample found');
  });

  test('User who is not authorized cannot clone samples', async () => {
    const dummyExperimentSample = {
      experimentPk: 1,
      sampleId: 1,
      questionaryId: 10,
    } as any;
    const dummyExperiment = {
      experimentPk: 1,
      proposalPk: 1,
      status: ExperimentStatus.ACTIVE,
      startsAt: new Date(Date.now() + 100000),
    } as any;
    const dummyExperimentSafety = { experimentSafetyPk: 1 } as any;

    jest
      .spyOn(experimentMutation['dataSource'], 'getExperimentSample')
      .mockResolvedValue(dummyExperimentSample);
    jest
      .spyOn(experimentMutation['dataSource'], 'getExperiment')
      .mockResolvedValue(dummyExperiment);
    jest
      .spyOn(
        experimentMutation['dataSource'],
        'getExperimentSafetyByExperimentPk'
      )
      .mockResolvedValue(dummyExperimentSafety);
    jest
      .spyOn(experimentMutation['experimentSafetyAuth'], 'hasWriteRights')
      .mockResolvedValue(false);

    const result = await experimentMutation.cloneExperimentSample(
      dummyUserNotOnProposalWithRole,
      { experimentPk: 1, sampleId: 1, newSampleTitle: 'Clone Title' }
    );
    expect(result).toBeInstanceOf(Rejection);
    expect((result as Rejection).reason).toBe(
      'User does not have permission to clone samples in the experiment'
    );
  });

  test('User should be able to clone sample from an Experiment', async () => {
    const dummyExperimentSample = {
      experimentPk: 1,
      sampleId: 1,
      questionaryId: 10,
    } as any;
    const dummyExperiment = {
      experimentPk: 1,
      proposalPk: 1,
      status: ExperimentStatus.ACTIVE,
      startsAt: new Date(Date.now() + 100000),
    } as any;
    const dummyExperimentSafety = { experimentSafetyPk: 1 } as any;
    const dummyClonedSample = {
      experimentPk: 1,
      sampleId: 2,
      questionaryId: 20,
    } as any;

    jest
      .spyOn(experimentMutation['dataSource'], 'getExperimentSample')
      .mockResolvedValue(dummyExperimentSample);
    jest
      .spyOn(experimentMutation['dataSource'], 'getExperiment')
      .mockResolvedValue(dummyExperiment);
    jest
      .spyOn(
        experimentMutation['dataSource'],
        'getExperimentSafetyByExperimentPk'
      )
      .mockResolvedValue(dummyExperimentSafety);
    jest
      .spyOn(experimentMutation['experimentSafetyAuth'], 'hasWriteRights')
      .mockResolvedValue(true);
    jest
      .spyOn(experimentMutation['cloneUtils'], 'cloneExperimentSample')
      .mockResolvedValue(dummyClonedSample);

    const result = await experimentMutation.cloneExperimentSample(
      dummyPrincipalInvestigatorWithRole,
      { experimentPk: 1, sampleId: 1, newSampleTitle: 'Clone Title' }
    );
    expect(result).toEqual(dummyClonedSample);
  });
});

describe('Updating Samples from Experiment', () => {
  // Reinitialize the experiment data source for each test
  beforeEach(() => {
    container
      .resolve<ExperimentDataSourceMock>(Tokens.ExperimentDataSource)
      .init();
  });

  test('User cannot update sample if experiment does not exist', async () => {
    jest
      .spyOn(experimentMutation['dataSource'], 'getExperiment')
      .mockResolvedValue(null);
    const result = await experimentMutation.updateExperimentSample(
      dummyPrincipalInvestigatorWithRole,
      { experimentPk: 300, sampleId: 1, isSubmitted: true }
    );
    expect(result).toBeInstanceOf(Rejection);
    expect((result as Rejection).reason).toBe('No experiment found');
  });

  test('User cannot update sample if experiment safety does not exist', async () => {
    const dummyExperiment = {
      experimentPk: 1,
      proposalPk: 1,
      status: ExperimentStatus.ACTIVE,
      startsAt: new Date(Date.now() + 100000),
    } as any;
    jest
      .spyOn(experimentMutation['dataSource'], 'getExperiment')
      .mockResolvedValue(dummyExperiment);
    jest
      .spyOn(
        experimentMutation['dataSource'],
        'getExperimentSafetyByExperimentPk'
      )
      .mockResolvedValue(null);
    const result = await experimentMutation.updateExperimentSample(
      dummyPrincipalInvestigatorWithRole,
      { experimentPk: 1, sampleId: 1, isSubmitted: true }
    );
    expect(result).toBeInstanceOf(Rejection);
    expect((result as Rejection).reason).toBe('No experiment safety found');
  });

  test('User who is not authorized cannot update sample', async () => {
    const dummyExperiment = {
      experimentPk: 1,
      proposalPk: 1,
      status: ExperimentStatus.ACTIVE,
      startsAt: new Date(Date.now() + 100000),
    } as any;
    const dummyExperimentSafety = { experimentSafetyPk: 1 } as any;
    jest
      .spyOn(experimentMutation['dataSource'], 'getExperiment')
      .mockResolvedValue(dummyExperiment);
    jest
      .spyOn(
        experimentMutation['dataSource'],
        'getExperimentSafetyByExperimentPk'
      )
      .mockResolvedValue(dummyExperimentSafety);
    jest
      .spyOn(experimentMutation['experimentSafetyAuth'], 'hasWriteRights')
      .mockResolvedValue(false);
    const result = await experimentMutation.updateExperimentSample(
      dummyUserNotOnProposalWithRole,
      { experimentPk: 1, sampleId: 1, isSubmitted: true }
    );
    expect(result).toBeInstanceOf(Rejection);
    expect((result as Rejection).reason).toBe(
      'User does not have permission to update samples in the experiment'
    );
  });

  test('User should be able to update sample in an Experiment', async () => {
    const dummyExperiment = {
      experimentPk: 1,
      proposalPk: 1,
      status: ExperimentStatus.ACTIVE,
      startsAt: new Date(Date.now() + 100000),
    } as any;
    const dummyExperimentSafety = { experimentSafetyPk: 1 } as any;

    jest
      .spyOn(experimentMutation['dataSource'], 'getExperiment')
      .mockResolvedValue(dummyExperiment);
    jest
      .spyOn(
        experimentMutation['dataSource'],
        'getExperimentSafetyByExperimentPk'
      )
      .mockResolvedValue(dummyExperimentSafety);
    jest
      .spyOn(experimentMutation['experimentSafetyAuth'], 'hasWriteRights')
      .mockResolvedValue(true);

    const result = (await experimentMutation.updateExperimentSample(
      dummyPrincipalInvestigatorWithRole,
      { experimentPk: 1, sampleId: 1, isSubmitted: true }
    )) as ExperimentHasSample;
    // Instead of comparing with a dummy, confirm key properties
    expect(result.experimentPk).toEqual(dummyExperiment.experimentPk);
    expect(result.sampleId).toEqual(1);
    expect(result.isEsiSubmitted).toEqual(true);
  });
});

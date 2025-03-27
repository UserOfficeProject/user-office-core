import {
  Experiment,
  ExperimentSafety,
  ExperimentHasSample,
  ExperimentStatus,
} from '../../models/Experiment';
import { Rejection } from '../../models/Rejection';
import { User } from '../../models/User';
import { SubmitExperimentSafetyArgs } from '../../resolvers/mutations/SubmitExperimentSafetyMutation';
import {
  UserExperimentsFilter,
  ExperimentsArgs,
} from '../../resolvers/queries/ExperimentsQuery';
import { ExperimentDataSource } from '../ExperimentDataSource';

const dummyExperimentFactory = (values?: Partial<Experiment>): Experiment => {
  return new Experiment(
    values?.experimentPk ?? 1,
    values?.experimentId ?? 'dummy',
    values?.startsAt ?? new Date(Date.now() + 86400000), // startsAt (default: 1 day from now)
    values?.endsAt ?? new Date(Date.now() + 86400000 * 2), // endsAt (default: 2 days from now)
    values?.scheduledEventId ?? 1,
    values?.proposalPk ?? 1,
    values?.status ?? ExperimentStatus.DRAFT,
    values?.localContactId ?? null,
    values?.instrumentId ?? 1,
    values?.createdAt ?? new Date(),
    values?.updatedAt ?? new Date()
  );
};

const dummyExperimentSafetyFactory = (
  values?: Partial<ExperimentSafety>
): ExperimentSafety => {
  return new ExperimentSafety(
    values?.experimentSafetyPk ?? 1,
    values?.experimentPk ?? 1,
    values?.esiQuestionaryId ?? 1,
    values?.esiQuestionarySubmittedAt ?? null,
    values?.createdBy ?? 1,
    values?.status ?? 'PENDING',
    values?.safetyReviewQuestionaryId ?? 1,
    values?.reviewedBy ?? null,
    values?.createdAt ?? new Date(),
    values?.updatedAt ?? new Date()
  );
};

const dummyExperimentHasSampleFactory = (
  values?: Partial<ExperimentHasSample>
): ExperimentHasSample => {
  return new ExperimentHasSample(
    values?.experimentPk ?? 1,
    values?.sampleId ?? 1,
    values?.isEsiSubmitted ?? false,
    values?.sampleEsiQuestionaryId ?? 1,
    values?.createdAt ?? new Date(),
    values?.updatedAt ?? new Date()
  );
};

export const UpcomingExperimentWithExperiment = dummyExperimentFactory({
  experimentPk: 1,
  status: ExperimentStatus.ACTIVE,
});

export const CompletedExperiment = dummyExperimentFactory({
  experimentPk: 2,
  status: ExperimentStatus.COMPLETED,
  proposalPk: 2,
});

export const OngoingExperiment = dummyExperimentFactory({
  experimentPk: 3,
  status: ExperimentStatus.ACTIVE,
  startsAt: new Date(Date.now() - 86400000), // startsAt (1 day ago)
  endsAt: new Date(Date.now() + 86400000), // endsAt (1 day from now)
});

export const DummyExperimentSample1 = dummyExperimentHasSampleFactory({
  experimentPk: 1,
  sampleId: 1,
});

export const ExperimentWithNonExistingProposalPk = dummyExperimentFactory({
  experimentPk: 4,
  proposalPk: 9999,
});

export class ExperimentDataSourceMock implements ExperimentDataSource {
  private experiments: Experiment[] = [];
  private experimentsSafety: ExperimentSafety[] = [];
  // Added property for storing samples
  private experimentSamples: ExperimentHasSample[] = [];

  constructor() {
    this.init();
  }

  init(): void {
    this.experiments = [];
    this.experimentsSafety = [];

    this.experiments = [
      UpcomingExperimentWithExperiment,
      CompletedExperiment,
      OngoingExperiment,
      ExperimentWithNonExistingProposalPk,
    ];

    this.experimentsSafety = [
      // dummyExperimentSafetyFactory({
      //   experimentSafetyPk: 1,
      //   experimentPk: UpcomingExperimentWithExperiment.experimentPk,
      // }),
    ];

    // Initialize experimentSamples with dummy sample data
    this.experimentSamples = [DummyExperimentSample1];
  }

  create(
    experiment: Omit<
      Experiment,
      'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
    >
  ): Promise<Experiment> {
    throw new Error('Method not implemented.');
  }
  updateByScheduledEventId(
    experiment: Omit<
      Experiment,
      'createdAt' | 'updatedAt' | 'experimentPk' | 'experimentId'
    >
  ): Promise<Experiment> {
    throw new Error('Method not implemented.');
  }
  deleteByScheduledEventId(experimentId: number): Promise<Experiment> {
    throw new Error('Method not implemented.');
  }
  getUserExperiments(
    userId: User['id'],
    args: UserExperimentsFilter
  ): Promise<Experiment[]> {
    throw new Error('Method not implemented.');
  }
  getExperiment(experimentPk: number): Promise<Experiment | null> {
    return new Promise((resolve) => {
      const experiment = this.experiments.find(
        (experiment) => experiment.experimentPk === experimentPk
      );

      if (experiment) {
        resolve(experiment);
      } else {
        resolve(null);
      }
    });
  }
  getExperimentSafetyByExperimentPk(
    experimentPk: number
  ): Promise<ExperimentSafety | null> {
    return new Promise((resolve) => {
      const safety = this.experimentsSafety.find(
        (safety) => safety.experimentPk === experimentPk
      );
      if (safety) {
        resolve(safety);
      } else {
        resolve(null);
      }
    });
  }

  getExperimentSafety(
    experimentSafetyPk: number
  ): Promise<ExperimentSafety | null> {
    return new Promise((resolve) => {
      const safety = this.experimentsSafety.find(
        (safety) => safety.experimentSafetyPk === experimentSafetyPk
      );

      if (safety) {
        resolve(safety);
      } else {
        resolve(null);
      }
    });
  }

  createExperimentSafety(
    experimentPk: number,
    questionaryId: number,
    creatorId: number
  ): Promise<ExperimentSafety | Rejection> {
    // Simple implementation: create a new ExperimentSafety instance using the factory
    return new Promise((resolve) => {
      const safety = dummyExperimentSafetyFactory({
        experimentPk, // experimentPk
        esiQuestionaryId: questionaryId, // esiQuestionaryId
        createdBy: creatorId, // createdBy
      });

      this.experimentsSafety.push(safety);

      resolve(safety);
    });
  }

  submitExperimentSafety(
    args: SubmitExperimentSafetyArgs
  ): Promise<ExperimentSafety> {
    throw new Error('Method not implemented.');
  }
  getExperimentSafetyByESIQuestionaryId(
    esiQuestionaryId: number
  ): Promise<ExperimentSafety | null> {
    throw new Error('Method not implemented.');
  }
  addSampleToExperiment(
    experimentPk: number,
    sampleId: number,
    sampleEsiQuestionaryId: number
  ): Promise<ExperimentHasSample> {
    return new Promise((resolve) => {
      const sample = dummyExperimentHasSampleFactory({
        experimentPk, // experimentPk
        sampleId, // sampleId
        sampleEsiQuestionaryId, // sampleEsiQuestionaryId
      });

      resolve(sample);
    });
  }
  removeSampleFromExperiment(
    experimentPk: number,
    sampleId: number
  ): Promise<ExperimentHasSample> {
    return new Promise((resolve) => {
      const sample = dummyExperimentHasSampleFactory({
        experimentPk, // experimentPk
        sampleId, // sampleId
      });

      resolve(sample);
    });
  }
  getExperimentSample(
    experimentPk: number,
    sampleId: number
  ): Promise<ExperimentHasSample | null> {
    const sample = this.experimentSamples.find(
      (s) => s.experimentPk === experimentPk && s.sampleId === sampleId
    );

    return Promise.resolve(sample || null);
  }

  getExperimentSamples(experimentPk: number): Promise<ExperimentHasSample[]> {
    const samples = this.experimentSamples.filter(
      (s) => s.experimentPk === experimentPk
    );

    return Promise.resolve(samples);
  }

  getExperiments({ filter }: ExperimentsArgs): Promise<Experiment[]> {
    // For simplicity, ignoring filter and returning all experiments
    return Promise.resolve(this.experiments);
  }

  updateExperimentSample(
    experimentPk: number,
    sampleId: number,
    isSubmitted: boolean
  ): Promise<ExperimentHasSample> {
    return new Promise((resolve) => {
      const updatedSample = dummyExperimentHasSampleFactory({
        experimentPk, // experimentPk
        sampleId, // sampleId
        isEsiSubmitted: isSubmitted, // update isSubmitted status
      });
      resolve(updatedSample);
    });
  }

  getExperimentsByProposalPk(proposalPk: number): Promise<Experiment[]> {
    return Promise.resolve(
      this.experiments.filter((exp) => exp.proposalPk === proposalPk)
    );
  }
}

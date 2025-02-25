import { GraphQLError } from 'graphql';
import { inject, injectable } from 'tsyringe';

import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { ExperimentHasSample } from '../models/Experiment';
import { Sample } from '../models/Sample';
import { Tokens } from './../config/Tokens';
import { QuestionaryDataSource } from './../datasources/QuestionaryDataSource';

type SampleOverrides = Partial<
  Pick<
    Sample,
    | 'creatorId'
    | 'isPostProposalSubmission'
    | 'proposalPk'
    | 'questionId'
    | 'questionaryId'
    | 'title'
    | 'shipmentId'
  >
>;

type SampleESIOverrides = Partial<Pick<ExperimentHasSample, 'isEsiSubmitted'>>;

@injectable()
export class CloneUtils {
  constructor(
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.ExperimentDataSource)
    private experimentDataSource: ExperimentDataSource
  ) {}

  /**
   * Clones sample with all it's data structure
   * @param sourceSample sample to clone
   * @param overrides optional attributes to override
   * @returns cloned sample
   */
  async cloneSample(sourceSample: Sample, overrides?: SampleOverrides) {
    const newQuestionary = await this.questionaryDataSource.clone(
      sourceSample.questionaryId
    );
    let newSample = await this.sampleDataSource.create(
      overrides?.title || `Copy of ${sourceSample.title}`,
      overrides?.creatorId || sourceSample.creatorId,
      overrides?.proposalPk || sourceSample.proposalPk,
      newQuestionary.questionaryId,
      overrides?.questionId || sourceSample.questionId
    );

    if (overrides?.isPostProposalSubmission !== undefined) {
      newSample = await this.sampleDataSource.updateSample({
        sampleId: newSample.id,
        isPostProposalSubmission: overrides.isPostProposalSubmission,
      });
    }

    return newSample;
  }

  async cloneExperimentSample(
    sourceExperimentSample: ExperimentHasSample,
    overrides?: {
      experimentSafety?: SampleESIOverrides;
      sample?: SampleOverrides;
    }
  ) {
    const sourceSample = await this.sampleDataSource.getSample(
      sourceExperimentSample.sampleId
    );
    if (!sourceSample) {
      throw new GraphQLError('Sample could not be found');
    }

    const newSample = await this.cloneSample(sourceSample, overrides?.sample);
    const newQuestionary = await this.questionaryDataSource.clone(
      sourceExperimentSample.sampleEsiQuestionaryId
    );

    let newSampleEsi = await this.experimentDataSource.addSampleToExperiment(
      newSample.id,
      sourceExperimentSample.experimentPk,
      newQuestionary.questionaryId
    );

    if (overrides?.experimentSafety?.isEsiSubmitted !== undefined) {
      newSampleEsi = await this.experimentDataSource.updateExperimentSample(
        newSampleEsi.experimentPk,
        newSampleEsi.sampleId,
        overrides.experimentSafety.isEsiSubmitted
      );
    }

    return newSampleEsi;
  }
}

import { inject, injectable } from 'tsyringe';

import { SampleDataSource } from '../datasources/SampleDataSource';
import { SampleEsiDataSource } from '../datasources/SampleEsiDataSource';
import { Sample } from '../models/Sample';
import { Tokens } from './../config/Tokens';
import { QuestionaryDataSource } from './../datasources/QuestionaryDataSource';
import { SampleExperimentSafetyInput } from './../models/SampleExperimentSafetyInput';

type SampleOverrides = Partial<
  Pick<
    Sample,
    | 'creatorId'
    | 'isPostProposalSubmission'
    | 'proposalPk'
    | 'questionId'
    | 'questionaryId'
    | 'safetyComment'
    | 'safetyStatus'
    | 'title'
    | 'shipmentId'
  >
>;

type SampleESIOverrides = Partial<
  Pick<SampleExperimentSafetyInput, 'isSubmitted'>
>;

@injectable()
export class CloneUtils {
  constructor(
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
    @inject(Tokens.SampleEsiDataSource)
    private sampleEsiDataSource: SampleEsiDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource
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

    if (
      overrides?.isPostProposalSubmission !== undefined ||
      overrides?.safetyComment !== undefined ||
      overrides?.safetyStatus !== undefined
    ) {
      newSample = await this.sampleDataSource.updateSample({
        sampleId: newSample.id,
        isPostProposalSubmission: overrides.isPostProposalSubmission,
        safetyComment: overrides.safetyComment,
        safetyStatus: overrides.safetyStatus,
      });
    }

    return newSample;
  }

  async cloneSampleEsi(
    sourceSampleEsi: SampleExperimentSafetyInput,
    overrides?: {
      esi?: SampleESIOverrides;
      sample?: SampleOverrides;
    }
  ) {
    const sourceSample = await this.sampleDataSource.getSample(
      sourceSampleEsi.sampleId
    );
    if (!sourceSample) {
      throw new Error('Sample could not be found');
    }

    const newSample = await this.cloneSample(sourceSample, overrides?.sample);
    const newQuestionary = await this.questionaryDataSource.clone(
      sourceSampleEsi.questionaryId
    );
    let newSampleEsi = await this.sampleEsiDataSource.createSampleEsi({
      esiId: sourceSampleEsi.esiId,
      sampleId: newSample.id,
      questionaryId: newQuestionary.questionaryId,
    });
    if (overrides?.esi?.isSubmitted !== undefined) {
      newSampleEsi = await this.sampleEsiDataSource.updateSampleEsi({
        sampleId: newSampleEsi.sampleId,
        esiId: newSampleEsi.esiId,
        isSubmitted: overrides.esi.isSubmitted,
      });
    }

    return newSampleEsi;
  }
}

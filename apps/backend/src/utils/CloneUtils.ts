import { inject, injectable } from 'tsyringe';

import { SampleDataSource } from '../datasources/SampleDataSource';
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

@injectable()
export class CloneUtils {
  constructor(
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
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

    if (overrides?.isPostProposalSubmission !== undefined) {
      newSample = await this.sampleDataSource.updateSample({
        sampleId: newSample.id,
        isPostProposalSubmission: overrides.isPostProposalSubmission,
      });
    }

    return newSample;
  }
}

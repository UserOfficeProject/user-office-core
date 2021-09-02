import { Rejection, rejection } from '../../models/Rejection';
import {
  RiskAssessment,
  RiskAssessmentStatus,
} from '../../models/RiskAssessment';
import { Sample } from '../../models/Sample';
import { RiskAssessmentsFilter } from '../../queries/RiskAssessmentQueries';
import { CreateRiskAssessmentArgs } from '../../resolvers/mutations/CreateRiskAssesssment';
import { UpdateRiskAssessmentArgs } from '../../resolvers/mutations/UpdateRiskAssessmentMutation';
import { RiskAssessmentDataSource } from './../RiskAssessmentDataSource';
export class RiskAssessmentDataSourceMock implements RiskAssessmentDataSource {
  public static DRAFT_RISK_ASSESSMENT_ID = 1;
  public static SUBMITTED_RISK_ASSESSMENT_ID = 2;

  riskAssessments: RiskAssessment[];
  constructor() {
    this.init();
  }

  public init() {
    this.riskAssessments = [
      new RiskAssessment(
        RiskAssessmentDataSourceMock.DRAFT_RISK_ASSESSMENT_ID,
        1,
        1,
        1,
        1,
        RiskAssessmentStatus.DRAFT,
        new Date()
      ),
      new RiskAssessment(
        RiskAssessmentDataSourceMock.SUBMITTED_RISK_ASSESSMENT_ID,
        2,
        2,
        1,
        2,
        RiskAssessmentStatus.SUBMITTED,
        new Date()
      ),
    ];
  }

  async createRiskAssessment(
    args: CreateRiskAssessmentArgs,
    creatorId: number
  ): Promise<RiskAssessment> {
    const maxId = this.riskAssessments.reduce((max, val) =>
      max > val ? max : val
    ).riskAssessmentId;

    const newAssessment = new RiskAssessment(
      maxId + 1,
      args.proposalPk,
      args.scheduledEventId,
      creatorId,
      2,
      RiskAssessmentStatus.DRAFT,
      new Date()
    );
    this.riskAssessments.push(newAssessment);

    return newAssessment;
  }
  async getRiskAssessment(
    riskAssessmentId: number
  ): Promise<RiskAssessment | null> {
    return (
      this.riskAssessments.find(
        (ra) => ra.riskAssessmentId === riskAssessmentId
      ) || null
    );
  }
  async getRiskAssessments(
    filter: RiskAssessmentsFilter
  ): Promise<RiskAssessment[]> {
    return this.riskAssessments.filter((ra) => {
      let matchFilter = false;
      if (filter.proposalPk) {
        matchFilter = ra.proposalPk === filter.proposalPk;
      }
      if (filter.scheduledEventId) {
        matchFilter =
          matchFilter && ra.scheduledEventId === filter.scheduledEventId;
      }

      return matchFilter;
    });
  }

  getRiskAssessmentSamples(riskAssessmentId: number): Promise<Sample[]> {
    throw new Error('Method not implemented.');
  }

  async updateRiskAssessment(
    args: UpdateRiskAssessmentArgs
  ): Promise<RiskAssessment | Rejection> {
    const riskAssessment = await this.getRiskAssessment(args.riskAssessmentId);
    if (!riskAssessment) {
      return rejection('Risk assessment does not exist');
    }

    riskAssessment.questionaryId =
      args.questionaryId ?? riskAssessment.questionaryId;
    riskAssessment.status = args.status ?? riskAssessment.status;

    return riskAssessment;
  }
  async deleteRiskAssessment(
    riskAssessmentId: number
  ): Promise<RiskAssessment | Rejection> {
    const index = this.riskAssessments.findIndex(
      (ra) => ra.riskAssessmentId == riskAssessmentId
    );
    if (index === -1) {
      return rejection('Risk assessment does not exist');
    }

    return this.riskAssessments.splice(index, 1)[0];
  }
}

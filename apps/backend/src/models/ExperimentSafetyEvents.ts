export class ExperimentSafetyEvents {
  constructor(
    public experimentPk: number,
    public experimentSafetyManagementDecisionSubmittedByIS: boolean,
    public experimentSafetyManagementDecisionSubmittedByESR: boolean,
    public experimentESFSubmitted: boolean,
    public experimentESFApprovedByIS: boolean,
    public experimentESFRejectedByIS: boolean,
    public experimentESFApprovedByESR: boolean,
    public experimentESFRejectedByESR: boolean
  ) {}
}

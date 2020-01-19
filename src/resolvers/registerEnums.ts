import { registerEnumType } from "type-graphql";
import { PageName } from "../models/Page";
import { DataType, ProposalStatus } from "../models/ProposalModel";
import { ReviewStatus } from "../models/Review";
import { EvaluatorOperator } from "../models/ConditionEvaluator";

export const registerEnums = () => {
  registerEnumType(ProposalStatus, { name: "ProposalStatus" });
  registerEnumType(ReviewStatus, { name: "ReviewStatus" });
  registerEnumType(PageName, { name: "PageName" });
  registerEnumType(EvaluatorOperator, { name: "EvaluatorOperator" });
  registerEnumType(DataType, {
    name: "DataType"
  });
};

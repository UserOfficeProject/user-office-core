import { registerEnumType } from "type-graphql";
import { PageName } from "../models/Page";
import { DataType, ProposalStatus } from "../models/ProposalModel";
import { ReviewStatus } from "../models/Review";
import { UserRole } from "../models/User";

export const registerEnums = () => {
  registerEnumType(ProposalStatus, { name: "ProposalStatus" });
  registerEnumType(ReviewStatus, { name: "ReviewStatus" });
  registerEnumType(PageName, { name: "PageName" });
  registerEnumType(UserRole, { name: "UserRole" });
  registerEnumType(DataType, {
    name: "DataType"
  });
};

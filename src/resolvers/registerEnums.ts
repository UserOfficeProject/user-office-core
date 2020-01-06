import { registerEnumType } from "type-graphql";
import { PageName } from "../models/Page";
import { DataType, ProposalStatus } from "../models/ProposalModel";

export const registerEnums = () => {
  registerEnumType(ProposalStatus, { name: "ProposalStatus" });
  registerEnumType(PageName, { name: "PageName" });
  registerEnumType(DataType, {
    name: "DataType"
  });
};

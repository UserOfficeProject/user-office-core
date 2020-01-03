import { registerEnumType } from "type-graphql";

export enum PageName {
  HOMEPAGE = 1,
  HELPPAGE = 2,
  PRIVACYPAGE = 3,
  COOKIEPAGE = 4
}

registerEnumType(PageName, { name: "PageName" });

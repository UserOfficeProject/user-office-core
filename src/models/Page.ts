import { registerEnumType } from "type-graphql";

export enum PageName {
  HOMEPAGE,
  HELPPAGE,
  PRIVACYPAGE,
  COOKIEPAGE
}

registerEnumType(PageName, { name: "PageName" });

import React from "react";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { EmbellishmentConfig } from "../generated/sdk";

export function ProposalComponentEmbellishment(props: IBasicComponentProps) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: (props.templateField.config as EmbellishmentConfig).html!
      }}
    ></div>
  );
}

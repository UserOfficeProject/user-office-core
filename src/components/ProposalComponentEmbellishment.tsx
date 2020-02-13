import React from "react";
import { EmbellishmentConfig } from "../generated/sdk";
import { IBasicComponentProps } from "./IBasicComponentProps";

export function ProposalComponentEmbellishment(props: IBasicComponentProps) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: (props.templateField.config as EmbellishmentConfig).html!
      }}
    ></div>
  );
}

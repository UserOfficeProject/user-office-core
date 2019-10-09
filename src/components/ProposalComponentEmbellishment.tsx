import React from 'react';
import { IBasicComponentProps } from "./IBasicComponentProps";

export function ProposalComponentEmbellishment(props: IBasicComponentProps) {

    return <div dangerouslySetInnerHTML={{__html:props.templateField.config.html!}}></div>;

}
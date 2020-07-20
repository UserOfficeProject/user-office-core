import React from 'react';
import { BasicComponentProps } from '../IBasicComponentProps';
import { EmbellishmentConfig } from '../../../generated/sdk';

export function ProposalComponentEmbellishment(props: BasicComponentProps) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: (props.templateField.config as EmbellishmentConfig).html,
      }}
    ></div>
  );
}

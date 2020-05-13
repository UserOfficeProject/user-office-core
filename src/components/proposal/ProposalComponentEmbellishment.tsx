import React from 'react';

import { EmbellishmentConfig } from '../../generated/sdk';
import { BasicComponentProps } from './IBasicComponentProps';

export function ProposalComponentEmbellishment(props: BasicComponentProps) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: (props.templateField.config as EmbellishmentConfig).html,
      }}
    ></div>
  );
}

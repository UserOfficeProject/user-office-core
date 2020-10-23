import React from 'react';

import { EmbellishmentConfig } from '../../../generated/sdk';
import { BasicComponentProps } from '../../proposal/IBasicComponentProps';

export function QuestionaryComponentEmbellishment(props: BasicComponentProps) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: (props.templateField.config as EmbellishmentConfig).html,
      }}
    ></div>
  );
}

import React from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import { EmbellishmentConfig } from 'generated/sdk';

export function QuestionaryComponentEmbellishment(props: BasicComponentProps) {
  const config = props.answer.config as EmbellishmentConfig;

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: config.html,
      }}
    ></div>
  );
}

import Typography from '@mui/material/Typography';
import React from 'react';

import { RabbitMqActionConfig as RabbitMqActionConfigType } from 'generated/sdk';

type RabbitMQActionConfigProps = {
  exchanges: RabbitMqActionConfigType['exchanges'];
};

const RabbitMQActionConfig = ({ exchanges }: RabbitMQActionConfigProps) => {
  return (
    <Typography variant="subtitle1" color="black">
      Messages are sent to following RabbitMQ exchanges:{' '}
      <ul style={{ margin: 0 }}>
        {exchanges?.map((exchange, index) => (
          <li key={index}>
            <b>{exchange}</b>
          </li>
        ))}
      </ul>
    </Typography>
  );
};

export default RabbitMQActionConfig;

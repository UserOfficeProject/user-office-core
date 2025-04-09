import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import { TimeIcon } from '@mui/x-date-pickers';
import React from 'react';

import { VisitRegistrationStatus } from 'generated/sdk';

interface IVisitStatusIconProps {
  status: VisitRegistrationStatus;
}

export default function VisitStatusIcon(props: IVisitStatusIconProps) {
  switch (props.status) {
    case VisitRegistrationStatus.DRAFTED:
      return <TimeIcon />;
    case VisitRegistrationStatus.SUBMITTED:
      return <CheckBoxOutlineBlankIcon style={{ color: 'gray' }} />;
    case VisitRegistrationStatus.APPROVED:
      return <CheckBoxIcon style={{ color: 'green' }} />;
    case VisitRegistrationStatus.CANCELLED_BY_USER:
    case VisitRegistrationStatus.CANCELLED_BY_FACILITY:
      return <DisabledByDefaultIcon style={{ color: 'black' }} />;
    default:
      return null;
  }
}

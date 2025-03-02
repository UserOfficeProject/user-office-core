import BrowserNotSupportedIcon from '@mui/icons-material/BrowserNotSupported';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
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
    case VisitRegistrationStatus.DISAPPROVED:
      return <BrowserNotSupportedIcon style={{ color: 'green' }} />;
    default:
      return null;
  }
}

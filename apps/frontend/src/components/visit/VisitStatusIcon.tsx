import ClearOutlinedIcon from '@mui/icons-material/Clear';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import RestorePageOutlinedIcon from '@mui/icons-material/RestorePageOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import React from 'react';

import DotBadge from 'components/proposalBooking/DotBadge';
import { VisitRegistrationStatus } from 'generated/sdk';

interface IVisitStatusIconProps {
  status: VisitRegistrationStatus;
}

export default function VisitStatusOutlinedIcon(props: IVisitStatusIconProps) {
  switch (props.status) {
    case VisitRegistrationStatus.DRAFTED:
      return <NoteAltOutlinedIcon />;
    case VisitRegistrationStatus.SUBMITTED:
      return (
        <DotBadge
          sx={{
            '& .MuiBadge-dot': {
              background: '#eb1a6c',
              boxShadow: '-1px 1px 0 white',
            },
          }}
        >
          <DescriptionOutlinedIcon />
        </DotBadge>
      );
    case VisitRegistrationStatus.APPROVED:
      return (
        <DotBadge
          sx={{
            '& .MuiBadge-dot': {
              background: '#22d131',
              boxShadow: '-1px 1px 0 white',
            },
          }}
        >
          <TaskOutlinedIcon />
        </DotBadge>
      );
    case VisitRegistrationStatus.CANCELLED_BY_USER:
    case VisitRegistrationStatus.CANCELLED_BY_FACILITY:
      return <ClearOutlinedIcon />;
    case VisitRegistrationStatus.CHANGE_REQUESTED:
      return <RestorePageOutlinedIcon />;
    default:
      return null;
  }
}

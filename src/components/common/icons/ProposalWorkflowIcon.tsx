import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import React from 'react';

// NOTE: The icon is taken from: https://materialdesignicons.com/
const ProposalWorkflowIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path
        fill="currentColor"
        d="M9,2V8H11V11H5C3.89,11 3,11.89 3,13V16H1V22H7V16H5V13H11V16H9V22H15V16H13V13H19V16H17V22H23V16H21V13C21,11.89 20.11,11 19,11H13V8H15V2H9Z"
      />
    </SvgIcon>
  );
};

export default ProposalWorkflowIcon;

import SvgIcon from '@mui/material/SvgIcon';
import React from 'react';

const EsiIcon: React.FC = (props) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
        <path d="M0 252h512v37H0zM0 319v97l64 64h142.871l38.374-63.992 21.51-.008 38.374 64H448l64-64v-97zM352 96h12.747l50.452 126h95.468L384 32h-32c-17.673 0-32 14.327-32 32s14.327 32 32 32zM96.801 222l50.452-126H160c17.673 0 32-14.327 32-32s-14.327-32-32-32h-32L1.333 222z" />
      </svg>
    </SvgIcon>
  );
};

export default EsiIcon;

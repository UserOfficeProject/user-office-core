import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import React from 'react';

// NOTE: The icon is taken from: https://materialdesignicons.com/
const BoxIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <path d="M16.483 9.247l-3.503 1.899-10.788-6.304 3.474-1.962 10.817 6.367zm2.064-1.106l3.391-1.802-11.171-6.339-3.089 1.744 10.869 6.397zm-6.547 4.749l-11-6.429v10.988l11 6.265v-10.824zm11-4.845v10.83l-9 5.125v-11.132l9-4.823zm-5.959 9.388l-.349.199v1.713l.349-.195v-1.717zm.584-.333l-.343.195v1.717l.343-.195v-1.717zm.821-.468l-.343.196v1.717l.343-.196v-1.717zm.574-.326l-.343.195v1.717l.343-.195v-1.717zm.584-.333l-.349.199v1.717l.349-.199v-1.717zm.844-.481l-.343.195v1.717l.289-.165.054-.031v-1.716z" />
    </SvgIcon>
  );
};

export default BoxIcon;

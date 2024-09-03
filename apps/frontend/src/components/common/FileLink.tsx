import Link from '@mui/material/Link';
import { SxProps, Theme } from '@mui/system';
import React, { useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';

export function FileLink(props: {
  link: string;
  filename: string;
  children: NonNullable<React.ReactNode>;
  sx?: SxProps<Theme>;
}) {
  const { token } = useContext(UserContext);

  const AddAuthToLink = (link: string, fileName: string) => {
    fetch(link, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
      });
  };

  return (
    <Link
      download
      onClick={() => AddAuthToLink(props.link, props.filename)}
      sx={{ cursor: 'pointer', ...props.sx }}
    >
      {props.children}
    </Link>
  );
}

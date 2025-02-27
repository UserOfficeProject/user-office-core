import {
  ExpandLess,
  ExpandMore,
  Inbox as InboxIcon,
} from '@mui/icons-material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import crossFetch from 'cross-fetch';
import { useSnackbar } from 'notistack';
import React, { useState, useContext, useRef } from 'react';

import { downloadBlob } from 'utils/downloadBlob';

import { UserContext } from './UserContextProvider';

export const DownloadMonitorDialog = ({
  items,
  cancel,
}: {
  items: InProgressItem[];
  cancel?: (id: string) => void;
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  const handleToggle = () => setOpen((open) => !open);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        right: theme.spacing(0.5),
        width: 360,
        zIndex: theme.zIndex.snackbar,
      }}
    >
      <List component="div" disablePadding data-cy="preparing-download-dialog">
        <ListItemButton
          onClick={handleToggle}
          sx={{
            borderBottom: 0,
            backgroundColor: theme.palette.text.primary,
            color: theme.palette.background.paper,
            paddingTop: theme.spacing(1.5),
            paddingBottom: theme.spacing(1.5),
            borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
          component="li"
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary="Preparing download" />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={open} timeout="auto">
          <List component="div" disablePadding>
            {items.map((item) => {
              return (
                <ListItem
                  key={item.id}
                  sx={{ paddingLeft: `${theme.spacing(2)}px !important` }}
                >
                  <ListItemIcon>
                    <CircularProgress size={24} />
                  </ListItemIcon>
                  <ListItemText
                    data-cy="preparing-download-dialog-item"
                    sx={{ flexBasis: 0 }}
                    primaryTypographyProps={{
                      noWrap: true,
                      variant: 'caption',
                    }}
                    primary={
                      item.total > 1 ? (
                        <i>{item.total} selected items</i>
                      ) : (
                        item.name
                      )
                    }
                  />
                  {cancel && (
                    <Button variant="text" onClick={() => cancel(item.id)}>
                      Cancel
                    </Button>
                  )}
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </List>
    </Paper>
  );
};

export enum PREPARE_DOWNLOAD_TYPE {
  PDF_PROPOSAL,
  PDF_SAMPLE,
  PDF_SHIPMENT_LABEL,
  PDF_GENERIC_TEMPLATE,
  ZIP_ATTACHMENT,
  ZIP_PROPOSAL,
  XLSX_PROPOSAL,
  XLSX_FAP,
  XLSX_CALL_FAP,
  XLSX_PROPOSAL_TECHNIQUE,
}

export type DownloadOptions = {
  questionIds?: string;
};

export interface DownloadContextData {
  prepareDownload: (
    type: PREPARE_DOWNLOAD_TYPE,
    id: Array<number | number[]>,
    name: string | null,
    options?: DownloadOptions
  ) => void;
}

type InProgressItem = { id: string; name: string | null; total: number };
type PendingRequest = { req: Promise<unknown>; controller: AbortController };

export const DownloadContext = React.createContext<DownloadContextData>({
  prepareDownload: () => void 0,
});

function generateLink(
  type: PREPARE_DOWNLOAD_TYPE,
  ids: Array<number | number[]>,
  options?: DownloadOptions
): string {
  switch (type) {
    case PREPARE_DOWNLOAD_TYPE.PDF_PROPOSAL:
      return '/download/pdf/proposal/' + ids;
    case PREPARE_DOWNLOAD_TYPE.PDF_SAMPLE:
      return '/download/pdf/sample/' + ids;
    case PREPARE_DOWNLOAD_TYPE.PDF_SHIPMENT_LABEL:
      return '/download/pdf/shipment-label/' + ids;
    case PREPARE_DOWNLOAD_TYPE.PDF_GENERIC_TEMPLATE:
      return '/download/pdf/generic-template/' + ids;
    case PREPARE_DOWNLOAD_TYPE.XLSX_PROPOSAL:
      return '/download/xlsx/proposal/' + ids;
    case PREPARE_DOWNLOAD_TYPE.XLSX_PROPOSAL_TECHNIQUE:
      return '/download/xlsx/technique/' + ids;
    case PREPARE_DOWNLOAD_TYPE.XLSX_CALL_FAP:
      return '/download/xlsx/call_fap/' + ids;
    case PREPARE_DOWNLOAD_TYPE.XLSX_FAP:
      const [params] = ids;

      if (!Array.isArray(params)) {
        throw new Error('Invalid params: ' + params);
      }

      const [fapId, callId] = params;

      return `/download/xlsx/fap/${fapId}/call/${callId}`;
    case PREPARE_DOWNLOAD_TYPE.ZIP_ATTACHMENT:
      if (!options?.questionIds) {
        throw new Error('Question ids are require');
      }

      return `/download/zip/attachment/${ids}?questionIds=${options?.questionIds}`;
    case PREPARE_DOWNLOAD_TYPE.ZIP_PROPOSAL:
      return '/download/zip/proposal/' + ids;
    default:
      throw new Error('Unknown type:' + type);
  }
}

async function delayInTest() {
  if ('Cypress' in window) {
    return new Promise((resolve) => setTimeout(resolve, 250));
  }
}

export const DownloadContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { token, handleLogout } = useContext(UserContext);
  const [inProgress, setInProgress] = useState<InProgressItem[]>([]);
  const pendingRequests = useRef<Map<string, PendingRequest>>(new Map());

  const isLoggedIn = token !== '';

  const cleanUpDownload = (id: string) => {
    pendingRequests.current.delete(id);
    setInProgress((inProgress) => inProgress.filter((item) => item.id !== id));
  };

  const cancelDownload = (id: string) => {
    pendingRequests.current.get(id)?.controller.abort();
  };

  const promptDownload = async (response: Response) => {
    const filename = response.headers.get('x-download-filename') || 'unknown';
    const blob = await response.blob();

    downloadBlob(blob, filename);
  };

  const prepareDownload = (
    type: PREPARE_DOWNLOAD_TYPE,
    ids: Array<number | number[]>,
    name: string | null,
    options?: DownloadOptions
  ) => {
    const id = `${type}__${ids}`;
    if (pendingRequests.current.has(id)) {
      return;
    }

    const controller = new AbortController();
    const req = crossFetch(generateLink(type, ids, options), {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        await delayInTest();
        if (response.status !== 200) {
          if (response.status === 401) {
            const reason =
              'Your session has expired, you will need to log in again through the external homepage';
            enqueueSnackbar(reason, {
              variant: 'error',
              className: 'snackbar-error',
              autoHideDuration: 10000,
            });
            handleLogout();
          }

          return Promise.reject(await response.text());
        }

        await promptDownload(response);
      })
      .catch((error) => {
        if (error === 'NO_ATTACHMENTS') {
          enqueueSnackbar('No attachments found', { variant: 'info' });
        } else if (
          error !== 'EXTERNAL_TOKEN_INVALID' &&
          error.name !== 'AbortError'
        ) {
          enqueueSnackbar('Failed to download file', { variant: 'error' });
        }
      })
      .finally(() => {
        cleanUpDownload(id);
      });

    pendingRequests.current.set(id, { controller, req });
    setInProgress((inProgress) => [
      ...inProgress,
      { id, name, total: ids.length },
    ]);
  };

  return (
    <DownloadContext.Provider value={{ prepareDownload }}>
      {children}
      {isLoggedIn && inProgress.length > 0 && (
        <DownloadMonitorDialog items={inProgress} cancel={cancelDownload} />
      )}
    </DownloadContext.Provider>
  );
};

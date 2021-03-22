import {
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  CircularProgress,
  Button,
} from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { ExpandLess, ExpandMore, Inbox as InboxIcon } from '@material-ui/icons';
import crossFetch from 'cross-fetch';
import { useSnackbar } from 'notistack';
import React, { useState, useContext, useRef } from 'react';

import { UserContext } from './UserContextProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: 0,
    right: theme.spacing(0.5),
    width: 360,
    zIndex: theme.zIndex.snackbar,
  },
  header: {
    borderBottom: 0,
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.background.paper,
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
  },
  headerIcon: {
    color: 'inherit',
  },
  nestedItem: {
    paddingLeft: `${theme.spacing(2)}px !important`,
  },
  listItemText: {
    flexBasis: 0,
  },
}));

const DownloadMonitorDialog = ({
  items,
  cancel,
}: {
  items: InProgressItem[];
  cancel: (id: string) => void;
}) => {
  const classes = useStyles();
  const [open, setOpen] = useState(true);

  const handleToggle = () => setOpen((open) => !open);

  return (
    <Paper elevation={3} className={classes.root}>
      <List component="div" disablePadding data-cy="preparing-download-dialog">
        <ListItem button onClick={handleToggle} className={classes.header}>
          <ListItemIcon className={classes.headerIcon}>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary="Preparing download" />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto">
          <List component="div" disablePadding>
            {items.map((item) => {
              return (
                <ListItem key={item.id} className={classes.nestedItem}>
                  <ListItemIcon>
                    <CircularProgress size={24} />
                  </ListItemIcon>
                  <ListItemText
                    data-cy="preparing-download-dialog-item"
                    className={classes.listItemText}
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
                  <Button onClick={() => cancel(item.id)}>Cancel</Button>
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

  XLSX_PROPOSAL,
  XLSX_SEP,
}

export interface DownloadContextData {
  prepareDownload: (
    type: PREPARE_DOWNLOAD_TYPE,
    id: Array<number | number[]>,
    name: string | null
  ) => void;
}

type InProgressItem = { id: string; name: string | null; total: number };
type PendingRequest = { req: Promise<unknown>; controller: AbortController };

export const DownloadContext = React.createContext<DownloadContextData>({
  prepareDownload: () => void 0,
});

function generateLink(
  type: PREPARE_DOWNLOAD_TYPE,
  ids: Array<number | number[]>
): string {
  switch (type) {
    case PREPARE_DOWNLOAD_TYPE.PDF_PROPOSAL:
      return '/download/pdf/proposal/' + ids;
    case PREPARE_DOWNLOAD_TYPE.PDF_SAMPLE:
      return '/download/pdf/sample/' + ids;
    case PREPARE_DOWNLOAD_TYPE.PDF_SHIPMENT_LABEL:
      return '/download/pdf/shipment-label/' + ids;
    case PREPARE_DOWNLOAD_TYPE.XLSX_PROPOSAL:
      return '/download/xlsx/proposal/' + ids;
    case PREPARE_DOWNLOAD_TYPE.XLSX_SEP:
      const [params] = ids;

      if (!Array.isArray(params)) {
        throw new Error('Invalid params: ' + params);
      }

      const [sepId, callId] = params;

      return `/download/xlsx/sep/${sepId}/call/${callId}`;
    default:
      throw new Error('Unknown type:' + type);
  }
}

async function delayInTest() {
  if ('Cypress' in window) {
    return new Promise((resolve) => setTimeout(resolve, 250));
  }
}

export const DownloadContextProvider: React.FC = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { token } = useContext(UserContext);
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
    const url = URL.createObjectURL(blob);

    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', decodeURIComponent(filename));

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    setTimeout(() => URL.revokeObjectURL(url), 150);
  };

  const prepareDownload = (
    type: PREPARE_DOWNLOAD_TYPE,
    ids: Array<number | number[]>,
    name: string | null
  ) => {
    const id = `${type}__${ids}`;
    if (pendingRequests.current.has(id)) {
      return;
    }

    const controller = new AbortController();
    const req = crossFetch(generateLink(type, ids), {
      signal: controller.signal,
    })
      .then(async (response) => {
        await delayInTest();
        if (response.status !== 200) {
          return Promise.reject(await response.text());
        }

        await promptDownload(response);
        cleanUpDownload(id);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          enqueueSnackbar('Failed to download file', { variant: 'error' });
          console.error('Request failed:', e);
        }

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

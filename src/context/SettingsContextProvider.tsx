import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

import { Settings, SettingsId } from 'generated/sdk';
import { useFeatures } from 'hooks/admin/useFeatures';

interface SettingsContextData {
    readonly settings: Map<SettingsId, Settings>;
  }

const useStyles = makeStyles({
    loader: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    },
});
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import useTheme from '@material-ui/core/styles/useTheme';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import React, { useEffect } from 'react';
import {
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

import { StyledPaper } from 'styles/StyledComponents';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

type FullWidthTabsProps = {
  children: React.ReactNode[];
  tabNames: string[];
  isInsideModal?: boolean;
};

const FullWidthTabs: React.FC<FullWidthTabsProps> = ({
  tabNames,
  children,
  isInsideModal,
}) => {
  const theme = useTheme();
  const [query, setQuery] = useQueryParams({
    tab: withDefault(NumberParam, 0),
    modalTab: withDefault(NumberParam, 0),
    modal: StringParam,
  });

  const handleChange = (
    event: React.ChangeEvent<Record<string, unknown>>,
    newValue: number
  ) => {
    const tabValue = newValue > 0 ? newValue : undefined;

    if (isInsideModal) {
      setQuery({ modalTab: tabValue });
    } else {
      setQuery({ tab: tabValue });
    }
  };

  useEffect(() => {
    return () => {
      if (isInsideModal) {
        setQuery({ modalTab: undefined });
      } else {
        setQuery({ tab: undefined });
      }
    };
  }, [setQuery, isInsideModal]);

  return (
    <StyledPaper>
      <AppBar position="static" color="default">
        <Tabs
          value={isInsideModal ? query.modalTab : query.tab}
          onChange={handleChange}
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          {tabNames.map((tabName, i) => (
            <Tab key={i} label={tabName} {...a11yProps(i)} />
          ))}
        </Tabs>
      </AppBar>

      {children.map((tabContent, i) => (
        <TabPanel
          key={i}
          value={isInsideModal ? query.modalTab : query.tab}
          index={i}
          dir={theme.direction}
        >
          {tabContent}
        </TabPanel>
      ))}
    </StyledPaper>
  );
};

export default FullWidthTabs;

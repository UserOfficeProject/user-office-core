import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import useMediaQuery from '@mui/material/useMediaQuery';
import makeStyles from '@mui/styles/makeStyles';
import useTheme from '@mui/styles/useTheme';
import React, { useEffect } from 'react';
import {
  NumberParam,
  StringParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
  padding?: number | string;
  orientation: 'horizontal' | 'vertical';
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, padding, orientation, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`${orientation}-tab-${index}`}
      aria-labelledby={`${orientation}-tabpanel-${index}`}
      width="100%"
      overflow="auto"
      {...other}
    >
      {value === index && <Box p={padding}>{children}</Box>}
    </Box>
  );
}

const a11yProps = (index: number, orientation: 'horizontal' | 'vertical') => ({
  id: `${orientation}-tab-${index}`,
  'aria-controls': `${orientation}-tabpanel-${index}`,
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    boxShadow: theme.shadows[1],
  },
  tabs: {
    width: 'auto',
    flexShrink: 0,
    backgroundColor: theme.palette.grey['100'],
    boxShadow: theme.shadows[1],
  },
  tabsNoItems: {
    minWidth: '150px',

    '& .MuiTabs-indicator': {
      display: 'none',
    },
  },
  tabsRightBorder: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

type SimpleTabsProps = {
  children: React.ReactNode[];
  tabNames: string[];
  isInsideModal?: boolean;
  tabPanelPadding?: number | string;
  orientation?: 'horizontal' | 'vertical';
  noItemsText?: string;
};

const SimpleTabs = ({
  tabNames,
  children,
  isInsideModal,
  orientation = 'horizontal',
  tabPanelPadding = 3,
  noItemsText,
  ...other
}: SimpleTabsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 500px)');
  const classes = useStyles();
  const [query, setQuery] = useQueryParams({
    tab: withDefault(NumberParam, 0),
    modalTab: withDefault(NumberParam, 0),
    verticalTab: withDefault(NumberParam, 0),
    modal: StringParam,
  });
  const noItems = children.length === 0;

  // NOTE: If screen is mobile use horizontal orientation for space optimization
  if (isMobile) {
    orientation = 'horizontal';
  }

  const isVerticalOrientation = orientation === 'vertical';

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: number
  ) => {
    const tabValue = newValue > 0 ? newValue : undefined;

    if (isVerticalOrientation) {
      setQuery({ verticalTab: tabValue });
    } else if (isInsideModal) {
      setQuery({ modalTab: tabValue });
    } else {
      setQuery({ tab: tabValue });
    }
  };

  useEffect(() => {
    return () => {
      if (isVerticalOrientation) {
        setQuery({ verticalTab: undefined });
      } else if (isInsideModal) {
        setQuery({ modalTab: undefined });
      } else {
        setQuery({ tab: undefined });
      }
    };
  }, [setQuery, isInsideModal, isVerticalOrientation]);

  const tabsClasses = `${classes.tabs} ${
    isVerticalOrientation && classes.tabsRightBorder
  } ${noItems && classes.tabsNoItems}`;

  const tabValue = isVerticalOrientation
    ? query.verticalTab
    : isInsideModal
    ? query.modalTab
    : query.tab;

  return (
    <Box className={isVerticalOrientation ? classes.root : ''}>
      <Tabs
        value={tabValue}
        onChange={handleChange}
        textColor="primary"
        variant="scrollable"
        scrollButtons={isMobile ? true : 'auto'}
        aria-label={`${orientation} tabs example`}
        indicatorColor="primary"
        orientation={orientation}
        className={tabsClasses}
        {...other}
      >
        {tabNames.map((tabName, i) => (
          <Tab key={i} label={tabName} {...a11yProps(i, orientation)} />
        ))}
      </Tabs>

      {noItems ? (
        <Box
          display="flex"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          padding={1}
        >
          {noItemsText}
        </Box>
      ) : (
        children.map((tabContent, i) => (
          <TabPanel
            key={i}
            value={tabValue}
            index={i}
            dir={theme.direction}
            padding={tabPanelPadding}
            orientation={orientation}
          >
            {tabContent}
          </TabPanel>
        ))
      )}
    </Box>
  );
};

export default SimpleTabs;

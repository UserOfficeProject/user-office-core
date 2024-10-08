import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

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
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get('tab') ?? '0';
  const modalTab = searchParams.get('modalTab') ?? '0';
  const verticalTab = searchParams.get('verticalTab') ?? '0';

  const noItems = children.length === 0;

  const styles = {
    tabs: {
      width: 'auto',
      flexShrink: 0,
      backgroundColor: theme.palette.grey['100'],
      boxShadow: theme.shadows[1],
    },
    tabsRightBorder: {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
    tabsNoItems: {
      minWidth: '150px',

      '& .MuiTabs-indicator': {
        display: 'none',
      },
    },
  };

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
      setSearchParams((searchParam) => {
        const searchParamCloned = new URLSearchParams(searchParam);
        searchParamCloned.delete('verticalTab');
        if (tabValue) searchParamCloned.append('verticalTab', String(tabValue));

        return searchParamCloned;
      });
    } else if (isInsideModal) {
      setSearchParams((searchParam) => {
        const searchParamCloned = new URLSearchParams(searchParam);
        searchParamCloned.delete('modalTab');
        if (tabValue) searchParamCloned.append('modalTab', String(tabValue));

        return searchParamCloned;
      });
    } else {
      setSearchParams((searchParam) => {
        const searchParamCloned = new URLSearchParams(searchParam);
        searchParamCloned.delete('tab');
        if (tabValue) searchParamCloned.append('tab', String(tabValue));

        return searchParamCloned;
      });
    }
  };

  const tabValue = isVerticalOrientation
    ? +verticalTab
    : isInsideModal
      ? +modalTab
      : +tab;

  return (
    <Box
      sx={{
        ...(isVerticalOrientation && {
          flexGrow: 1,
          backgroundColor: theme.palette.background.paper,
          display: 'flex',
          boxShadow: theme.shadows[1],
        }),
      }}
    >
      <Tabs
        value={tabValue}
        onChange={handleChange}
        textColor="primary"
        variant="scrollable"
        scrollButtons={isMobile ? true : 'auto'}
        aria-label={`${orientation} tabs example`}
        indicatorColor="primary"
        orientation={orientation}
        sx={{
          ...styles.tabs,
          ...(isVerticalOrientation && styles.tabsRightBorder),
          ...(noItems && styles.tabsNoItems),
        }}
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

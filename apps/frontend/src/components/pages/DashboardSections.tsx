import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import MuiPaper from '@mui/material/Paper';
import React, { useState } from 'react';

import { useIsMobile } from 'hooks/common/useResponsive';
import { StyledPaper } from 'styles/StyledComponents';

export type DashboardSection = {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  render: (options: { canHideWhenEmpty: boolean }) => React.ReactNode;
};

export const Panel = ({ children }: { children: React.ReactNode }) => (
  <StyledPaper
    margin={[0, 0, 2, 0]}
    sx={{
      '&:empty': {
        display: 'none',
      },
    }}
  >
    {children}
  </StyledPaper>
);

const StackedSections = ({ sections }: { sections: DashboardSection[] }) => (
  <>
    {sections.map((section) => (
      <Panel key={section.id}>
        {section.render({ canHideWhenEmpty: true })}
      </Panel>
    ))}
  </>
);

const TabbedSections = ({ sections }: { sections: DashboardSection[] }) => {
  const [current, setCurrent] = useState(sections[0].id);

  return (
    <>
      {sections.map((section) => (
        <Box
          key={section.id}
          hidden={section.id !== current}
          sx={{ display: section.id === current ? 'block' : 'none' }}
        >
          <Panel>{section.render({ canHideWhenEmpty: false })}</Panel>
        </Box>
      ))}
      <MuiPaper
        elevation={3}
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <BottomNavigation
          value={current}
          onChange={(_event, section) => setCurrent(section)}
          showLabels
          data-cy="dashboard-section-nav"
        >
          {sections.map((section) => (
            <BottomNavigationAction
              key={section.id}
              label={section.label ?? section.id}
              value={section.id}
              icon={section.icon}
              data-cy={`dashboard-section-${section.id}`}
            />
          ))}
        </BottomNavigation>
      </MuiPaper>
    </>
  );
};

const DashboardSections = ({ sections }: { sections: DashboardSection[] }) => {
  const isMobile = useIsMobile();

  return isMobile && sections.length > 1 ? (
    <TabbedSections sections={sections} />
  ) : (
    <StackedSections sections={sections} />
  );
};

export default DashboardSections;

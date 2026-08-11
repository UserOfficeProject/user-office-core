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

const NAV_HEIGHT = 60;

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
      {/* Clears the fixed nav so the last card is never behind it. */}
      <Box sx={{ paddingBottom: `${NAV_HEIGHT}px` }}>
        {sections.map((section) => (
          <Box
            key={section.id}
            hidden={section.id !== current}
            sx={{ display: section.id === current ? 'block' : 'none' }}
          >
            <Panel>{section.render({ canHideWhenEmpty: false })}</Panel>
          </Box>
        ))}
      </Box>
      <MuiPaper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <BottomNavigation
          value={current}
          onChange={(_event, section) => setCurrent(section)}
          showLabels
          sx={{ height: NAV_HEIGHT }}
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

type DashboardSectionsProps = {
  sections: DashboardSection[];
  /**
   * Supplementary content. A trailing tab when tabbed, a leading panel when
   * stacked. Kept out of `sections` so it cannot decide whether tabs appear.
   */
  infoSection?: DashboardSection | null;
};

const DashboardSections = ({
  sections,
  infoSection,
}: DashboardSectionsProps) => {
  const isMobile = useIsMobile();

  return isMobile && sections.length > 1 ? (
    <TabbedSections
      sections={infoSection ? [...sections, infoSection] : sections}
    />
  ) : (
    <StackedSections
      sections={infoSection ? [infoSection, ...sections] : sections}
    />
  );
};

export default DashboardSections;

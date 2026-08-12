import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import MuiPaper from '@mui/material/Paper';
import React, { useEffect, useState } from 'react';

import { useIsMobile } from 'hooks/common/useResponsive';
import { StyledPaper } from 'styles/StyledComponents';

export type DashboardSection = {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  render: (options: { canHideWhenEmpty: boolean }) => React.ReactNode;
};

const NAV_HEIGHT = 60;

const SECTION_STORAGE_KEY = 'dashboardSection';

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

const TabbedSections = ({
  sections,
  current,
  onChange,
}: {
  sections: DashboardSection[];
  current: string;
  onChange: (id: string) => void;
}) => {
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
          onChange={(_event, section) => onChange(section)}
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
  // Held here rather than in TabbedSections, which is unmounted whenever the
  // layout crosses the breakpoint. Persisted so a reload keeps the section too.
  const [storedSection, setStoredSection] = useState(
    () => localStorage.getItem(SECTION_STORAGE_KEY) ?? ''
  );

  const tabbedSections = infoSection ? [...sections, infoSection] : sections;
  // The stored id can name a section this role or feature set no longer has.
  const current = tabbedSections.some(({ id }) => id === storedSection)
    ? storedSection
    : tabbedSections[0]?.id ?? '';

  // Drop a stored id that no longer names a section, so it cannot come back if
  // that section reappears later.
  useEffect(() => {
    if (storedSection && storedSection !== current) {
      localStorage.removeItem(SECTION_STORAGE_KEY);
      setStoredSection('');
    }
  }, [storedSection, current]);

  const selectSection = (id: string) => {
    localStorage.setItem(SECTION_STORAGE_KEY, id);
    setStoredSection(id);
  };

  return isMobile && sections.length > 1 ? (
    <TabbedSections
      sections={tabbedSections}
      current={current}
      onChange={selectSection}
    />
  ) : (
    <StackedSections
      sections={infoSection ? [infoSection, ...sections] : sections}
    />
  );
};

export default DashboardSections;

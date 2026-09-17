import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef, useState } from 'react';

import { minTouchTarget } from 'hooks/common/useResponsive';

type WizardStepBarProps = {
  stepIndex: number;
  stepCount: number;
  title: string;
  onOpenNavigator: () => void;
  navigatorOpen?: boolean;
  /** Accepts a responsive object, e.g. `toolbarHeight(theme)`. */
  stickyTop?: number | string | Record<string, number | string>;
};

export default function WizardStepBar({
  stepIndex,
  stepCount,
  title,
  onOpenNavigator,
  navigatorOpen = false,
  stickyTop = 0,
}: WizardStepBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const bar = barRef.current;
    const sentinel = sentinelRef.current;

    if (!bar || !sentinel) {
      return;
    }

    let observer: IntersectionObserver | undefined;

    // The sentinel only clears the viewport once it has passed the sticky
    // offset, so without the matching rootMargin the shadow arrives that many
    // pixels late. Read it off the element, since `top` may be responsive.
    const observe = () => {
      observer?.disconnect();
      const offset = parseFloat(window.getComputedStyle(bar).top) || 0;
      observer = new IntersectionObserver(
        ([entry]) => setScrolled(!entry.isIntersecting),
        { rootMargin: `-${offset}px 0px 0px 0px` }
      );
      observer.observe(sentinel);
    };

    observe();
    window.addEventListener('resize', observe);

    return () => {
      window.removeEventListener('resize', observe);
      observer?.disconnect();
    };
  }, []);

  if (stepCount < 2) {
    return null;
  }

  return (
    <>
      <Box ref={sentinelRef} aria-hidden sx={{ height: '1px' }} />
      <Box
        ref={barRef}
        data-cy="wizard-step-bar"
        sx={(theme) => ({
          position: 'sticky',
          top: stickyTop,
          zIndex: theme.zIndex.appBar - 1,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1.5,
          minHeight: 52,
          paddingTop: 0.75,
          paddingBottom: 0.5,
          paddingX: 2,
          backgroundColor: 'background.paper',
          boxShadow: scrolled ? '0 2px 4px rgba(0,0,0,.12)' : 'none',
          // Inset to the content gutter so the rule lines up with the fields
          // and the action bar rather than running the full bleed.
          '&::after': {
            content: '""',
            position: 'absolute',
            left: theme.spacing(2),
            right: theme.spacing(2),
            bottom: 0,
            borderBottom: `1px solid ${theme.palette.divider}`,
            opacity: scrolled ? 0 : 1,
          },
        })}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: 11,
              lineHeight: 1.2,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'primary.main',
            }}
          >
            {`Step ${stepIndex + 1} of ${stepCount}`}
          </Typography>
          <Typography
            noWrap
            sx={{ fontWeight: 500, fontSize: 14, lineHeight: 1.35 }}
          >
            {title}
          </Typography>
        </Box>
        <Button
          variant="quiet"
          onClick={onOpenNavigator}
          aria-haspopup="dialog"
          aria-expanded={navigatorOpen}
          endIcon={navigatorOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          data-cy="wizard-step-bar-navigator"
          sx={(theme) => ({
            flexShrink: 0,
            minHeight: minTouchTarget(theme),
            paddingX: 1.25,
            borderRadius: 1,
            fontWeight: 500,
            fontSize: 13,
            lineHeight: 1,
            letterSpacing: '.02em',
          })}
        >
          Steps
        </Button>
      </Box>
    </>
  );
}

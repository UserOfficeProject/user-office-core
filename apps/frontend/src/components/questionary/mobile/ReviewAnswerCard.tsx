import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { TableRowData } from '../QuestionaryDetails';

const LABEL_SX = { fontSize: 13, lineHeight: 1.4, color: 'text.secondary' };

const VALUE_SX = {
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 1.4,
  overflowWrap: 'anywhere',
};

const EMPTY_SX = { fontSize: 15, lineHeight: 1.4, color: 'text.disabled' };

/**
 * A rendered element counts as answered even when it looks empty, because we
 * cannot see inside it. Renderers signal "no answer" by returning null.
 */
const isEmpty = (value: React.ReactNode) =>
  React.isValidElement(value)
    ? false
    : value === null || value === undefined || value === '';

const readCollapsed = (key: string | undefined) => {
  if (!key) {
    return false;
  }

  try {
    return sessionStorage.getItem(key) === 'collapsed';
  } catch {
    return false;
  }
};

type ReviewAnswerCardProps = {
  title: string;
  rows: TableRowData[];
  onEdit?: () => void;
  /** Enables remembering the collapsed state for the session. */
  storageKey?: string;
};

export default function ReviewAnswerCard({
  title,
  rows,
  onEdit,
  storageKey,
}: ReviewAnswerCardProps) {
  const [expanded, setExpanded] = useState(() => !readCollapsed(storageKey));

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);

    if (storageKey) {
      try {
        sessionStorage.setItem(storageKey, next ? 'expanded' : 'collapsed');
      } catch {
        // A blocked or full store only costs us the memory of the toggle.
      }
    }
  };

  return (
    <Box
      data-cy="review-answer-card"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: onEdit ? '13px' : '16px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          ...(onEdit && { minHeight: 44 }),
        }}
      >
        <ButtonBase
          onClick={toggle}
          aria-expanded={expanded}
          data-cy="review-answer-card-toggle"
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'left',
          }}
        >
          <Typography
            sx={{
              flex: 1,
              minWidth: 0,
              fontWeight: 500,
              fontSize: 14,
              lineHeight: 1.35,
            }}
          >
            {title}
          </Typography>
          {!expanded && (
            <Typography
              sx={{ fontSize: 13, lineHeight: 1, color: 'rgba(0,0,0,.45)' }}
            >
              {rows.length === 1 ? '1 answer' : `${rows.length} answers`}
            </Typography>
          )}
          {expanded ? (
            <ExpandLessIcon sx={{ fontSize: 20, color: 'action.active' }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 20, color: 'action.active' }} />
          )}
        </ButtonBase>
        {onEdit && (
          <Button
            variant="text"
            color="primary"
            onClick={onEdit}
            data-cy="review-answer-card-edit"
            sx={{
              flexShrink: 0,
              position: 'relative',
              height: 30,
              minWidth: 0,
              paddingX: 1,
              marginRight: -1,
              fontWeight: 500,
              fontSize: 13,
              lineHeight: 1,
              letterSpacing: '.03em',
              // Deliberately 30px tall, so the 44px target is hit area only.
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: '-7px -8px',
              },
            }}
          >
            Edit
          </Button>
        )}
      </Box>
      {expanded &&
        rows.map((row, index) => (
          <Box
            key={index}
            sx={{
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            <Typography component="div" sx={LABEL_SX}>
              {row.label}
            </Typography>
            {isEmpty(row.value) ? (
              <Typography component="div" sx={EMPTY_SX}>
                —
              </Typography>
            ) : (
              <Typography component="div" sx={VALUE_SX}>
                {row.value}
              </Typography>
            )}
          </Box>
        ))}
    </Box>
  );
}

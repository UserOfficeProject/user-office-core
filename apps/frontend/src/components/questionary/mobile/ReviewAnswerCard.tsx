import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import { minTouchTarget } from 'hooks/common/useResponsive';

import { TableRowData } from '../QuestionaryDetails';

const ROW_SX = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
} as const;

const LABEL_SX = { fontSize: 13, lineHeight: 1.4, color: 'text.secondary' };

// `anywhere` so a value that is one unbroken token cannot widen the card.
const VALUE_SX = { fontSize: 14, lineHeight: 1.4, overflowWrap: 'anywhere' };

type ReviewAnswerCardProps = {
  title: string;
  rows: TableRowData[];
  onEdit?: () => void;
};

export default function ReviewAnswerCard({
  title,
  rows,
  onEdit,
}: ReviewAnswerCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box
      data-cy="review-answer-card"
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 4,
        backgroundColor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '8px 8px 8px 16px',
          ...(expanded && { borderBottom: 1, borderColor: 'divider' }),
        }}
      >
        <ButtonBase
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          data-cy="review-answer-card-toggle"
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textAlign: 'left',
          }}
        >
          <Typography
            sx={{
              flex: 1,
              fontWeight: 500,
              fontSize: 14,
              lineHeight: 1.35,
            }}
          >
            {title}
          </Typography>
          {!expanded && (
            <Typography
              sx={{ fontSize: 13, lineHeight: 1.35, color: 'text.secondary' }}
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
        {expanded && onEdit && (
          <Button
            variant="quiet"
            onClick={onEdit}
            startIcon={<EditIcon sx={{ fontSize: 18 }} />}
            data-cy="review-answer-card-edit"
            sx={(theme) => ({
              flexShrink: 0,
              minHeight: minTouchTarget(theme),
              paddingX: 1.5,
              borderRadius: 1,
              fontWeight: 500,
              fontSize: 13,
              lineHeight: 1,
              letterSpacing: '.02em',
            })}
          >
            Edit
          </Button>
        )}
      </Box>
      {expanded && (
        <Box
          sx={{
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {rows.map((row, index) => (
            <Box key={index} sx={ROW_SX}>
              <Typography component="div" sx={LABEL_SX}>
                {row.label}
              </Typography>
              <Typography component="div" sx={VALUE_SX}>
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

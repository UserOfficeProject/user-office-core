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

type ReviewAnswerCardProps = {
  title: string;
  rows: TableRowData[];
  /** Omitted where the step cannot be edited, which also loosens the rows. */
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
            // A two-column grid sizes its label column to the longest label,
            // and questionary labels are whole questions, so the value column
            // collapsed to a few characters wide. Stack them instead.
            gap: onEdit ? '10px' : '14px',
          }}
        >
          {rows.map((row, index) => (
            <Box
              key={index}
              sx={{
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <Typography
                component="div"
                sx={{ fontSize: 13, lineHeight: 1.4, color: 'text.secondary' }}
              >
                {row.label}
              </Typography>
              <Typography
                component="div"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.4,
                  // An answer can be one unbroken token, such as a sample name,
                  // which would otherwise push the card sideways.
                  overflowWrap: 'anywhere',
                }}
              >
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

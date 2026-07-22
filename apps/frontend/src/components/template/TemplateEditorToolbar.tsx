import Preview from '@mui/icons-material/Preview';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

interface TemplateEditorToolbarProps {
  stepCount: number;
  isTopicReorderMode: boolean;
  onToggleReorderMode: () => void;
  onPreview: () => void;
}

export function TemplateEditorToolbar({
  stepCount,
  isTopicReorderMode,
  onToggleReorderMode,
  onPreview,
}: TemplateEditorToolbarProps) {
  return (
    <FormGroup
      row
      style={{ justifyContent: 'flex-end', paddingBottom: '25px' }}
    >
      {stepCount > 1 && (
        <FormControlLabel
          control={
            <Switch
              checked={isTopicReorderMode}
              onChange={onToggleReorderMode}
            />
          }
          label="Reorder topics mode"
        />
      )}
      <Tooltip title="Preview questionary">
        <IconButton onClick={onPreview} data-cy="preview-questionary-template">
          <Preview />
        </IconButton>
      </Tooltip>
    </FormGroup>
  );
}

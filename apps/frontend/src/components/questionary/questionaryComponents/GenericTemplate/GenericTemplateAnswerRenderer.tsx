import { DialogActions, DialogContent } from '@mui/material';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import React, { useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';
import GenericTemplateDetails from 'components/genericTemplate/GenericTemplateDetails';
import { Answer } from 'generated/sdk';
import { useGenericTemplatesWithQuestionaryStatus } from 'hooks/genericTemplate/useGenericTemplatesWithQuestionaryStatus';
import { GenericTemplateCore } from 'models/questionary/genericTemplate/GenericTemplateCore';

function GenericTemplateList(props: {
  genericTemplates: GenericTemplateCore[];
  onClick?: (genericTemplate: GenericTemplateCore) => void;
}) {
  const genericTemplateLink = (genericTemplate: GenericTemplateCore) => (
    <Link href="#" onClick={() => props.onClick?.(genericTemplate)}>
      {genericTemplate.title}
    </Link>
  );

  return (
    <List
      sx={(theme) => ({
        padding: 0,
        margin: 0,
        '& li': {
          display: 'block',
          marginRight: theme.spacing(1),
        },
      })}
    >
      {props.genericTemplates.map((genericTemplate) => (
        <ListItem key={`genericTemplate-${genericTemplate.id}`}>
          {genericTemplateLink(genericTemplate)}
        </ListItem>
      ))}
    </List>
  );
}

interface GenericTemplatesAnswerRendererProps {
  proposalPk: number;
  answer: Answer;
}

const GenericTemplatesAnswerRenderer = ({
  proposalPk,
  answer,
}: GenericTemplatesAnswerRendererProps) => {
  const [selectedGenericTemplateId, setSelectedGenericTemplateId] = useState<
    number | null
  >(null);

  const { genericTemplates } = useGenericTemplatesWithQuestionaryStatus({
    proposalPk: proposalPk,
    questionId: answer.question.id,
  });

  return (
    <div>
      <GenericTemplateList
        genericTemplates={genericTemplates}
        onClick={(genericTemplate) =>
          setSelectedGenericTemplateId(genericTemplate.id)
        }
      />
      <StyledDialog
        maxWidth="md"
        fullWidth
        open={selectedGenericTemplateId !== null}
        onClose={() => setSelectedGenericTemplateId(null)}
        title="GenericTemplate details"
      >
        <DialogContent dividers>
          {selectedGenericTemplateId ? (
            <GenericTemplateDetails
              genericTemplateId={selectedGenericTemplateId}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setSelectedGenericTemplateId(null)}
            data-cy="close-genericTemplate-dialog"
          >
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
    </div>
  );
};

export default GenericTemplatesAnswerRenderer;

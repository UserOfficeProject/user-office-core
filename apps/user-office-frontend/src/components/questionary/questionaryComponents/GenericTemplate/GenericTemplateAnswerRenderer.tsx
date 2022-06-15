import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import makeStyles from '@mui/styles/makeStyles';
import React, { useState } from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import GenericTemplateDetails from 'components/genericTemplate/GenericTemplateDetails';
import { Answer } from 'generated/sdk';
import { useGenericTemplatesWithQuestionaryStatus } from 'hooks/genericTemplate/useGenericTemplatesWithQuestionaryStatus';
import { GenericTemplateCore } from 'models/questionary/genericTemplate/GenericTemplateCore';

const useStyles = makeStyles((theme) => ({
  list: {
    padding: 0,
    margin: 0,
    '& li': {
      display: 'block',
      marginRight: theme.spacing(1),
    },
  },
}));

function GenericTemplateList(props: {
  genericTemplates: GenericTemplateCore[];
  onClick?: (genericTemplate: GenericTemplateCore) => void;
}) {
  const classes = useStyles();

  const genericTemplateLink = (genericTemplate: GenericTemplateCore) => (
    <Link href="#" onClick={() => props.onClick?.(genericTemplate)}>
      {genericTemplate.title}
    </Link>
  );

  return (
    <ul className={classes.list}>
      {props.genericTemplates.map((genericTemplate) => (
        <li key={`genericTemplate-${genericTemplate.id}`}>
          {genericTemplateLink(genericTemplate)}
        </li>
      ))}
    </ul>
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
      <InputDialog
        maxWidth="sm"
        open={selectedGenericTemplateId !== null}
        onClose={() => setSelectedGenericTemplateId(null)}
      >
        {selectedGenericTemplateId ? (
          <GenericTemplateDetails
            genericTemplateId={selectedGenericTemplateId}
          />
        ) : null}
        <ActionButtonContainer>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setSelectedGenericTemplateId(null)}
            data-cy="close-genericTemplate-dialog"
          >
            Close
          </Button>
        </ActionButtonContainer>
      </InputDialog>
    </div>
  );
};

export default GenericTemplatesAnswerRenderer;

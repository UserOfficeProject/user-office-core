import React from 'react';

import QuestionaryDetails, {
  TableRowData,
} from 'components/questionary/QuestionaryDetails';
import { useGenericTemplate } from 'hooks/genericTemplate/useGenericTemplate';

interface GenericTemplateDetailsProps {
  genericTemplateId: number;
}
function GenericTemplateDetails(props: GenericTemplateDetailsProps) {
  const { genericTemplate } = useGenericTemplate(props.genericTemplateId);

  if (!genericTemplate) {
    return <span>loading...</span>;
  }
  const additionalDetails: TableRowData[] = [
    {
      label: 'Title',
      value: genericTemplate.title,
    },
  ];

  return (
    <>
      <QuestionaryDetails
        questionaryId={genericTemplate.questionaryId}
        additionalDetails={additionalDetails}
        title="GenericTemplate information"
      />
    </>
  );
}

export default GenericTemplateDetails;

import { t } from 'i18next';
import React, { useState } from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { PageName, UserRole } from 'generated/sdk';
import { useTechniqueProposalAccess } from 'hooks/common/useTechniqueProposalAccess';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PageInputBox from './PageInputBox';
import TagFilter from './TagFilter';
import { useSearchParams } from 'react-router-dom';

export type TagFilter = {
    tagId: number | undefined
  }

export default function PageEditor() {
  const isTechniqueProposalsEnabled = useTechniqueProposalAccess([
    UserRole.USER_OFFICER,
  ]);
  const [searchParams] = useSearchParams();
  const tagId = searchParams.get('tag');

  const [tagIdFilter, setTagIdFilter] = React.useState<TagFilter>({
    tagId: tagId ? +tagId : undefined,
  })

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper>
        <SimpleTabs
          tabNames={[
            'User',
            'Reviewer',
            'Help',
            'Privacy',
            'Cookie',
            'Footer',
            'Login',
            'Grade guide',
            ...(isTechniqueProposalsEnabled
              ? [`${t('Technique Proposals')}`]
              : []),
          ]}
        >
          <PageInputBox
            pageName={PageName.HOMEPAGE}
            heading={'Set user homepage'}
            tagFilter={tagIdFilter}
          />
          <PageInputBox
            pageName={PageName.REVIEWPAGE}
            heading={'Set reviewer homepage'}
            tagFilter={tagIdFilter}
          />
          <PageInputBox
            pageName={PageName.HELPPAGE}
            heading={'Set help page'}
            tagFilter={tagIdFilter}
          />
          <PageInputBox
            pageName={PageName.PRIVACYPAGE}
            heading={'Set privacy agreement'}
            tagFilter={tagIdFilter}
          />
          <PageInputBox
            pageName={PageName.COOKIEPAGE}
            heading={'Set cookie policy'}
            tagFilter={tagIdFilter}
          />
          <PageInputBox
            pageName={PageName.FOOTERCONTENT}
            heading={'Set footer content'}
            tagFilter={tagIdFilter}
          />
          <PageInputBox
            pageName={PageName.LOGINHELPPAGE}
            heading={'Set login help page'}
            tagFilter={tagIdFilter}
          />
          <PageInputBox
            pageName={PageName.GRADEGUIDEPAGE}
            heading={'Set grade guide page'}
            tagFilter={tagIdFilter}
          />
          {isTechniqueProposalsEnabled && (
            <PageInputBox
              pageName={PageName.TECHNIQUEPROPOSALMANAGEMENTPAGE}
              heading={`Set ${t('technique proposals')} management page notice`}
              tagFilter={tagIdFilter}
            />
          )}
        </SimpleTabs>
        <TagFilter
            onChange={
              (tagId) => {
            setTagIdFilter({
              tagId: tagId,
            });
          }}/>
      </StyledPaper>
    </StyledContainer>
  );
}

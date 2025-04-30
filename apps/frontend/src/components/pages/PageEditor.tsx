import { t } from 'i18next';
import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { PageName, UserRole } from 'generated/sdk';
import { useTechniqueProposalAccess } from 'hooks/common/useTechniqueProposalAccess';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PageInputBox from './PageInputBox';

export default function PageEditor() {
  const isTechniqueProposalsEnabled = useTechniqueProposalAccess([
    UserRole.USER_OFFICER,
  ]);

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
          />
          <PageInputBox
            pageName={PageName.REVIEWPAGE}
            heading={'Set reviewer homepage'}
          />
          <PageInputBox
            pageName={PageName.HELPPAGE}
            heading={'Set help page'}
          />
          <PageInputBox
            pageName={PageName.PRIVACYPAGE}
            heading={'Set privacy agreement'}
          />
          <PageInputBox
            pageName={PageName.COOKIEPAGE}
            heading={'Set cookie policy'}
          />
          <PageInputBox
            pageName={PageName.FOOTERCONTENT}
            heading={'Set footer content'}
          />
          <PageInputBox
            pageName={PageName.LOGINHELPPAGE}
            heading={'Set login help page'}
          />
          <PageInputBox
            pageName={PageName.GRADEGUIDEPAGE}
            heading={'Set grade guide page'}
          />
          {isTechniqueProposalsEnabled && (
            <PageInputBox
              pageName={PageName.TECHNIQUEPROPOSALMANAGEMENTPAGE}
              heading={`Set ${t('technique proposals')} management page notice`}
            />
          )}
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}

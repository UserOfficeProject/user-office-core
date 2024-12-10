import React from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { PageName, UserRole } from 'generated/sdk';
import { useXpressAccess } from 'hooks/common/useXpressAccess';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PageInputBox from './PageInputBox';

export default function PageEditor() {
  const isXpressRouteEnabled = useXpressAccess([UserRole.USER_OFFICER]);

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
            ...(isXpressRouteEnabled ? ['Xpress management'] : []),
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
          {isXpressRouteEnabled && (
            <PageInputBox
              pageName={PageName.XPRESSMANAGEMENTPAGE}
              heading={'Set Xpress management page notice'}
            />
          )}
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}

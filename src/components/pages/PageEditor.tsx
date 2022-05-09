import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { PageName } from 'generated/sdk';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PageInputBox from './PageInputBox';

export default function PageEditor() {
  return (
    <StyledContainer>
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
        </SimpleTabs>
      </StyledPaper>
    </StyledContainer>
  );
}

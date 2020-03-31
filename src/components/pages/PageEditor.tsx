import Container from '@material-ui/core/Container';
import React from 'react';

import { PageName } from '../../generated/sdk';
import SimpleTabs from '../common/TabPanel';
import PageInputBox from './PageInputBox';

export default function PageEditor() {
  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={['User', 'Reviewer', 'Help', 'Privacy', 'Cookie']}>
        <PageInputBox
          pageName={PageName.HOMEPAGE}
          heading={'Set user homepage'}
        />
        <PageInputBox
          pageName={PageName.REVIEWPAGE}
          heading={'Set reviewer homepage'}
        />
        <PageInputBox pageName={PageName.HELPPAGE} heading={'Set help page'} />
        <PageInputBox
          pageName={PageName.PRIVACYPAGE}
          heading={'Set privacy agreement'}
        />
        <PageInputBox
          pageName={PageName.COOKIEPAGE}
          heading={'Set cookie policy'}
        />
      </SimpleTabs>
    </Container>
  );
}

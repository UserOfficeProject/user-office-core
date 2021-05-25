import Grid from '@material-ui/core/Grid';
import React from 'react';

import SimpleTabs from 'components/common/TabPanel';
import { PageName } from 'generated/sdk';
import { ContentContainer } from 'styles/StyledComponents';

import PageInputBox from './PageInputBox';

export default function PageEditor() {
  return (
    <ContentContainer>
      <Grid container>
        <Grid item xs={12}>
          <SimpleTabs
            tabNames={['User', 'Reviewer', 'Help', 'Privacy', 'Cookie']}
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
          </SimpleTabs>
        </Grid>
      </Grid>
    </ContentContainer>
  );
}

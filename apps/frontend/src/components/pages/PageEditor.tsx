import { t } from 'i18next';
import React, { useState } from 'react';

import SimpleTabs from 'components/common/SimpleTabs';
import { PageName, UserRole } from 'generated/sdk';
import { useTechniqueProposalAccess } from 'hooks/common/useTechniqueProposalAccess';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PageInputBox from './PageInputBox';
import RoleFilter from './RoleFilter';
import { useSearchParams } from 'react-router-dom';

export type RoleFilter = {
    roleId: number | undefined
  }

export default function PageEditor() {
  const isTechniqueProposalsEnabled = useTechniqueProposalAccess([
    UserRole.USER_OFFICER,
  ]);
  const [searchParams] = useSearchParams();
  const roleId = searchParams.get('role');

  const [roleIdFilter, setroleIdFilter] = React.useState<RoleFilter>({
    roleId: roleId ? +roleId : undefined,
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
            roleFilter={roleIdFilter}
          />
          <PageInputBox
            pageName={PageName.REVIEWPAGE}
            heading={'Set reviewer homepage'}
            roleFilter={roleIdFilter}
          />
          <PageInputBox
            pageName={PageName.HELPPAGE}
            heading={'Set help page'}
            roleFilter={roleIdFilter}
          />
          <PageInputBox
            pageName={PageName.PRIVACYPAGE}
            heading={'Set privacy agreement'}
            roleFilter={roleIdFilter}
          />
          <PageInputBox
            pageName={PageName.COOKIEPAGE}
            heading={'Set cookie policy'}
            roleFilter={roleIdFilter}
          />
          <PageInputBox
            pageName={PageName.FOOTERCONTENT}
            heading={'Set footer content'}
            roleFilter={roleIdFilter}
          />
          <PageInputBox
            pageName={PageName.LOGINHELPPAGE}
            heading={'Set login help page'}
            roleFilter={roleIdFilter}
          />
          <PageInputBox
            pageName={PageName.GRADEGUIDEPAGE}
            heading={'Set grade guide page'}
            roleFilter={roleIdFilter}
          />
          {isTechniqueProposalsEnabled && (
            <PageInputBox
              pageName={PageName.TECHNIQUEPROPOSALMANAGEMENTPAGE}
              heading={`Set ${t('technique proposals')} management page notice`}
              roleFilter={roleIdFilter}
            />
          )}
        </SimpleTabs>
        <roleFilter
            onChange={
              (roleId) => {
            setRoleIdFilter({
              roleId: roleId,
            });
          }}/>
      </StyledPaper>
    </StyledContainer>
  );
}

import { t } from 'i18next';
import React, { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import SimpleTabs from 'components/common/SimpleTabs';
import { UserContext } from 'context/UserContextProvider';
import { PageName, UserRole } from 'generated/sdk';
import { useTechniqueProposalAccess } from 'hooks/common/useTechniqueProposalAccess';
import { useRolesData } from 'hooks/user/useRolesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PageInputBox from './PageInputBox';
import RoleFilter from './RoleFilter';

export default function PageEditor() {
  const isTechniqueProposalsEnabled = useTechniqueProposalAccess([
    UserRole.USER_OFFICER,
  ]);
  const [searchParams] = useSearchParams();
  const roleIdQueryParam = searchParams.get('roles');
  const { roles, currentRoleId } = useContext(UserContext);
  const isBaseUserOfficer = roles.some(
    (r) =>
      r.id == currentRoleId && r.shortCode == 'user_officer' && r.isRootRole
  );
  const currentRoleTags = roles
    .find((r) => currentRoleId === r.id)!
    .tags?.map((t) => t.id);
  const { rolesData, loading } = useRolesData(currentRoleTags);

  const [roleIds, setRoleIds] = React.useState<number[]>(
    roleIdQueryParam
      ? roleIdQueryParam
          .split(',')
          .map(Number)
          .filter((id) => !isNaN(id))
      : []
  );

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
            roleIds={roleIds}
          />
          <PageInputBox
            pageName={PageName.REVIEWPAGE}
            heading={'Set reviewer homepage'}
            roleIds={roleIds}
          />
          <PageInputBox
            pageName={PageName.HELPPAGE}
            heading={'Set help page'}
            roleIds={roleIds}
          />
          <PageInputBox
            pageName={PageName.PRIVACYPAGE}
            heading={'Set privacy agreement'}
            roleIds={roleIds}
          />
          <PageInputBox
            pageName={PageName.COOKIEPAGE}
            heading={'Set cookie policy'}
            roleIds={roleIds}
          />
          <PageInputBox
            pageName={PageName.FOOTERCONTENT}
            heading={'Set footer content'}
            roleIds={roleIds}
          />
          <PageInputBox
            pageName={PageName.LOGINHELPPAGE}
            heading={'Set login help page'}
            roleIds={roleIds}
          />
          <PageInputBox
            pageName={PageName.GRADEGUIDEPAGE}
            heading={'Set grade guide page'}
            roleIds={roleIds}
          />
          {isTechniqueProposalsEnabled && (
            <PageInputBox
              pageName={PageName.TECHNIQUEPROPOSALMANAGEMENTPAGE}
              heading={`Set ${t('technique proposals')} management page notice`}
              roleIds={roleIds}
            />
          )}
        </SimpleTabs>
        <RoleFilter
          roleIds={roleIds}
          roles={rolesData ?? undefined}
          isLoading={loading}
          userIsBaseOfficer={isBaseUserOfficer}
          onChange={(roleIds) => {
            setRoleIds(roleIds);
          }}
        />
      </StyledPaper>
    </StyledContainer>
  );
}

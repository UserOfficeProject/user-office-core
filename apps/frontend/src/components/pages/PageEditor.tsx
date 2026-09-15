import { t } from 'i18next';
import React, { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import SimpleTabs from 'components/common/SimpleTabs';
import { UserContext } from 'context/UserContextProvider';
import { PageName, UserRole, GetRolesQuery } from 'generated/sdk';
import { useTechniqueProposalAccess } from 'hooks/common/useTechniqueProposalAccess';
import { useRolesData } from 'hooks/user/useRolesData';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

import PageInputBox from './PageInputBox';
import RoleFilter from './RoleFilter';

export type RoleFilterArgs = {
  roleId: number | undefined;
  rolesData: GetRolesQuery | null;
  loading: boolean;
};

export default function PageEditor() {
  const isTechniqueProposalsEnabled = useTechniqueProposalAccess([
    UserRole.USER_OFFICER,
  ]);
  const [searchParams] = useSearchParams();
  const roleIdQueryParam = searchParams.get('role');
  const { roles, currentRoleId } = useContext(UserContext);
  const isBaseUserOfficer =
    roles.filter(
      (r) =>
        r.id == currentRoleId &&
        r.shortCode == 'user_officer' &&
        (!r.tags || !r.tags.length)
    ).length > 0;
  const currentRoleTags = roles
    .find((r) => currentRoleId === r.id)!
    .tags?.map((t) => t.id);
  const { rolesData, loading } = useRolesData(currentRoleTags);

  const [roleId, setRoleId] = React.useState<number | undefined>(
    roleIdQueryParam
      ? +roleIdQueryParam
      : isBaseUserOfficer
        ? undefined
        : currentRoleId
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
            roleId={roleId}
          />
          <PageInputBox
            pageName={PageName.REVIEWPAGE}
            heading={'Set reviewer homepage'}
            roleId={roleId}
          />
          <PageInputBox
            pageName={PageName.HELPPAGE}
            heading={'Set help page'}
            roleId={roleId}
          />
          <PageInputBox
            pageName={PageName.PRIVACYPAGE}
            heading={'Set privacy agreement'}
            roleId={roleId}
          />
          <PageInputBox
            pageName={PageName.COOKIEPAGE}
            heading={'Set cookie policy'}
            roleId={roleId}
          />
          <PageInputBox
            pageName={PageName.FOOTERCONTENT}
            heading={'Set footer content'}
            roleId={roleId}
          />
          <PageInputBox
            pageName={PageName.LOGINHELPPAGE}
            heading={'Set login help page'}
            roleId={roleId}
          />
          <PageInputBox
            pageName={PageName.GRADEGUIDEPAGE}
            heading={'Set grade guide page'}
            roleId={roleId}
          />
          {isTechniqueProposalsEnabled && (
            <PageInputBox
              pageName={PageName.TECHNIQUEPROPOSALMANAGEMENTPAGE}
              heading={`Set ${t('technique proposals')} management page notice`}
              roleId={roleId}
            />
          )}
        </SimpleTabs>
        <RoleFilter
          roleId={roleId}
          roles={rolesData ?? undefined}
          isLoading={loading}
          userIsBaseOfficer={isBaseUserOfficer}
          currentRoleId={currentRoleId}
          onChange={(roleId) => {
            setRoleId(roleId);
          }}
        />
      </StyledPaper>
    </StyledContainer>
  );
}

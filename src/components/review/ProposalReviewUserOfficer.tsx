import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import { useCheckAccess } from 'components/common/Can';
import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import EventLogList from 'components/eventLog/EventLogList';
import GeneralInformation from 'components/proposal/GeneralInformation';
import ProposalAdmin, {
  AdministrationFormData,
} from 'components/proposal/ProposalAdmin';
import {
  CoreTechnicalReviewFragment,
  Proposal,
  TechnicalReview,
  UserRole,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import ProposalTechnicalReview from './ProposalTechnicalReview';

const ProposalReviewPropTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

type ProposalReviewProps = PropTypes.InferProps<typeof ProposalReviewPropTypes>;

const ProposalReview: React.FC<ProposalReviewProps> = ({ match }) => {
  const [techReview, setTechReview] = useState<
    CoreTechnicalReviewFragment | null | undefined
  >(null);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const api = useDataApi();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const loadProposal = useCallback(async () => {
    return api()
      .getProposal({ id: parseInt(match.params.id) })
      .then((data) => {
        setProposal(data.proposal as Proposal);
        if (data.proposal) {
          setTechReview(data.proposal.technicalReview);
        }
      });
  }, [api, match.params.id]);

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  if (!proposal) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const tabNames = ['General', 'Technical'];

  if (isUserOfficer) {
    tabNames.push('Admin');
    tabNames.push('Logs');
  }

  return (
    <Container maxWidth="lg">
      <SimpleTabs tabNames={tabNames}>
        <GeneralInformation
          data={proposal}
          onProposalChanged={(newProposal): void => setProposal(newProposal)}
        />
        <ProposalTechnicalReview
          id={proposal.id}
          data={proposal.technicalReview}
          setReview={(data: CoreTechnicalReviewFragment | null | undefined) =>
            setProposal({
              ...proposal,
              technicalReview: {
                ...proposal.technicalReview,
                ...data,
              } as TechnicalReview,
            })
          }
        />
        {isUserOfficer && (
          <ProposalAdmin
            data={proposal}
            setAdministration={(data: AdministrationFormData) =>
              setProposal({ ...proposal, ...data })
            }
          />
        )}
        {isUserOfficer && (
          <EventLogList changedObjectId={proposal.id} eventType="PROPOSAL" />
        )}
      </SimpleTabs>
    </Container>
  );
};

ProposalReview.propTypes = ProposalReviewPropTypes;

export default ProposalReview;

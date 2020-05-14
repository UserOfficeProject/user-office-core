import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';

import { SepMember } from '../../generated/sdk';
import { useSEPMembersData } from '../../hooks/useSEPMembersData';
import { BasicUserDetails } from '../../models/User';
import FormikDropdown from '../common/FormikDropdown';
import { AssignSEPMemberToProposalValidationSchema } from './SEPValidationSchema';

const useStyles = makeStyles(theme => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type AssignSEPMemberToProposalProps = {
  close: () => void;
  sepId: number;
  assignMemberToSEPProposal: (user: BasicUserDetails) => void;
  assignedMember?: number | null;
};

const AssignSEPMemberToProposal: React.FC<AssignSEPMemberToProposalProps> = ({
  close,
  assignMemberToSEPProposal,
  sepId,
  assignedMember,
}) => {
  const classes = useStyles();
  const { loadingMembers, SEPMembersData } = useSEPMembersData(sepId, false);

  if (loadingMembers || !SEPMembersData) {
    return <div>Loading...</div>;
  }

  const memberFullNameAndRole = (member: SepMember) =>
    `${member.user.firstname} ${member.user.lastname} - ${
      member.roles.find(role => role.id === member.roleId)?.title
    }`;

  const memberSelectionOptions = SEPMembersData.map(member => ({
    value: member.userId.toString(),
    text: memberFullNameAndRole(member as SepMember),
  }));

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          selectedMemberId: assignedMember ? assignedMember.toString() : '',
        }}
        onSubmit={async (values, actions): Promise<void> => {
          actions.setSubmitting(false);
          const selectedUser = SEPMembersData.find(
            member => member.userId === +values.selectedMemberId
          );
          assignMemberToSEPProposal(selectedUser?.user as BasicUserDetails);
          close();
        }}
        validationSchema={AssignSEPMemberToProposalValidationSchema}
      >
        {({ isSubmitting }): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              Assign SEP member to proposal
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormikDropdown
                  name="selectedMemberId"
                  label="Select member"
                  items={memberSelectionOptions}
                  required
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={isSubmitting}
              data-cy="submit"
            >
              Assign to proposal
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

AssignSEPMemberToProposal.propTypes = {
  close: PropTypes.func.isRequired,
  assignMemberToSEPProposal: PropTypes.func.isRequired,
  sepId: PropTypes.number.isRequired,
  assignedMember: PropTypes.number,
};

export default AssignSEPMemberToProposal;

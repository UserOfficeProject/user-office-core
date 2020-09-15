import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import {
  createProposalStatusValidationSchema,
  updateProposalStatusValidationSchema,
} from '@esss-swap/duo-validation/lib/ProposalStatuses';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import UOLoader from 'components/common/UOLoader';
import { ProposalStatus } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

const useStyles = makeStyles(theme => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type CreateUpdateProposalStatusProps = {
  close: (proposalStatusAdded: ProposalStatus | null) => void;
  proposalStatus: ProposalStatus | null;
};

const CreateUpdateProposalStatus: React.FC<CreateUpdateProposalStatusProps> = ({
  close,
  proposalStatus,
}) => {
  const classes = useStyles();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const initialValues = proposalStatus
    ? proposalStatus
    : {
        name: '',
        description: '',
      };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, actions): Promise<void> => {
        setSubmitting(true);
        if (proposalStatus) {
          const data = await api().updateProposalStatus({
            id: proposalStatus.id,
            ...values,
          });
          if (data.updateProposalStatus.error) {
            enqueueSnackbar(
              getTranslation(data.updateProposalStatus.error as ResourceId),
              {
                variant: 'error',
              }
            );
            close(null);
          } else if (data.updateProposalStatus.proposalStatus) {
            close(data.updateProposalStatus.proposalStatus);
          }
        } else {
          const data = await api().createProposalStatus(values);
          if (data.createProposalStatus.error) {
            enqueueSnackbar(
              getTranslation(data.createProposalStatus.error as ResourceId),
              {
                variant: 'error',
              }
            );
            close(null);
          } else if (data.createProposalStatus.proposalStatus) {
            close(data.createProposalStatus.proposalStatus);
          }
        }
        setSubmitting(false);
        actions.setSubmitting(false);
      }}
      validationSchema={
        proposalStatus
          ? updateProposalStatusValidationSchema
          : createProposalStatusValidationSchema
      }
    >
      {() => (
        <Form>
          <Typography variant="h6">
            {proposalStatus ? 'Update' : 'Create new'} proposal status
          </Typography>
          <Field
            name="name"
            id="name"
            label="Name"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="name"
            disabled={submitting}
          />
          <Field
            id="description"
            name="description"
            label="Description"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            multiline
            rowsMax="16"
            rows="3"
            data-cy="description"
            disabled={submitting}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            data-cy="submit"
            disabled={submitting}
          >
            {submitting && <UOLoader size={14} />}
            {proposalStatus ? 'Update' : 'Create'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

CreateUpdateProposalStatus.propTypes = {
  proposalStatus: PropTypes.any,
  close: PropTypes.func.isRequired,
};

export default CreateUpdateProposalStatus;

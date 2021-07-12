import { administrationProposalValidationSchema } from '@esss-swap/duo-validation/lib/Proposal';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import { Editor } from '@tinymce/tinymce-react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import { Prompt } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import { UserRole } from 'generated/sdk';
import { ProposalEndStatus } from 'generated/sdk';
import { ProposalData } from 'hooks/proposal/useProposalData';
import { ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export type AdministrationFormData = {
  proposalPk: number;
  commentForUser: string;
  commentForManagement: string;
  finalStatus: ProposalEndStatus;
  managementTimeAllocation?: number;
  managementDecisionSubmitted?: boolean;
};

type ProposalAdminProps = {
  data: ProposalData;
  setAdministration: (data: AdministrationFormData) => void;
};

const ProposalAdmin: React.FC<ProposalAdminProps> = ({
  data,
  setAdministration,
}) => {
  const { api } = useDataApiWithFeedback();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const initialValues = {
    proposalPk: data.primaryKey,
    finalStatus: data.finalStatus || ProposalEndStatus.UNSET,
    commentForUser: data.commentForUser || '',
    commentForManagement: data.commentForManagement || '',
    managementTimeAllocation: data.managementTimeAllocation || '',
    managementDecisionSubmitted: data.managementDecisionSubmitted,
  };

  const PromptIfDirty = () => {
    const formik = useFormikContext();

    return (
      <Prompt
        when={formik.dirty && formik.submitCount === 0}
        message="Changes you recently made in this tab will be lost! Are you sure?"
      />
    );
  };

  const handleProposalAdministration = async (
    administrationValues: AdministrationFormData
  ) => {
    const result = await api('Saved!').administrationProposal(
      administrationValues
    );

    if (!result.administrationProposal.rejection) {
      setAdministration(administrationValues);
    }
  };

  return (
    <>
      <Typography variant="h6" component="h2" gutterBottom>
        Administration
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={administrationProposalValidationSchema}
        onSubmit={async (values): Promise<void> => {
          const administrationValues = {
            proposalPk: data.primaryKey,
            finalStatus:
              ProposalEndStatus[values.finalStatus as ProposalEndStatus],
            commentForUser: values.commentForUser,
            commentForManagement: values.commentForManagement,
            managementTimeAllocation: +values.managementTimeAllocation,
            managementDecisionSubmitted: values.managementDecisionSubmitted,
          };

          await handleProposalAdministration(administrationValues);
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <PromptIfDirty />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormikDropdown
                  name="finalStatus"
                  label="Final status"
                  data-cy="proposalFinalStatus"
                  items={[
                    { text: 'Unset', value: ProposalEndStatus.UNSET },
                    { text: 'Accepted', value: ProposalEndStatus.ACCEPTED },
                    { text: 'Reserved', value: ProposalEndStatus.RESERVED },
                    { text: 'Rejected', value: ProposalEndStatus.REJECTED },
                  ]}
                  required
                  disabled={!isUserOfficer || isSubmitting}
                />
              </Grid>
              <Grid item xs={6}>
                <Field
                  name="managementTimeAllocation"
                  label={`Management time allocation(${data.call?.allocationTimeUnit}s)`}
                  type="number"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="managementTimeAllocation"
                  disabled={!isUserOfficer || isSubmitting}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel htmlFor="commentForUser" shrink margin="dense">
                  Comment for user
                </InputLabel>
                <Editor
                  id="commentForUser"
                  initialValue={initialValues.commentForUser}
                  init={{
                    skin: false,
                    content_css: false,
                    plugins: [
                      'link',
                      'preview',
                      'code',
                      'charmap',
                      'wordcount',
                    ],
                    toolbar: 'bold italic',
                    branding: false,
                  }}
                  onEditorChange={(content: string) =>
                    setFieldValue('commentForUser', content)
                  }
                  disabled={!isUserOfficer || isSubmitting}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel
                  htmlFor="commentForManagement"
                  shrink
                  margin="dense"
                >
                  Comment for management
                </InputLabel>
                <Editor
                  id="commentForManagement"
                  initialValue={initialValues.commentForManagement}
                  init={{
                    skin: false,
                    content_css: false,
                    plugins: [
                      'link',
                      'preview',
                      'code',
                      'charmap',
                      'wordcount',
                    ],
                    toolbar: 'bold italic',
                    branding: false,
                  }}
                  onEditorChange={(content: string) =>
                    setFieldValue('commentForManagement', content)
                  }
                  disabled={!isUserOfficer || isSubmitting}
                />
              </Grid>
              {isUserOfficer && (
                <Grid item xs={12}>
                  <ButtonContainer>
                    <Field
                      id="managementDecisionSubmitted"
                      name="managementDecisionSubmitted"
                      component={FormikUICustomCheckbox}
                      label="Submitted"
                      color="primary"
                      data-cy="is-management-decision-submitted"
                    />
                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      variant="contained"
                      color="primary"
                      data-cy="save-admin-decision"
                    >
                      Save
                    </Button>
                  </ButtonContainer>
                </Grid>
              )}
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ProposalAdmin;

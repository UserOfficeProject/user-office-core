import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Button, MenuItem, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-mui';
import React from 'react';
import * as Yup from 'yup';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';
import { ListShadedItem } from 'components/common/ListShadedItem';
import FormikUIPredefinedMessagesTextField, {
  PredefinedMessageKey,
} from 'components/common/predefinedMessages/FormikUIPredefinedMessagesTextField';
import UOLoader from 'components/common/UOLoader';
import ProposalQuestionaryReview from 'components/review/ProposalQuestionaryReview';
import SampleDetails from 'components/sample/SampleDetails';
import { EsdEvaluation, Maybe } from 'generated/sdk';
import { useEsi } from 'hooks/esi/useEsi';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { EsiRowData } from './ExperimentSafetyPage';

export function EsiSummary(props: { esiId: number }) {
  const { esi } = useEsi(props.esiId);
  const [value, setValue] = React.useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  if (!esi) {
    return <UOLoader />;
  }

  return (
    <>
      <Box>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1 }}>
            <TabList onChange={handleChange} orientation="horizontal">
              <Tab
                label="Proposal"
                value={esi.proposal.proposalId.toString()}
              />
              {esi.proposal.samples?.map((sample) => (
                <Tab
                  label={sample.title}
                  value={sample.id.toString()}
                  key={sample.id}
                />
              ))}
            </TabList>
          </Box>
          <TabPanel
            value={esi.proposal.proposalId.toString()}
            sx={{ paddingLeft: 0, paddingRight: 0 }}
          >
            <Typography variant="h6">Proposal information</Typography>
            <ProposalQuestionaryReview proposalPk={esi.proposal.primaryKey} />
          </TabPanel>
          {esi.proposal.samples?.map((sample) => (
            <TabPanel
              value={sample.id.toString()}
              key={sample.id}
              sx={{ paddingLeft: 0, paddingRight: 0 }}
            >
              <SampleDetails sampleId={sample.id} />
            </TabPanel>
          ))}
        </TabContext>
      </Box>
    </>
  );
}

export function EsiEvaluationDialog(props: {
  esi: EsiRowData;
  onClose: (esi: Maybe<EsiRowData>) => void;
}) {
  const { esi, onClose } = props;
  const { api } = useDataApiWithFeedback();

  const initialValues = {
    evaluation: esi.esd?.evaluation || '',
    comment: esi.esd?.comment || '',
  };

  return (
    <InputDialog
      open={true}
      onClose={() => onClose(null)}
      fullWidth={true}
      maxWidth="md"
    >
      <EsiSummary esiId={esi.id} />

      <Formik
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          evaluation: Yup.string().required('Required'),
        })}
        onSubmit={async (values): Promise<void> => {
          if (esi.esd !== null) {
            const result = await api({
              toastSuccessMessage: `Experiment safety document for '${esi.proposal.title}' updated`,
              toastErrorMessage: `Could not update experiment safety document for '${esi.proposal.title}'`,
            }).updateEsd({
              esdId: esi.esd.id,
              comment: values.comment,
              evaluation: values.evaluation as EsdEvaluation,
            });

            if (result.updateEsd.esd) {
              onClose({
                ...esi,
                esd: { ...esi.esd, ...result.updateEsd.esd },
              });
            }
          } else {
            const result = await api({
              toastSuccessMessage: `Experiment safety document for '${esi.proposal.title}' updated`,
              toastErrorMessage: `Could not create experiment safety document for '${esi.proposal.title}'`,
            }).createEsd({
              esiId: esi.id,
              comment: values.comment,
              evaluation: values.evaluation as EsdEvaluation,
            });

            if (result.createEsd.esd) {
              onClose({
                ...esi,
                esd: { ...result.createEsd.esd },
              });
            }
          }
        }}
      >
        {({ isSubmitting, dirty }) => (
          <Form>
            <Field
              type="text"
              name="evaluation"
              label="Evaluation"
              select
              component={TextField}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{ 'data-cy': 'evaluation' }}
              fullWidth
              required={true}
              disabled={isSubmitting}
            >
              <MenuItem
                key={EsdEvaluation.ACCEPTED}
                value={EsdEvaluation.ACCEPTED}
              >
                <ListShadedItem shade="#88C100" title="Accepted" />
              </MenuItem>

              <MenuItem
                key={EsdEvaluation.REJECTED}
                value={EsdEvaluation.REJECTED}
              >
                <ListShadedItem shade="#FF003C" title="Rejected" />
              </MenuItem>
            </Field>

            <FormikUIPredefinedMessagesTextField
              name="comment"
              id="comment"
              label="Comment"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              autoComplete="off"
              data-cy="comment"
              multiline
              minRows={4}
              maxRows={10}
              disabled={isSubmitting}
              message-key={PredefinedMessageKey.SAFETY_EVAL_COMMENT}
            />

            <ActionButtonContainer>
              <Button type="submit" data-cy="submit" disabled={!dirty}>
                Submit
              </Button>
            </ActionButtonContainer>
          </Form>
        )}
      </Formik>
    </InputDialog>
  );
}

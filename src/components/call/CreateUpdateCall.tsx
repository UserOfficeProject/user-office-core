import DateFnsUtils from '@date-io/date-fns';
import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import {
  createCallValidationSchema,
  updateCallValidationSchema,
} from '@esss-swap/duo-validation';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';
import { Call } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useProposalsTemplates } from '../../hooks/useProposalTemplates';
import FormikDropdown from '../common/FormikDropdown';
import FormikUICustomDatePicker from '../common/FormikUICustomDatePicker';

type CreateUpdateCallProps = {
  close: (call: Call | null) => void;
  call: Call | null;
};

const CreateUpdateCall: React.FC<CreateUpdateCallProps> = ({ call, close }) => {
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const { templates } = useProposalsTemplates(false);
  const currentDay = new Date();

  const initialValues = call
    ? { ...call, templateId: call.templateId || '' }
    : {
        shortCode: '',
        startCall: currentDay,
        endCall: currentDay,
        startReview: currentDay,
        endReview: currentDay,
        startNotify: currentDay,
        endNotify: currentDay,
        cycleComment: '',
        surveyComment: '',
        templateId: '',
      };

  const showNotificationAndClose = (
    error: string | null | undefined,
    callToReturn: Call
  ) => {
    if (error) {
      enqueueSnackbar(getTranslation(error as ResourceId), {
        variant: 'error',
      });
      close(null);
    } else {
      close(callToReturn);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, actions): Promise<void> => {
        const { templateId } = values;

        if (call) {
          await api()
            .updateCall({
              id: call.id,
              ...values,
              templateId: templateId ? +templateId : null,
            })
            .then(data => {
              showNotificationAndClose(
                data.updateCall.error,
                data.updateCall.call as Call
              );
            });
        } else {
          await api()
            .createCall({
              ...values,
              templateId: templateId ? +templateId : null,
            })
            .then(data => {
              showNotificationAndClose(
                data.createCall.error,
                data.createCall.call as Call
              );
            });
        }

        actions.setSubmitting(false);
      }}
      validationSchema={
        call ? updateCallValidationSchema : createCallValidationSchema
      }
    >
      {(): JSX.Element => (
        <Form>
          <Typography variant="h6">Call information</Typography>

          <Field
            name="shortCode"
            label="Short Code"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="short-code"
          />
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Field
              name="startCall"
              label="Start"
              component={FormikUICustomDatePicker}
              margin="normal"
              fullWidth
              data-cy="start-date"
            />

            <Field
              name="endCall"
              label="End"
              component={FormikUICustomDatePicker}
              margin="normal"
              fullWidth
              data-cy="end-date"
            />
            <Field
              name="startReview"
              label="Start of review"
              component={FormikUICustomDatePicker}
              margin="normal"
              fullWidth
              data-cy="start-review"
            />
            <Field
              name="endReview"
              label="End of review"
              component={FormikUICustomDatePicker}
              margin="normal"
              fullWidth
            />
            <Field
              name="startNotify"
              label="Start of notification period"
              component={FormikUICustomDatePicker}
              margin="normal"
              fullWidth
            />
            <Field
              name="endNotify"
              label="End of notification period"
              component={FormikUICustomDatePicker}
              margin="normal"
              fullWidth
            />
          </MuiPickersUtilsProvider>
          <Field
            name="cycleComment"
            label="Cycle comment"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="cycle-comment"
          />
          <Field
            name="surveyComment"
            label="Survey Comment"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="survey-comment"
          />
          {templates.length > 0 && (
            <FormikDropdown
              name="templateId"
              label="Call template"
              items={templates.map(template => ({
                text: template.name,
                value: template.templateId,
              }))}
              data-cy="call-template"
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            data-cy="submit"
          >
            {call ? 'Update' : 'Add'} Call
          </Button>
        </Form>
      )}
    </Formik>
  );
};

CreateUpdateCall.propTypes = {
  close: PropTypes.func.isRequired,
  call: PropTypes.any,
};

export default CreateUpdateCall;

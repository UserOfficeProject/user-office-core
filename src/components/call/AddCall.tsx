import DateFnsUtils from '@date-io/date-fns';
import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { createCallValidationSchema } from '@esss-swap/duo-validation';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React from 'react';
import { useDataApi } from '../../hooks/useDataApi';
import { useProposalsTemplates } from '../../hooks/useProposalTemplates';
import FormikDropdown from '../common/FormikDropdown';
import FormikUICustomDatePicker from '../common/FormikUICustomDatePicker';

const useStyles = makeStyles(theme => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0 12px',
  },
  heading: {
    textAlign: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

type AddCallProps = {
  close: () => void;
};

const AddCall: React.FC<AddCallProps> = props => {
  const classes = useStyles();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const { templates } = useProposalsTemplates(false);
  const currentDay = new Date();

  return (
    <Container component="main" maxWidth="xs">
      <Formik
        initialValues={{
          shortCode: '',
          startCall: currentDay,
          endCall: currentDay,
          startReview: currentDay,
          endReview: currentDay,
          startNotify: currentDay,
          endNotify: currentDay,
          cycleComment: '',
          surveyComment: '',
          templateId: 0,
        }}
        onSubmit={async (values, actions): Promise<void> => {
          const {
            shortCode,
            startCall,
            endCall,
            startReview,
            endReview,
            startNotify,
            endNotify,
            cycleComment,
            surveyComment,
            templateId,
          } = values;

          await api()
            .createCall({
              shortCode: shortCode,
              startCall: startCall,
              endCall: endCall,
              startReview: startReview,
              endReview: endReview,
              startNotify: startNotify,
              endNotify: endNotify,
              cycleComment: cycleComment,
              surveyComment: surveyComment,
              templateId: templateId ? +templateId : null,
            })
            .then(data =>
              data.createCall.error
                ? enqueueSnackbar(
                    getTranslation(data.createCall.error as ResourceId),
                    {
                      variant: 'error',
                    }
                  )
                : null
            );
          actions.setSubmitting(false);
          props.close();
        }}
        validationSchema={createCallValidationSchema}
      >
        {(): JSX.Element => (
          <Form>
            <Typography className={classes.cardHeader}>
              Call information
            </Typography>

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
            <FormikDropdown
              name="templateId"
              label="Call template"
              items={templates.map(template => ({
                text: template.name,
                value: template.templateId,
              }))}
              data-cy="call-template"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              data-cy="submit"
            >
              Add Call
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

AddCall.propTypes = {
  close: PropTypes.func.isRequired,
};

export default AddCall;

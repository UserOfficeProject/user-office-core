import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { FieldArray } from 'formik';
import React from 'react';

import {
  EmailActionConfig as EmailActionConfigType,
  EmailStatusActionEmailTemplate,
  EmailStatusActionRecipient,
} from 'generated/sdk';

const useStyles = makeStyles((theme) => ({
  eventDescription: {
    margin: '-5px 0',
    fontSize: 'small',
    color: theme.palette.grey[400],
  },
}));

type EmailActionConfigProps = {
  emailStatusActionConfig: EmailActionConfigType;
  recipients: EmailStatusActionRecipient[];
  emailTemplates: EmailStatusActionEmailTemplate[];
  isRecipientRequired?: boolean;
  isEmailTemplateRequired?: boolean;
};

const EmailActionConfig = ({
  emailStatusActionConfig: { recipientsWithEmailTemplate },
  recipients,
  emailTemplates,
  isRecipientRequired = false,
  isEmailTemplateRequired = false,
}: EmailActionConfigProps) => {
  const classes = useStyles();

  return (
    <>
      <Typography variant="h6" color="black">
        Email recipients:{' '}
      </Typography>
      <FieldArray
        name="emailStatusActionConfig.recipientsWithEmailTemplate"
        render={(arrayHelpers) =>
          recipients?.map((recipient, index) => {
            const foundRecipientWithEmailTemplateIndex =
              recipientsWithEmailTemplate.findIndex(
                (item) => item.recipient?.name === recipient.name
              );

            return (
              <Grid key={index} container paddingX={1}>
                <Grid item sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id={recipient.name}
                        name="statusActionConfig"
                        value={recipient.name}
                        checked={
                          !!recipientsWithEmailTemplate[
                            foundRecipientWithEmailTemplateIndex
                          ]
                        }
                        data-cy={`action-recipient-${recipient.name}`}
                        onChange={(e) => {
                          if (e.target.checked)
                            arrayHelpers.push({ recipient });
                          else {
                            arrayHelpers.remove(
                              foundRecipientWithEmailTemplateIndex
                            );
                          }
                        }}
                        inputProps={{
                          'aria-label': 'primary checkbox',
                        }}
                        required={isRecipientRequired}
                      />
                    }
                    label={recipient.name}
                  />
                  <p className={classes.eventDescription}>
                    {recipient.description}
                  </p>
                </Grid>
                <Grid item sm={6}>
                  {foundRecipientWithEmailTemplateIndex !== -1 && (
                    <Autocomplete
                      id="recipient-template"
                      options={emailTemplates || []}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          margin="none"
                          label="Email template"
                          required={isEmailTemplateRequired}
                        />
                      )}
                      onChange={(_event, newValue) => {
                        const newTemplateValue = {
                          ...recipientsWithEmailTemplate[
                            foundRecipientWithEmailTemplateIndex
                          ],
                          emailTemplate: newValue,
                        };

                        arrayHelpers.replace(
                          foundRecipientWithEmailTemplateIndex,
                          newTemplateValue
                        );
                      }}
                      value={
                        recipientsWithEmailTemplate[
                          foundRecipientWithEmailTemplateIndex
                        ].emailTemplate || null
                      }
                      data-cy={`${recipient.name}-email-template`}
                    />
                  )}
                </Grid>
              </Grid>
            );
          })
        }
      />
    </>
  );
};

export default EmailActionConfig;

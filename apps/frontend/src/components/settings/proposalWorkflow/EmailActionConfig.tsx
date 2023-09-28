import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { FieldArray } from 'formik';
import React, { useState } from 'react';

import {
  EmailActionConfig as EmailActionConfigType,
  EmailStatusActionEmailTemplate,
  EmailStatusActionRecipient,
  EmailStatusActionRecipients,
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
  const [otherRecipientsValue, setOtherRecipientsValue] = useState('');

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

            const isInList = (email: string) => {
              return arrayHelpers.form.values.emailStatusActionConfig.recipientsWithEmailTemplate[
                foundRecipientWithEmailTemplateIndex
              ]?.otherEmailRecipients?.includes(email);
            };

            const isEmail = (email: string) => {
              return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email);
            };

            const isValid = (email: string) => {
              let error = null;

              if (isInList(email)) {
                error = `${email} has already been added.`;
              }

              if (!isEmail(email)) {
                error = `${email} is not a valid email address.`;
              }

              if (error) {
                // push the error in the form state.
                arrayHelpers.form.setFieldError('otherEmailRecipients', error);

                return false;
              }

              return true;
            };

            const handleKeyDown = (evt: any) => {
              if (['Enter'].includes(evt.key)) {
                evt.preventDefault();

                const value = evt.target.value.trim();

                if (value && isValid(value)) {
                  const existingValues =
                    recipientsWithEmailTemplate[
                      foundRecipientWithEmailTemplateIndex
                    ].otherEmailRecipients;

                  const newOtherRecipients = existingValues
                    ? [...existingValues, value]
                    : [value];

                  const newRecipientConfig = {
                    ...recipientsWithEmailTemplate[
                      foundRecipientWithEmailTemplateIndex
                    ],
                    otherEmailRecipients: newOtherRecipients,
                  };
                  arrayHelpers.replace(
                    foundRecipientWithEmailTemplateIndex,
                    newRecipientConfig
                  );

                  setOtherRecipientsValue('');
                }
              }
            };

            const handleDelete = (item: string) => {
              const existingValues =
                recipientsWithEmailTemplate[
                  foundRecipientWithEmailTemplateIndex
                ];

              const newRecipientConfig = {
                ...existingValues,
                otherEmailRecipients:
                  existingValues.otherEmailRecipients?.filter(
                    (i) => i !== item
                  ),
              };

              arrayHelpers.replace(
                foundRecipientWithEmailTemplateIndex,
                newRecipientConfig
              );
            };

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
                    <>
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
                      {recipient.name === EmailStatusActionRecipients.OTHER && (
                        <>
                          <TextField
                            id="other-email-recipients"
                            type="email"
                            label="Other email recipients"
                            placeholder="Type or paste email address and press `Enter`..."
                            data-cy="other-email-recipients"
                            onKeyDown={handleKeyDown}
                            onChange={(e) => {
                              if (
                                arrayHelpers.form.errors.otherEmailRecipients
                              ) {
                                arrayHelpers.form.setFieldError(
                                  'otherEmailRecipients',
                                  ''
                                );
                              }
                              setOtherRecipientsValue(e.target.value);
                            }}
                            value={otherRecipientsValue}
                            fullWidth
                            error={
                              !!arrayHelpers.form.errors.otherEmailRecipients
                            }
                            helperText={
                              arrayHelpers.form.errors.otherEmailRecipients
                            }
                            required={
                              !arrayHelpers.form.values.emailStatusActionConfig
                                .recipientsWithEmailTemplate[
                                foundRecipientWithEmailTemplateIndex
                              ]?.otherEmailRecipients.length
                            }
                          />
                          <>
                            {arrayHelpers.form.values.emailStatusActionConfig.recipientsWithEmailTemplate[
                              foundRecipientWithEmailTemplateIndex
                            ]?.otherEmailRecipients?.map(
                              (item: string, index: number) => (
                                <Chip
                                  key={index}
                                  label={item}
                                  onDelete={() => handleDelete(item)}
                                  sx={{ marginBottom: 1, marginRight: 1 }}
                                />
                              )
                            )}
                          </>
                        </>
                      )}
                    </>
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

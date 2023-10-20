import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { FieldArray, FieldArrayRenderProps } from 'formik';
import React, { useState, KeyboardEvent } from 'react';
import * as Yup from 'yup';

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
  const [otherRecipientsFieldError, setOtherRecipientsFieldError] = useState<
    string | null
  >(null);

  const getRecipientIndexByName = (
    recipientName: EmailStatusActionRecipients
  ) =>
    recipientsWithEmailTemplate.findIndex(
      (item) => item.recipient?.name === recipientName
    );

  const isInList = (email: string, list?: string[] | null) => {
    return list?.includes(email);
  };

  const isValid = (email: string, foundRecipientIndex: number) => {
    let error = null;

    const otherRecipientEmails =
      recipientsWithEmailTemplate[foundRecipientIndex]?.otherRecipientEmails;

    if (isInList(email, otherRecipientEmails)) {
      error = `${email} has already been added.`;
    }

    if (!Yup.string().email().isValidSync(email)) {
      error = `${email} is not a valid email address.`;
    }

    if (error) {
      // push the error in the form state.
      setOtherRecipientsFieldError(error);

      return false;
    }

    return true;
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    arrayHelpers: FieldArrayRenderProps
  ) => {
    if (['Enter'].includes(event.key)) {
      event.preventDefault();

      const value = (event.target as HTMLInputElement).value.trim();

      const foundRecipientIndex = getRecipientIndexByName(
        EmailStatusActionRecipients.OTHER
      );

      if (
        foundRecipientIndex !== -1 &&
        value &&
        isValid(value, foundRecipientIndex)
      ) {
        const existingRecipients =
          recipientsWithEmailTemplate[foundRecipientIndex]
            .otherRecipientEmails || [];

        const newOtherRecipients = existingRecipients.concat([value]);

        const newRecipientConfig = {
          ...recipientsWithEmailTemplate[foundRecipientIndex],
          otherRecipientEmails: newOtherRecipients,
        };
        arrayHelpers.replace(foundRecipientIndex, newRecipientConfig);

        setOtherRecipientsValue('');
        setOtherRecipientsFieldError(null);
      }
    }
  };

  const handleDelete = (item: string, arrayHelpers: FieldArrayRenderProps) => {
    const foundRecipientIndex = getRecipientIndexByName(
      EmailStatusActionRecipients.OTHER
    );

    const recipient = recipientsWithEmailTemplate[foundRecipientIndex];

    const newRecipientConfig = {
      ...recipient,
      otherRecipientEmails: recipient.otherRecipientEmails?.filter(
        (i) => i !== item
      ),
    };

    arrayHelpers.replace(foundRecipientIndex, newRecipientConfig);
  };

  const handleBlur = (index: number) => {
    const hasOtherRecipientEmailValues =
      recipientsWithEmailTemplate[index].otherRecipientEmails?.length;

    if (otherRecipientsValue && !hasOtherRecipientEmailValues) {
      setOtherRecipientsFieldError(
        'Please add the typed value by pressing Enter'
      );
    }
  };

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
              getRecipientIndexByName(recipient.name);

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
                            onKeyDown={(e) => handleKeyDown(e, arrayHelpers)}
                            onChange={(e) => {
                              if (otherRecipientsFieldError) {
                                setOtherRecipientsFieldError(null);
                              }
                              setOtherRecipientsValue(e.target.value);
                            }}
                            onBlur={() =>
                              handleBlur(foundRecipientWithEmailTemplateIndex)
                            }
                            value={otherRecipientsValue}
                            fullWidth
                            error={!!otherRecipientsFieldError}
                            helperText={otherRecipientsFieldError}
                            required={
                              !recipientsWithEmailTemplate[
                                foundRecipientWithEmailTemplateIndex
                              ]?.otherRecipientEmails?.length
                            }
                          />
                          <div data-cy="added-email-recipients">
                            {recipientsWithEmailTemplate[
                              foundRecipientWithEmailTemplateIndex
                            ]?.otherRecipientEmails?.map(
                              (item: string, index: number) => (
                                <Chip
                                  key={index}
                                  label={item}
                                  onDelete={() =>
                                    handleDelete(item, arrayHelpers)
                                  }
                                  sx={{ marginBottom: 1, marginRight: 1 }}
                                />
                              )
                            )}
                          </div>
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

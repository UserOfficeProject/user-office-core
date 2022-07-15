import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { Field, Form, Formik } from 'formik';
import { Autocomplete } from 'formik-mui';
import React, { ChangeEvent, useEffect, useState } from 'react';

import { PredefinedMessageKey } from 'generated/sdk';
import { usePredefinedMessagesData } from 'hooks/predefinedMessage/usePredefinedMessagesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type PredefinedMessagesModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMessage: string;
  setFieldValue: (value: string, shouldValidate?: boolean | undefined) => void;
  messageKey?: PredefinedMessageKey;
};

const PredefinedMessagesModal: React.FC<PredefinedMessagesModalProps> = ({
  open,
  setOpen,
  selectedMessage,
  messageKey,
  setFieldValue,
}) => {
  const {
    loadingPredefinedMessages,
    predefinedMessages,
    setPredefinedMessages,
  } = usePredefinedMessagesData({ key: messageKey });
  const { api } = useDataApiWithFeedback();

  const [shouldClose, setShouldClose] = useState(false);

  const predefinedMessagesOptions = predefinedMessages.map((message) => ({
    value: message.id,
    text: message.shortCode,
    message: message.message,
  }));

  const initialValues = {
    predefinedMessage:
      predefinedMessagesOptions.find(
        (message) => message.message === selectedMessage
      )?.value || null,
    message:
      predefinedMessagesOptions.find(
        (message) => message.message === selectedMessage
      )?.message || '',
  };

  const [message, setMessage] = useState(initialValues.message);

  useEffect(() => {
    setMessage(initialValues.message || '');
  }, [initialValues.message]);

  const saveMessageChanges = async (values: {
    id: number;
    shortCode: string;
    message: string;
  }) => {
    const response = await api({
      toastSuccessMessage: 'Message changes saved successfully',
    }).updatePredefinedMessage({
      input: { ...values, key: messageKey || PredefinedMessageKey.GENERAL },
    });

    if (!response.updatePredefinedMessage.rejection) {
      const newMessages = predefinedMessages.map((message) => ({
        ...message,
        message: message.id === values.id ? values.message : message.message,
      }));

      setPredefinedMessages(newMessages);
    }
  };

  const options = predefinedMessagesOptions.map((item) => item.value);

  return (
    <Dialog
      aria-labelledby="predefined-messages-modal"
      aria-describedby="predefined-messages-modal"
      open={open}
      onClose={() => setOpen(false)}
      style={{ backdropFilter: 'blur(6px)' }}
      maxWidth="xs"
      fullWidth
    >
      <Formik
        initialValues={initialValues}
        // validationSchema={administrationProposalValidationSchema}
        onSubmit={async (values): Promise<void> => {
          const foundMessage = predefinedMessages.find(
            (message) => message.id === values.predefinedMessage
          );
          if (
            !values.predefinedMessage ||
            !values.message ||
            !foundMessage?.shortCode
          ) {
            return;
          }

          if (shouldClose) {
            saveMessageChanges({
              id: values.predefinedMessage,
              shortCode: foundMessage?.shortCode,
              message: values.message,
            });
          } else {
            saveMessageChanges({
              id: values.predefinedMessage,
              shortCode: foundMessage?.shortCode,
              message: values.message,
            });
            setFieldValue(values.message);
            setOpen(false);
          }
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <DialogContent>
              <Field
                id="predefined-message-input"
                name="predefinedMessage"
                component={Autocomplete}
                loading={loadingPredefinedMessages}
                options={options}
                noOptionsText="No predefined messages"
                onChange={(
                  _: React.SyntheticEvent<Element, Event>,
                  selectedItem: number
                ) => {
                  const newSelectedMessage =
                    predefinedMessagesOptions.find(
                      (option) => option.value === selectedItem
                    )?.message || '';
                  setFieldValue('message', newSelectedMessage);
                  setMessage(newSelectedMessage);
                  setFieldValue('predefinedMessage', selectedItem);
                }}
                getOptionLabel={(option: number | string) => {
                  const foundOption = predefinedMessagesOptions.find(
                    (item) => item.value === option
                  );

                  return foundOption?.text || '';
                }}
                renderInput={(params: TextFieldProps) => (
                  <TextField
                    {...params}
                    label="Select from predefined messages"
                    disabled={isSubmitting}
                  />
                )}
              />
              <Field
                name="message"
                label="Predefined message"
                type="text"
                component={TextField}
                fullWidth
                data-cy="message-test"
                multiline
                rows="4"
                value={message}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFieldValue('message', e.target.value);
                  setMessage(e.target.value);
                }}
                disabled={isSubmitting}
                InputLabelProps={{ shrink: !!values.message }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                type="submit"
                onClick={() => {
                  setShouldClose(false);
                }}
                disabled={isSubmitting}
              >
                Use message
              </Button>
              <Button
                type="submit"
                onClick={() => {
                  setShouldClose(true);
                }}
                disabled={isSubmitting}
              >
                Save changes
              </Button>
              <Button
                variant="text"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Close
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default PredefinedMessagesModal;

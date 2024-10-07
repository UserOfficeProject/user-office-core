import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';

import { usePredefinedMessagesData } from 'hooks/predefinedMessage/usePredefinedMessagesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { PredefinedMessageKey } from './FormikUIPredefinedMessagesTextField';
import FormikUIAutocomplete from '../FormikUIAutocomplete';
import TextField from '../FormikUITextField';
import UOLoader from '../UOLoader';

type PredefinedMessagesModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMessage: string;
  setFormFieldValue: (
    value: string,
    shouldValidate?: boolean | undefined
  ) => void;
  messageKey?: PredefinedMessageKey;
  confirm: WithConfirmType;
};

const PredefinedMessagesModal = ({
  open,
  setOpen,
  selectedMessage,
  messageKey,
  setFormFieldValue,
  confirm,
}: PredefinedMessagesModalProps) => {
  const {
    loadingPredefinedMessages,
    predefinedMessages,
    setPredefinedMessages,
  } = usePredefinedMessagesData({ key: messageKey });
  const { api } = useDataApiWithFeedback();
  const [shouldSave, setShouldSave] = useState(false);

  const predefinedMessagesOptions = predefinedMessages.map((message) => ({
    value: message.id,
    text: message.title,
    message: message.message,
  }));

  const foundMessage = predefinedMessagesOptions.find(
    (message) => message.message === selectedMessage
  );

  const initialValues = {
    predefinedMessageId: foundMessage?.value || null,
    title: foundMessage?.text || '',
    message: selectedMessage,
  };

  const updatePredefinedMessage = async (values: {
    id: number;
    title: string;
    message: string;
  }) => {
    await api({
      toastSuccessMessage: 'Message changes saved successfully',
    }).updatePredefinedMessage({
      input: { ...values, key: messageKey || PredefinedMessageKey.GENERAL },
    });

    const newMessages = predefinedMessages.map((message) => ({
      ...message,
      title: message.id === values.id ? values.title : message.title,
      message: message.id === values.id ? values.message : message.message,
    }));

    setPredefinedMessages(newMessages);
  };

  const createPredefinedMessage = async (values: {
    title: string;
    message: string;
  }) => {
    const { createPredefinedMessage } = await api({
      toastSuccessMessage: 'Message created successfully',
    }).createPredefinedMessage({
      input: { ...values, key: messageKey || PredefinedMessageKey.GENERAL },
    });

    const newMessages = [...predefinedMessages, createPredefinedMessage];

    setPredefinedMessages(newMessages);
  };

  const handlePredefinedMessageSelectionChange = (
    selectedItem: number,
    setFieldValue: (
      field: string,
      value: number | string,
      shouldValidate?: boolean | undefined
    ) => void
  ) => {
    const newSelectedMessage = predefinedMessagesOptions.find(
      (option) => option.value === selectedItem
    );
    setFieldValue('message', newSelectedMessage?.message || '');
    setFieldValue('title', newSelectedMessage?.text || '');
    setFieldValue('predefinedMessageId', selectedItem);
  };

  const handlePredefinedMessageDelete = async () => {
    confirm(
      async () => {
        if (!initialValues.predefinedMessageId) {
          return;
        }

        await api({
          toastSuccessMessage: 'Message deleted successfully',
        }).deletePredefinedMessage({
          input: { id: initialValues.predefinedMessageId },
        });

        const newPredefinedMessagesArray = predefinedMessages.filter(
          (predefinedMessage) =>
            predefinedMessage.id !== initialValues.predefinedMessageId
        );

        setPredefinedMessages(newPredefinedMessagesArray);
      },
      {
        title: 'Please confirm',
        description: 'Are you sure you want to delete this predefined message?',
      }
    )();
  };

  const options = predefinedMessagesOptions.map((item) => ({
    text: item.text,
    value: item.value,
  }));

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
      {loadingPredefinedMessages ? (
        <DialogContent sx={{ textAlign: 'center' }}>
          <UOLoader />
        </DialogContent>
      ) : (
        <Formik
          initialValues={initialValues}
          onSubmit={async (values): Promise<void> => {
            if (!values.message || !values?.title) {
              return;
            }

            if (values.predefinedMessageId) {
              if (shouldSave) {
                await updatePredefinedMessage({
                  id: values.predefinedMessageId,
                  title: values.title,
                  message: values.message,
                });
                setFormFieldValue(values.message);
                setOpen(false);
              } else {
                setFormFieldValue(values.message);
                setOpen(false);
              }
            } else {
              await createPredefinedMessage({
                title: values.title,
                message: values.message,
              });
              setFormFieldValue(values.message);
              setOpen(false);
            }
          }}
        >
          {({ isSubmitting, setFieldValue, dirty, resetForm }) => (
            <Form
              onChange={() => {
                if (dirty) {
                  setShouldSave(true);
                }
              }}
            >
              <DialogContent>
                <FormikUIAutocomplete
                  name="predefinedMessageId"
                  label="Select from predefined messages"
                  loading={loadingPredefinedMessages}
                  noOptionsText="No predefined messages"
                  items={options}
                  onChange={(
                    _: React.SyntheticEvent<Element, Event>,
                    selectedItem: number
                  ) =>
                    handlePredefinedMessageSelectionChange(
                      selectedItem,
                      setFieldValue
                    )
                  }
                  disabled={isSubmitting}
                  data-cy="predefined-message-select"
                />
                <Field
                  name="title"
                  label="Predefined message title"
                  type="text"
                  component={TextField}
                  fullWidth
                  data-cy="message-title"
                  disabled={isSubmitting}
                  required
                />
                <Field
                  name="message"
                  label="Predefined message"
                  type="text"
                  component={TextField}
                  fullWidth
                  data-cy="message"
                  multiline
                  rows="5"
                  required
                  disabled={isSubmitting}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={<SaveIcon />}
                  data-cy={shouldSave ? 'save-and-use-message' : 'use-message'}
                >
                  {shouldSave ? 'Save & Use' : 'Use'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={isSubmitting || !initialValues.predefinedMessageId}
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    handlePredefinedMessageDelete();

                    resetForm({
                      values: {
                        predefinedMessageId: null,
                        title: '',
                        message: '',
                      },
                    });
                  }}
                  data-cy="delete-message"
                >
                  Delete
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
      )}
    </Dialog>
  );
};

export default withConfirm(PredefinedMessagesModal);

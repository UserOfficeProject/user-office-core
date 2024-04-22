import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { Field, Form, Formik } from 'formik';
import { Autocomplete } from 'formik-mui';
import React, { ChangeEvent, useEffect, useState } from 'react';

import { usePredefinedMessagesData } from 'hooks/predefinedMessage/usePredefinedMessagesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import { PredefinedMessageKey } from './FormikUIPredefinedMessagesTextField';
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

  const [initialValues, setInitialValues] = useState<{
    predefinedMessageId: number | null;
    title: string;
    message: string;
  }>({
    predefinedMessageId: null,
    title: '',
    message: selectedMessage,
  });

  useEffect(() => {
    const foundMessage = predefinedMessagesOptions.find(
      (message) => message.message === initialValues.message
    );

    if (
      foundMessage &&
      foundMessage.value !== initialValues.predefinedMessageId
    ) {
      setInitialValues({
        predefinedMessageId: foundMessage.value,
        title: foundMessage.text,
        message: foundMessage.message,
      });
    }
  }, [
    predefinedMessagesOptions,
    initialValues.predefinedMessageId,
    initialValues.message,
  ]);

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
    setInitialValues({
      predefinedMessageId: selectedItem,
      title: newSelectedMessage?.text || '',
      message: newSelectedMessage?.message || '',
    });
  };

  const handleSetFieldAndValue = (
    field: 'title' | 'message',
    value: string,
    setFieldValue: (
      field: string,
      value: number | string,
      shouldValidate?: boolean | undefined
    ) => void
  ) => {
    setFieldValue(field, value);
    setInitialValues({
      ...initialValues,
      [field]: value,
    });
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
        setInitialValues({
          predefinedMessageId: null,
          title: '',
          message: '',
        });
      },
      {
        title: 'Please confirm',
        description: 'Are you sure you want to delete this predefined message?',
      }
    )();
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
          {({ isSubmitting, setFieldValue, dirty }) => (
            <Form
              onChange={() => {
                if (dirty) {
                  setShouldSave(true);
                }
              }}
            >
              <DialogContent>
                <Field
                  id="predefined-message-input"
                  name="predefinedMessageId"
                  component={Autocomplete}
                  loading={loadingPredefinedMessages}
                  options={options}
                  noOptionsText="No predefined messages"
                  onChange={(
                    _: React.SyntheticEvent<Element, Event>,
                    selectedItem: number
                  ) =>
                    handlePredefinedMessageSelectionChange(
                      selectedItem,
                      setFieldValue
                    )
                  }
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
                      data-cy="predefined-message-select"
                    />
                  )}
                  ListboxProps={{
                    'data-cy': 'predefined-message-select-options',
                  }}
                />
                <Field
                  name="title"
                  label="Predefined message title"
                  type="text"
                  component={TextField}
                  value={initialValues.title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleSetFieldAndValue(
                      'title',
                      e.target.value,
                      setFieldValue
                    );
                  }}
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
                  value={initialValues.message}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleSetFieldAndValue(
                      'message',
                      e.target.value,
                      setFieldValue
                    );
                  }}
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
                  onClick={handlePredefinedMessageDelete}
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

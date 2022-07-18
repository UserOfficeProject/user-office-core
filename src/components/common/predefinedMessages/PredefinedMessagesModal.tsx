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

import { PredefinedMessageKey } from './FormikUIPredefinedMessagesTextField';

type PredefinedMessagesModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMessage: string;
  setFormFieldValue: (
    value: string,
    shouldValidate?: boolean | undefined
  ) => void;
  messageKey?: PredefinedMessageKey;
};

const PredefinedMessagesModal: React.FC<PredefinedMessagesModalProps> = ({
  open,
  setOpen,
  selectedMessage,
  messageKey,
  setFormFieldValue,
}) => {
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

  const saveMessageChanges = async (values: {
    id: number;
    title: string;
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
        title: message.id === values.id ? values.title : message.title,
        message: message.id === values.id ? values.message : message.message,
      }));

      setPredefinedMessages(newMessages);
    }
  };

  const onPredefinedMessageSelectionChange = (
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

  const options = predefinedMessagesOptions.map((item) => item.value);

  if (loadingPredefinedMessages) {
    return null;
  }

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
            (message) => message.id === values.predefinedMessageId
          );
          if (
            !values.predefinedMessageId ||
            !values.message ||
            !foundMessage?.title
          ) {
            return;
          }

          if (shouldSave) {
            saveMessageChanges({
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
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form
            onChange={() => {
              setShouldSave(true);
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
                  onPredefinedMessageSelectionChange(
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
                  />
                )}
              />
              <Field
                name="title"
                label="Predefined message title"
                type="text"
                component={TextField}
                value={initialValues.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setFieldValue('title', e.target.value);
                  setInitialValues({ ...initialValues, title: e.target.value });
                }}
                fullWidth
                data-cy="message-title"
                disabled={isSubmitting}
                InputLabelProps={{ shrink: !!values.message }}
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
                  setFieldValue('message', e.target.value);
                  setInitialValues({
                    ...initialValues,
                    message: e.target.value,
                  });
                }}
                disabled={isSubmitting}
                InputLabelProps={{ shrink: !!values.message }}
              />
            </DialogContent>
            <DialogActions>
              <Button type="submit" disabled={isSubmitting}>
                {shouldSave ? 'Save & Use' : 'Use'}
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

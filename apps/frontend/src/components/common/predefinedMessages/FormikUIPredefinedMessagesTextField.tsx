import AddCommentIcon from '@mui/icons-material/AddComment';
import IconButton from '@mui/material/IconButton';
import { TextFieldProps } from '@mui/material/TextField';
import MuiTextField, {
  TextFieldProps as MUITextFieldProps,
} from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { FieldAttributes, useField } from 'formik';
import React, { useState } from 'react';

import PredefinedMessagesModal from './PredefinedMessagesModal';

export enum PredefinedMessageKey {
  MANAGER = 'manager',
  USER = 'user',
  GENERAL = 'general',
}

/**
 * NOTE: Predefined messages are used as a way to reuse some messages that are repeatable throughout the app.
 * For example feedback inputs, comments and other messages that are quite generic can be just selected from a list of predefined messages.
 * This is Textarea which is loading all predefined messages from the database filtered by some specific key.
 * It is easy to just search and select the message you want to use for that specific form input.
 */
const FormikUIPredefinedMessagesTextField = ({
  name,
  ...otherProps
}: FieldAttributes<TextFieldProps> & {
  'message-key'?: PredefinedMessageKey;
}) => {
  if (!name) {
    throw new Error(
      'FormikUIPredefinedMessagesTextField cannot be used without a required name property'
    );
  }
  const [field, meta, helpers] = useField(name);
  const [modalOpen, setModalOpen] = useState(false);

  const configTextField: MUITextFieldProps = {
    ...field,
    ...otherProps,
    fullWidth: true,
    multiline: true,
    rows: 3,
  };

  if (meta && meta.touched && meta.error) {
    configTextField.error = true;
    configTextField.helperText = meta.error;
  }

  const openPredefinedMessagesModal = () => {
    setModalOpen(true);
  };

  return (
    <>
      {modalOpen && (
        <PredefinedMessagesModal
          open={modalOpen}
          setOpen={setModalOpen}
          selectedMessage={field.value as string}
          messageKey={otherProps['message-key']}
          setFormFieldValue={helpers.setValue}
        />
      )}

      <MuiTextField
        {...configTextField}
        InputProps={{
          endAdornment: (
            <Tooltip title="Select from predefined messages">
              <IconButton
                aria-label="Select from predefined messages"
                onClick={openPredefinedMessagesModal}
                data-cy="select-predefined-message"
              >
                <AddCommentIcon />
              </IconButton>
            </Tooltip>
          ),
        }}
      />
    </>
  );
};

export default FormikUIPredefinedMessagesTextField;

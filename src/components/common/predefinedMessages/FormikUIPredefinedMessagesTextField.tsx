import AddCommentIcon from '@mui/icons-material/AddComment';
import IconButton from '@mui/material/IconButton';
import { TextFieldProps } from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { Field, FieldAttributes, useField } from 'formik';
import React, { useState } from 'react';

import PredefinedMessagesModal from './PredefinedMessagesModal';

const FormikUIPredefinedMessagesTextField: React.FC<
  FieldAttributes<TextFieldProps>
> = (props) => {
  const [field] = useField(props);
  const [modalOpen, setModalOpen] = useState(false);

  const openPredefinedMessagesModal = () => {
    setModalOpen(true);
  };

  return (
    <>
      <PredefinedMessagesModal
        open={modalOpen}
        setOpen={setModalOpen}
        fieldName={field.name}
        selectedMessage={field.value as string}
      />
      <Field
        {...props}
        InputProps={{
          endAdornment: (
            <Tooltip title="Select from predefined messages">
              <IconButton
                aria-label="Select from predefined messages"
                onClick={openPredefinedMessagesModal}
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

import AttachFileIcon from '@material-ui/icons/AttachFile';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import ShortTextIcon from '@material-ui/icons/ShortText';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import React from 'react';

import { DataType } from '../../generated/sdk';

const getTemplateFieldIcon = (dataType: DataType) => {
  switch (dataType) {
    case DataType.TEXT_INPUT:
      return <ShortTextIcon />;
    case DataType.SELECTION_FROM_OPTIONS:
      return <RadioButtonCheckedIcon />;
    case DataType.BOOLEAN:
      return <CheckBoxOutlineBlankIcon />;
    case DataType.DATE:
      return <CalendarTodayIcon />;
    case DataType.FILE_UPLOAD:
      return <AttachFileIcon />;
    case DataType.EMBELLISHMENT:
      return <TextFieldsIcon />;
    case DataType.SUBTEMPLATE:
      return <QuestionAnswerIcon />;

    default:
      return null;
  }
};

export default getTemplateFieldIcon;

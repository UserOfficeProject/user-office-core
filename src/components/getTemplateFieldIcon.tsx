import React from "react";
import ShortTextIcon from "@material-ui/icons/ShortText";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import { DataType } from "../model/ProposalModel";

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

    default:
      return null;
  }
};

export default getTemplateFieldIcon;

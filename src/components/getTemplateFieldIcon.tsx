import React from "react";
import ShortTextIcon from "@material-ui/icons/ShortText";
import RadioButtonCheckedIcon from "@material-ui/icons/RadioButtonChecked";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import { DataType } from "../models/ProposalModel";

const getTemplateFieldIcon = (dataType: DataType) => {
  switch (dataType) {
    case DataType.TextInput:
      return <ShortTextIcon />;
    case DataType.SelectionFromOptions:
      return <RadioButtonCheckedIcon />;
    case DataType.Boolean:
      return <CheckBoxOutlineBlankIcon />;
    case DataType.Date:
      return <CalendarTodayIcon />;
    case DataType.FileUpload:
      return <AttachFileIcon />;
    case DataType.Embellishment:
      return <TextFieldsIcon />;

    default:
      return null;
  }
};

export default getTemplateFieldIcon;

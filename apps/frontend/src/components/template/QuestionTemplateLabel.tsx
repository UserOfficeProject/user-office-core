import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

export default function TemplateEdit(props: { pageType: string }) {
  const useStyles = makeStyles((theme) => ({
    label: {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.grey[300],
      fontSize: 'medium',
    },
  }));
  const classes = useStyles();
  if (props.pageType == 'Template') {
    return (
      <label className={classes.label}>
        You are editing the question as it appears on the current template
      </label>
    );
  } else if (props.pageType == 'Question') {
    return (
      <label className={classes.label}>You are editing the question</label>
    );
  } else {
    return null;
  }
}

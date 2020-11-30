import withStyles from '@material-ui/core/styles/withStyles';
import TextField from '@material-ui/core/TextField';

export const DarkerDisabledTextField = withStyles({
  root: {
    marginRight: 8,
    '& .MuiInputBase-root.Mui-disabled': {
      color: 'rgba(0, 0, 0, 0.7)', // (default alpha is 0.38)
    },
  },
})(TextField);

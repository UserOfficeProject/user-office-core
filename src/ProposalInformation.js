import React, { useState }  from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px",
  },
});


export default function ProposalInformation(props) {
  const classes = useStyles();

  const [title, setTitle] = useState(props.data.title || "");
  const [titleError, setTitleError] = useState(false);

  const [abstract, setAbstract] = useState(props.data.abstract || "");
  const [abstractError, setAbstactError] = useState(false);

  const handleNext = () => {
    let vaildated = true; // I do not know why I need to do this

    if(title.length < 10){
      setTitleError(true);
      vaildated = false;
    }else{
      setTitleError(false);
    }

    if(abstract.length < 20){
      setAbstactError(true);
      vaildated = false; 
    }else{
      setAbstactError(false);
    }

    if(vaildated){
      props.next({title, abstract});
    }
  }

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        General Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="title"
            name="title"
            label="Title"
            defaultValue={title}
            fullWidth
            onChange={(e) => setTitle(e.target.value )}
            error={titleError}
            helperText={titleError ? 'Title must be at least 10 characters' : ' '}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="abstract"
            name="abstract"
            label="Abstract"
            defaultValue={abstract}
            fullWidth
            onChange={(e) => setAbstract(e.target.value )}
            error={abstractError}
            helperText={abstractError ? 'Abstract must be at least 20 characters' : ' '}
          />
        </Grid>
      </Grid>
      <div className={classes.buttons}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNext}
          className={classes.button}
        >
          Next
        </Button>
      </div>
    </React.Fragment>
  );
}
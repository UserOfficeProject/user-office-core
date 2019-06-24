import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';


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


export default function ProposalReview(props) {
  const classes = useStyles();
  const rows = [
    {key: "Title", value: props.data.title},
    {key: "Abstract", value: props.data.abstract}
  ];

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Review Information
      </Typography>
      <Table className={classes.table}>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.name}>
              <TableCell>{row.key}</TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.buttons}>
        <Button onClick={props.back} className={classes.button}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={props.submit}
          className={classes.button}
        >
          {props.data.status ? "Update" : "Submit" }
        </Button>
      </div>
    </React.Fragment>
  );
}
import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import MaterialTable from "material-table";
import { tableIcons } from "../utils/tableIcons";
import { useCallsData } from "../hooks/useCallsData";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import { Add } from "@material-ui/icons";
import AddCall from "./AddCall";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3)
    }
  },
  fixedHeight: {
    height: 240
  }
}));

export default function CallPage() {
  const classes = useStyles();
  const [show, setShow] = useState(false);
  const { loading, callsData } = useCallsData(show);

  const columns = [
    { title: "Short Code", field: "shortCode" },
    { title: "Start Date", field: "startDate" },
    { title: "End Date", field: "endDate" }
  ];

  if (loading) {
    return <p>Loading</p>;
  }

  return (
    <React.Fragment>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={show}
        onClose={() => setShow(false)}
      >
        <DialogContent>
          <AddCall close={() => setShow(false)} />
        </DialogContent>
      </Dialog>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <MaterialTable
                icons={tableIcons}
                title="Calls"
                columns={columns}
                data={callsData}
                options={{
                  search: false
                }}
                actions={[
                  {
                    icon: () => <Add />,
                    isFreeAction: true,
                    tooltip: "Add Call",
                    onClick: (event, rowData) => setShow(true)
                  }
                ]}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}

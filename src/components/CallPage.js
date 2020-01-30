import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Grid from "@material-ui/core/Grid";
import { Add } from "@material-ui/icons";
import MaterialTable from "material-table";
import React, { useState } from "react";
import { useCallsData } from "../hooks/useCallsData";
import { ContentContainer, StyledPaper } from "../styles/StyledComponents";
import { tableIcons } from "../utils/tableIcons";
import AddCall from "./AddCall";

export default function CallPage() {
  const [show, setShow] = useState(false);
  const { loading, callsData } = useCallsData(show);

  const columns = [
    { title: "Short Code", field: "shortCode" },
    { title: "Start Date", field: "startCall" },
    { title: "End Date", field: "endCall" }
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
      <ContentContainer>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
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
                    icon: () => <Add data-cy="add-call" />,
                    isFreeAction: true,
                    tooltip: "Add Call",
                    onClick: (event, rowData) => setShow(true)
                  }
                ]}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      </ContentContainer>
    </React.Fragment>
  );
}

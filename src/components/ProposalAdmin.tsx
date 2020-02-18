import React, { Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import { Formik, Form } from "formik";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { useDataApi } from "../hooks/useDataApi";
import * as Yup from "yup";
import { ProposalEndStatus } from "../generated/sdk";
import FormikDropdown from "./FormikDropdown";
import { ButtonContainer } from "../styles/StyledComponents";
import { useSnackbar } from "notistack";


export default function ProposalAdmin(props: { id: number
}) {
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  return (
    <Fragment>
      <Typography variant="h6" gutterBottom>
        Admin
      </Typography>
      <Formik
        initialValues={{
          finalStatus: ProposalEndStatus.ACCEPTED
        }}
        validationSchema={Yup.object().shape({
          finalStatus: Yup.string().required("status is required"),
        })}
        onSubmit={async (values, actions) => {
          console.log(values)
            api().updateProposal({id: props.id, finalStatus: ProposalEndStatus[values.finalStatus as ProposalEndStatus]}).then(data => enqueueSnackbar("Updated", {
              variant: data.updateProposal.error ? "error" : "success"
            }))
            actions.setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormikDropdown
                      name="finalStatus"
                      label="Final status"
                      items={[
                        { text: "Accepted", value: ProposalEndStatus.ACCEPTED },
                        { text: "Reserved", value: ProposalEndStatus.RESERVED },
                        { text: "Rejected", value: ProposalEndStatus.REJECTED }
                      ]}
                      required
                    />
              </Grid>
          </Grid>
          <ButtonContainer>
              <Button
                disabled={isSubmitting}
                type="submit"
                variant="contained"
                color="primary"
              >
                Update
              </Button>
              </ButtonContainer>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
}

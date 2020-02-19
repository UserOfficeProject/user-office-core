import React, { Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import { Formik, Form, Field } from "formik";
import Grid from "@material-ui/core/Grid";
import { TextField } from "formik-material-ui";
import Button from "@material-ui/core/Button";
import { useDataApi } from "../../hooks/useDataApi";
import * as Yup from "yup";
import { TechnicalReviewStatus, TechnicalReview } from "../../generated/sdk";
import FormikDropdown from "../common/FormikDropdown";
import { ButtonContainer } from "../../styles/StyledComponents";
import { useSnackbar } from "notistack";

export default function ProposalTechnicalReview(props: {
  data: TechnicalReview | null | undefined;
  setReview: any;
  id: number;
}) {
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  return (
    <Fragment>
      <Typography variant="h6" gutterBottom>
        Technical Review
      </Typography>
      <Formik
        initialValues={{
          status: props?.data?.status,
          timeAllocation: props?.data?.timeAllocation,
          comment: props?.data?.comment
        }}
        validationSchema={Yup.object().shape({
          status: Yup.string().required("status is required"),
          timeAllocation: Yup.number().required("time is required"),
          comment: Yup.string().required("comment is required")
        })}
        onSubmit={async (values, actions) => {
          await api()
            .addTechnicalReview({
              proposalID: props.id,
              timeAllocation: values.timeAllocation!,
              comment: values.comment!,
              status:
                TechnicalReviewStatus[values.status as TechnicalReviewStatus]
            })
            .then(data =>
              enqueueSnackbar("Updated", {
                variant: data.addTechnicalReview.error ? "error" : "success"
              })
            );
          props.setReview({
            proposalID: props?.data?.proposalID!,
            timeAllocation: values.timeAllocation!,
            comment: values.comment!,
            status:
              TechnicalReviewStatus[values.status as TechnicalReviewStatus]
          });
          actions.setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormikDropdown
                  name="status"
                  label="Status"
                  items={[
                    { text: "Feasible", value: TechnicalReviewStatus.FEASIBLE },
                    {
                      text: "Partially feasible",
                      value: TechnicalReviewStatus.PARTIALLY_FEASIBLE
                    },
                    {
                      text: "Unfeasible",
                      value: TechnicalReviewStatus.UNFEASIBLE
                    }
                  ]}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <Field
                  name="timeAllocation"
                  label="Time Allocation(hr)"
                  type="number"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="timeAllocation"
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <Field
                  name="comment"
                  label="Comment"
                  type="text"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="comment"
                  multiline={true}
                  rows={2}
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

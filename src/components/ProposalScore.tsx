import React, { Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import { useUpdateProposal } from "../hooks/useUpdateProposal";
import { Formik, Form, Field } from "formik";
import Grid from "@material-ui/core/Grid";
import { TextField } from "formik-material-ui";
import Button from "@material-ui/core/Button";
export default function ProposalScore(props: {excellenceScore: number | undefined, safetyScore: number | undefined, technicalScore: number | undefined, proposalId: number}) {
const {updateProposal } = useUpdateProposal();

return <Fragment>
          <Typography variant="h6" gutterBottom>
        Score
      </Typography>
      <Formik
                initialValues={{
                    excellence: props.excellenceScore
                }}
                onSubmit={(values, actions) => {
                    updateProposal({
                        id: props.proposalId,
                        excellenceScore: 10
                      });
                  actions.setSubmitting(false);
                }}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <Field
                          name="excellence"
                          label="Excellence"
                          type="number"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          autoComplete="off"
                          data-cy="excellence"
                          helperText="The excellence score is between 1-10"
                        />
                      </Grid>
                    </Grid>
                    <div>
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Update
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
    </Fragment>;
}

import { makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import React from "react";
import { useDataApi } from "../../hooks/useDataApi";
import { emailFieldSchema } from "../../utils/userFieldValidationSchema";

export function InviteUserForm(props: { action: Function }) {
  const api = useDataApi();
  const classes = makeStyles({
    buttons: {
      display: "flex",
      justifyContent: "flex-end"
    },
    button: {
      marginTop: "25px",
      marginLeft: "10px"
    }
  })();

  return (
    <Formik
      initialValues={{
        name: "",
        lastname: "",
        email: ""
      }}
      onSubmit={async values => {
        const createResult = await api().createUserByEmailInvite({
          firstname: values.name,
          lastname: values.lastname,
          email: values.email
        });
        props.action({
          firstname: values.name,
          lastname: values.lastname,
          organisation: "",
          id: createResult?.createUserByEmailInvite.id
        });
      }}
      validationSchema={emailFieldSchema}
    >
      {subformik => (
        <Form>
          <Typography component="h1" variant="h5">
            Invite by Email
          </Typography>
          <Field
            name="name"
            label="Name"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
          />
          <Field
            name="lastname"
            label="Lastname"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="lastname"
          />
          <Field
            name="email"
            label="E-mail"
            type="email"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="email"
          />

          <div className={classes.buttons}>
            <Button
              onClick={() => subformik.submitForm()}
              variant="contained"
              color="primary"
              className={classes.button}
            >
              Invite User
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

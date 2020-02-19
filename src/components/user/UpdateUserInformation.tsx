import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/styles";
import dateformat from "dateformat";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useDataApi } from "../../hooks/useDataApi";
import { useGetFields } from "../../hooks/useGetFields";
import orcid from "../../images/orcid.png";
import { StyledPaper, ButtonContainer } from "../../styles/StyledComponents";
import { userFieldSchema } from "../../utils/userFieldValidationSchema";
import FormikDropdown from "../common/FormikDropdown";

const useStyles = makeStyles({
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: "25px",
    marginLeft: "10px"
  },

  container: {
    paddingTop: "25px",
    paddingBottom: "25px"
  },
  orcidIconSmall: {
    "vertical-align": "middle",
    "margin-right": "4px",
    width: "16px",
    height: "16px",
    border: "0px"
  },
  orcIdContainer: {
    "margin-top": "16px",
    "margin-bottom": "19px"
  }
});

export default function UpdateUserInformation(props: { id: number }) {
  const [userData, setUserData] = useState<any>(null);
  const sendRequest = useDataApi();
  const fieldsContent = useGetFields();
  const [nationalitiesList, setNationalitiesList] = useState<
    { text: string; value: string }[]
  >([]);
  const [institutionsList, setInstitutionsList] = useState<
    { text: string; value: string }[]
  >([]);
  const { enqueueSnackbar } = useSnackbar();

  if (fieldsContent && !nationalitiesList.length && !institutionsList.length) {
    setInstitutionsList(
      fieldsContent.institutions.map((institution: any) => {
        return { text: institution.value, value: institution.id };
      })
    );
    setNationalitiesList(
      fieldsContent.nationalities.map((nationality: any) => {
        return { text: nationality.value, value: nationality.id };
      })
    );
  }

  const sendUserUpdate = (values: any) => {
    const variables = {
      id: props.id,
      ...values,
      gender: values.gender === "other" ? values.othergender : values.gender
    };
    sendRequest()
      .updateUser(variables)
      .then(data =>
        enqueueSnackbar("Updated Information", {
          variant: data.updateUser.error ? "error" : "success"
        })
      );
  };
  useEffect(() => {
    const getUserInformation = (id: number) => {
      sendRequest()
        .getUser({ id })
        .then(data => {
          setUserData({ ...data.user });
        });
    };
    getUserInformation(props.id);
  }, [props.id, sendRequest]);

  const classes = useStyles();

  if (!userData) {
    return <p>Loading</p>;
  }

  return (
    <React.Fragment>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <Formik
                validateOnChange={false}
                validateOnBlur={false}
                initialValues={{
                  username: userData.username,
                  firstname: userData.firstname,
                  middlename: userData.middlename,
                  lastname: userData.lastname,
                  preferredname: userData.preferredname,
                  gender:
                    userData.gender !== "male" && userData.gender !== "female"
                      ? "other"
                      : userData.gender,
                  othergender: userData.gender,
                  nationality: userData.nationality,
                  birthdate: dateformat(
                    new Date(parseInt(userData.birthdate)),
                    "yyyy-mm-dd"
                  ),
                  organisation: userData.organisation,
                  department: userData.department,
                  organisation_address: userData.organisation_address,
                  position: userData.position,
                  oldEmail: userData.email,
                  email: userData.email,
                  telephone: userData.telephone,
                  telephone_alt: userData.telephone_alt,
                  user_title: userData.user_title,
                  orcid: userData.orcid
                }}
                onSubmit={(values, actions) => {
                  sendUserUpdate(values);
                  actions.setFieldValue("oldEmail", values.email);
                  actions.setSubmitting(false);
                }}
                validationSchema={userFieldSchema}
              >
                {({ isSubmitting, values }) => (
                  <Form>
                    <Typography variant="h6" gutterBottom>
                      User Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <FormikDropdown
                          name="user_title"
                          label="Title"
                          items={[
                            { text: "Ms.", value: "Ms." },
                            { text: "Mr.", value: "Mr." },
                            { text: "Dr.", value: "Dr." },
                            { text: "Prof.", value: "Prof." },
                            { text: "Rather not say", value: "unspecified" }
                          ]}
                          data-cy="title"
                        />
                        <Field
                          name="firstname"
                          label="Firstname"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="firstname"
                        />
                        <Field
                          name="middlename"
                          label="Middle name"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="middlename"
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
                          name="preferredname"
                          label="Preferred name"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="preferredname"
                        />
                        <FormikDropdown
                          name="gender"
                          label="Gender"
                          items={[
                            { text: "Female", value: "female" },
                            { text: "Male", value: "male" },
                            { text: "Other", value: "other" }
                          ]}
                          data-cy="gender"
                        />
                        {values.gender === "other" && (
                          <Field
                            name="othergender"
                            label="Please specify gender"
                            type="text"
                            component={TextField}
                            margin="normal"
                            fullWidth
                            data-cy="othergender"
                            required
                          />
                        )}
                        <FormikDropdown
                          name="nationality"
                          label="Nationality"
                          items={nationalitiesList}
                          data-cy="nationality"
                        />
                        <Field
                          name="birthdate"
                          label="Birthdate"
                          type="date"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="birthdate"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <div className={classes.orcIdContainer}>
                          <InputLabel shrink>ORCID iD</InputLabel>
                          <a href={"https://orcid.org/" + values.orcid}>
                            <img
                              className={classes.orcidIconSmall}
                              src={orcid}
                              alt="ORCID iD icon"
                            />
                            https://orcid.org/{values.orcid}
                          </a>
                        </div>
                        <Field
                          name="username"
                          label="Username"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          autoComplete="off"
                          data-cy="username"
                          disabled={true}
                        />
                        <FormikDropdown
                          name="organisation"
                          label="Organisation"
                          items={institutionsList}
                          data-cy="organisation"
                        />
                        <Field
                          name="department"
                          label="Department"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="department"
                        />
                        <Field
                          name="position"
                          label="Position"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="position"
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
                        <Field
                          name="telephone"
                          label="Telephone"
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="telephone"
                        />
                        <Field
                          name="telephone_alt"
                          label="Telephone Alt."
                          type="text"
                          component={TextField}
                          margin="normal"
                          fullWidth
                          data-cy="telephone-alt"
                        />
                      </Grid>
                    </Grid>
                    <ButtonContainer>
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                      >
                        Update Profile
                      </Button>
                    </ButtonContainer>
                  </Form>
                )}
              </Formik>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  );
}

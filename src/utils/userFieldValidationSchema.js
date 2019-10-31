import * as Yup from "yup";

export const userFieldSchema = Yup.object().shape({
  firstname: Yup.string()
    .min(2, "firstname must be at least 2 characters")
    .max(15, "firstname must be at most 15 characters")
    .required("firstname must be at least 2 characters"),
  lastname: Yup.string()
    .min(2, "lastname must be at least 2 characters")
    .max(15, "lastname must be at most 15 characters")
    .required("lastname must be at least 2 characters"),
  gender: Yup.string().required("please specify your gender"),
  nationality: Yup.string().required("please specify your nationality"),
  user_title: Yup.string().required("User title is required"),
  username: Yup.string()
    .min(2, "Username must be at least 2 characters")
    .max(20, "Username must be at most 20 characters")
    .required("Username must be at least 2 characters"),
  birthdate: Yup.date()
    .max(new Date())
    .required("Please specify your birth date"),
  organisation: Yup.string()
    .min(2, "organisation must be at least 2 characters")
    .max(50, "organisation must be at most 50 characters")
    .required("organisation must be at least 2 characters"),
  department: Yup.string()
    .min(2, "department must be at least 2 characters")
    .max(50, "department must be at most 50 characters")
    .required("department must be at least 2 characters"),
  organisation_address: Yup.string()
    .min(2, "organisation address must be at least 2 characters")
    .max(100, "organisation must be at most 100 characters")
    .required("organisation must be at least 2 characters"),
  position: Yup.string()
    .min(2, "position must be at least 2 characters")
    .max(50, "position must be at most 50 characters")
    .required("position must be at least 2 characters"),
  email: Yup.string()
    .email("email is in correct format")
    .required("please specify email"),
  telephone: Yup.string()
    .min(2, "telephone must be at least 2 characters")
    .max(20, "telephone must be at most 20 characters")
    .required("telephone must be at least 2 characters"),
  telephone_alt: Yup.string()
    .min(2, "telephone must be at least 2 characters")
    .max(20, "telephone must be at most 20 characters")
});

export const userPasswordFieldSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(25, "Password must be at most 25 characters")
    .required("Password must be at least 8 characters"),
  confirmPassword: Yup.string()
    .required()
    .label("Confirm password")
    .test("passwords-match", "Passwords must match", function(value) {
      return this.parent.password === value;
    })
});

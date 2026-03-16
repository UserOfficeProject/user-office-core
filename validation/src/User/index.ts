import * as Yup from "yup";

export const deleteUserValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
});

export const createUserByEmailInviteValidationSchema = (UserRole: any) =>
  Yup.object().shape({
    firstname: Yup.string().required(),
    lastname: Yup.string().required(),
    email: Yup.string().email(),
    userRole: Yup.string().oneOf(Object.keys(UserRole)).required(),
  });

const passwordValidationSchema = Yup.string()
  .required(
    "Password must contain at least 8 characters (including upper case, lower case and numbers)",
  )
  .matches(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
    "Password must contain at least 8 characters (including upper case, lower case and numbers)",
  );

export const createUserValidationSchema = Yup.object().shape({
  firstname: Yup.string().required().min(2).max(50),
  preferredname: Yup.string().notRequired().max(50),
  lastname: Yup.string().required().min(2).max(50),
  user_title: Yup.string().required(),
  email: Yup.string().email().required(),
  password: passwordValidationSchema,
  confirmPassword: Yup.string()
    .when("password", {
      is: (val: string) => (val && val.length > 0 ? true : false),
      then: Yup.string().oneOf(
        [Yup.ref("password")],
        "Confirm password does not match password",
      ),
    })
    .notRequired(),
  institutionId: Yup.number().required(),
});

export const updateUserValidationSchema = Yup.object().shape({
  firstname: Yup.string().min(2).max(50).required(),
  preferredname: Yup.string().notRequired().max(50),
  lastname: Yup.string().min(2).max(50).required(),
  userTitle: Yup.string().required(),
  email: Yup.string().email().required(),
  institutionId: Yup.number().required(),
});

export const updateUserValidationBackendSchema = Yup.object().shape({
  id: Yup.number().required(),
  firstname: Yup.string().min(2).max(50).notRequired(),
  preferredname: Yup.string().notRequired().max(50),
  lastname: Yup.string().min(2).max(50).notRequired(),
  userTitle: Yup.string().notRequired(),
  email: Yup.string().email().notRequired(),
  institutionId: Yup.number().notRequired(),
});

export const updateUserRolesValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  roles: Yup.array().of(Yup.number()).required(),
});

export const signInValidationSchema = Yup.object().shape({
  email: Yup.string().email(),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(25, "Password must be at most 25 characters")
    .required("Password must be at least 8 characters"),
});

export const getTokenForUserValidationSchema = Yup.object().shape({
  userId: Yup.number().required(),
});

export const resetPasswordByEmailValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Please enter an email"),
});

export const addUserRoleValidationSchema = Yup.object().shape({
  userID: Yup.number().required(),
  roleID: Yup.number().required(),
});

export const updatePasswordValidationSchema = Yup.object().shape({
  id: Yup.number().required(),
  password: passwordValidationSchema,
});

export const userPasswordFieldBEValidationSchema = Yup.object().shape({
  password: passwordValidationSchema,
  token: Yup.string().required(),
});

export const userPasswordFieldValidationSchema = Yup.object().shape({
  password: passwordValidationSchema,
  confirmPassword: Yup.string()
    .when("password", {
      is: (val: string) => (val && val.length > 0 ? true : false),
      then: Yup.string().oneOf(
        [Yup.ref("password")],
        "Confirm password does not match password",
      ),
    })
    .notRequired(),
});

type InstitutionInput = {
  rorId?: string;
  institutionData?: {
    name: string;
    country: string;
  };
};

export class UpsertUserByOidcSubArgs {
  public userTitle: string | null;
  public firstName: string;
  public lastName: string;
  public preferredName: string | null;
  public oidcSub: string;
  public institution: InstitutionInput;
  public email: string;
}

const rorIdRegExp = /^https:\/\/ror\.org\/[0-9a-z]{9}$/;

export const upsertUserByOidcSubValidationSchema = Yup.object().shape({
  userTitle: Yup.string().notRequired(),
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  preferredName: Yup.string().notRequired(),
  oidcSub: Yup.string().required(),
  institution: Yup.object()
    .shape({
      rorId: Yup.string().matches(rorIdRegExp, {
        message: "rorId must be in the format https://ror.org/01wv9cn34",
        excludeEmptyString: true,
      }),
      institutionData: Yup.lazy((value) =>
        value == null
          ? Yup.mixed().notRequired()
          : Yup.object().shape({
              name: Yup.string().required(),
              country: Yup.string().required(),
            }),
      ),
    })
    .test(
      "exactly-one-of-rorid-or-institutiondata",
      "Exactly one of rorId or institutionData must be provided",
      (institution) => {
        const hasRorId = !!institution?.rorId?.trim();
        const hasInstitutionData =
          institution?.institutionData !== undefined &&
          institution?.institutionData !== null;

        return (
          (hasRorId && !hasInstitutionData) || (!hasRorId && hasInstitutionData)
        );
      },
    )
    .required(),
  email: Yup.string().email().required(),
});

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PasswordResetDTO = {
    /**
     * The usernumber of the person that the password reset is for
     */
    readonly userNumber: string;
    /**
     * The time when the password reset was used to create a new password.
     */
    readonly resetUsed?: string | null;
    /**
     * The id of the password reset record.
     */
    readonly resetId?: number;
    /**
     * The time when the reset password expires
     */
    readonly expiryTime?: string;
};


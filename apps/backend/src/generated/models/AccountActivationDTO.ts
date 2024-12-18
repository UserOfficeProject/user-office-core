/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AccountActivationDTO = {
    /**
     * The id of the activation
     */
    activationId: number;
    /**
     * The IP address of the user that requested the activation
     */
    readonly activationIp?: string | null;
    /**
     * The time when the activation url was used
     */
    readonly activationUsed?: string | null;
    /**
     * The time when the activation will expire
     */
    readonly expiryTime?: string;
    /**
     * The user number of the user that the activation is for
     */
    readonly userNumber?: string | null;
};


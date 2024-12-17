/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FedIdRequestDTO = {
    /**
     * The unique identifier for the fedIdRequest record - row id
     */
    readonly rid?: number;
    /**
     * The user number of the person the Fed ID will be associated with
     */
    userNumber: string;
    /**
     * The date of birth of the person the Fed ID will be associated with
     */
    dob: string | null;
    /**
     * Whether the person already has a Fed ID and want to link it to their account
     */
    linkExisting?: boolean;
    /**
     * The date and time the record stopped being active (when the FedID request was fulfilled)
     */
    readonly thruDate?: string | null;
};


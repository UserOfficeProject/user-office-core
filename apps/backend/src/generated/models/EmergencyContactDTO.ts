/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * The new person's emergency contact
 */
export type EmergencyContactDTO = {
    /**
     * The unique identifier for the emergency contact
     */
    readonly contactId: number;
    /**
     * The user number of the person the emergency contact is for
     */
    userNumber: string;
    /**
     * The contact details of the emergency contact
     */
    contact: string | null;
    /**
     * The date the emergency contact was added
     */
    readonly dateAdded?: string;
};


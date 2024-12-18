/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PersonDTO = {
    /**
     * The unique identifier for the person record - row id
     */
    readonly rid?: number;
    /**
     * The user number of the person
     */
    readonly userNumber: string;
    /**
     * The FedID of the person
     */
    fedId?: string | null;
    /**
     * The title of the person
     */
    title: string | null;
    /**
     * The first name of the person
     */
    firstName: string | null;
    /**
     * The nickname of the person
     */
    firstNameKnownAs?: string | null;
    /**
     * The family name (surname) of the person
     */
    familyName: string | null;
    /**
     * The initials of the person
     */
    initials?: string | null;
    /**
     * The full name of the person, constructed from title, first name and family name
     */
    readonly fullName?: string | null;
    /**
     * The display name of the person
     */
    displayName?: string | null;
    /**
     * The academic status of the person
     */
    status: PersonDTO.status | null;
    /**
     * The email of the person
     */
    email: string | null;
    /**
     * The work phone number of the person
     */
    workPhone?: string | null;
    /**
     * The mobile phone number of the person
     */
    mobilePhone?: string | null;
    /**
     * The marketing email of the person
     */
    marketingEmail?: string | null;
    /**
     * Determines if person is subscribed to marketing emails or not
     */
    subscribedToMarketingEmails?: boolean | null;
    /**
     * The ID of the establishment that the person is a part of
     */
    establishmentId: number | null;
    /**
     * The ORCID ID of the person
     */
    orcidId?: string | null;
    /**
     * The date the person first created an account
     */
    joinedDate?: string | null;
    /**
     * The date the person record became active
     */
    readonly fromDate?: string | null;
    /**
     * The date the person record stopped being active
     */
    readonly thruDate?: string | null;
    /**
     * The last time the person accessed the system
     */
    readonly lastAccessTime?: string | null;
    /**
     * The latest date the person agreed to the Data Protection Act
     */
    dpaDate?: string | null;
    /**
     * The latest date the person reset their password
     */
    resetPasswordDate?: string | null;
    /**
     * Determines if person is deactivate or not
     */
    deactivated?: boolean | null;
};
export namespace PersonDTO {
    /**
     * The academic status of the person
     */
    export enum status {
        POSTDOCTORAL_RESEARCHER = 'Postdoctoral Researcher',
        NON_RESEARCH_STAFF = 'Non-Research Staff',
        UNDERGRADUATE_STUDENT = 'Undergraduate Student',
        MASTERS_STUDENT = 'Masters Student',
        PH_D_STUDENT = 'PhD Student',
        ACADEMIC_STAFF = 'Academic Staff',
        INDUSTRIAL_COLLABORATOR = 'Industrial Collaborator',
    }
}


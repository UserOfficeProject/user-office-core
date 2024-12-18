/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PersonCreationDTO = {
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
     * The academic status of the person
     */
    status: PersonCreationDTO.status | null;
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
     * The latest date the person agreed to the Data Protection Act
     */
    dpaDate?: string | null;
};
export namespace PersonCreationDTO {
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


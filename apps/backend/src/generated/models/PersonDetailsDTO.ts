/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PersonDetailsDTO = {
    /**
     * The user number of the person
     */
    userNumber: string;
    /**
     * The FedID of the person
     */
    fedId?: string | null;
    /**
     * The title of the person
     */
    title: string | null;
    /**
     * The given/first name of the person
     */
    givenName: string | null;
    /**
     * The name the person is known by
     */
    firstNameKnownAs?: string | null;
    /**
     * The family name of the person
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
    status: string | null;
    /**
     * The email of the person
     */
    email: string | null;
    /**
     * The work phone of the person
     */
    workPhone?: string | null;
    /**
     * The mobile phone of the person
     */
    mobilePhone?: string | null;
    /**
     * The emergency contact of the person
     */
    emergencyContact?: string | null;
    /**
     * The ID of the establishment that the person is a part of
     */
    establishmentId: string | null;
    /**
     * The name of the organisation the person is part of
     */
    orgName: string | null;
    /**
     * The acronym of the organisation the person is part of
     */
    orgAcronym?: string | null;
    /**
     * The name of the department the person is part of
     */
    deptName: string | null;
    /**
     * The acronym of the department the person is part of
     */
    deptAcronym?: string | null;
    /**
     * The country the person is from
     */
    country: string | null;
    /**
     * The last time the person accessed the system
     */
    readonly lastAccessTime?: string | null;
    /**
     * The date the person first created an account
     */
    joinedDate?: string | null;
};


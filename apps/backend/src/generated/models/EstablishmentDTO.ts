/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Please be aware values of fromDate, thruDate always null
 */
export type EstablishmentDTO = {
    /**
     * The unique identifier for the establishment
     */
    readonly establishmentId: number;
    /**
     * The name of the establishment
     */
    orgName: string | null;
    /**
     * The acronym of the establishment
     */
    orgAcronym?: string | null;
    /**
     * The name of the department
     */
    deptName: string | null;
    /**
     * The acronym of the department
     */
    deptAcronym?: string | null;
    /**
     * The site of the establishment
     */
    site?: string | null;
    /**
     * PO Box
     */
    poBox?: string | null;
    /**
     * Building number
     */
    buildingNumber?: string | null;
    /**
     * Building name
     */
    buildingName?: string | null;
    /**
     * Street
     */
    street?: string | null;
    /**
     * District
     */
    district?: string | null;
    /**
     * City or town
     */
    cityTown?: string | null;
    /**
     * County, province or state
     */
    countyProvinceState?: string | null;
    /**
     * Postal code
     */
    postalCode?: string | null;
    /**
     * Country
     */
    country: string | null;
    /**
     * The id of the postal address record that is associated with this establishment
     */
    postalAddressId?: number | null;
    /**
     * The date the address record became active
     */
    readonly fromDate?: string | null;
    /**
     * The date the address record stopped being active
     */
    readonly thruDate?: string | null;
    /**
     * The verification status of the establishment
     */
    verified?: EstablishmentDTO.verified | null;
};
export namespace EstablishmentDTO {
    /**
     * The verification status of the establishment
     */
    export enum verified {
        YES = 'Yes',
        NO = 'No',
    }
}


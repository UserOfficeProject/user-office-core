/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AddressDTO = {
    /**
     * Building name
     */
    building?: string | null;
    /**
     * Building number
     */
    buildingNo?: string | null;
    /**
     * Comments
     */
    comments?: string | null;
    /**
     * Country
     */
    country?: string | null;
    /**
     * County, province or state
     */
    countyProvinceState?: string | null;
    /**
     * District
     */
    district?: string | null;
    /**
     * The date the address record became active
     */
    readonly fromDate?: string | null;
    /**
     * The id of the address record
     */
    readonly postalAddressId: number;
    /**
     * Postal code
     */
    postalCode?: string | null;
    /**
     * PO Box
     */
    poBox?: string | null;
    /**
     * The unique identifier for the address record - row id
     */
    readonly rid?: number;
    /**
     * Site
     */
    site?: string | null;
    /**
     * Street
     */
    street?: string | null;
    /**
     * The date the address record stopped being active
     */
    readonly thruDate?: string | null;
    /**
     * Town or City
     */
    townCity?: string | null;
};


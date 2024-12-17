/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CountryDTO = {
    /**
     * Comments
     */
    comments?: string | null;
    /**
     * Determines if the country is in the EU
     */
    eu?: CountryDTO.eu;
    /**
     * Country name
     */
    name?: string;
    /**
     * Nationality
     */
    nationality?: string | null;
};
export namespace CountryDTO {
    /**
     * Determines if the country is in the EU
     */
    export enum eu {
        YES = 'Yes',
        NO = 'No',
    }
}


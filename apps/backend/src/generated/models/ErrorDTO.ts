/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * The DTO for the error response from REST services
 */
export type ErrorDTO = {
    /**
     * HTTP status code to be returned to the client
     */
    shortcode?: string;
    /**
     * A string used to identify the cause of the failure to the client
     */
    reason?: string;
    /**
     * A detailed message of the cause of the failure to the client
     */
    details?: Array<string>;
};


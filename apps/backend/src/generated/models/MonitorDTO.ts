/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MonitorDTO = {
    /**
     * The user's opt in status. OptIn, OptOut or Unknown
     */
    optIn: MonitorDTO.optIn;
    /**
     * The user's age option
     */
    ageOption: string | null;
    /**
     * The user's disability
     */
    disability: string | null;
    /**
     * The user's gender
     */
    gender: string | null;
    /**
     * The user's ethnicity
     */
    ethnicity: string | null;
};
export namespace MonitorDTO {
    /**
     * The user's opt in status. OptIn, OptOut or Unknown
     */
    export enum optIn {
        OPT_IN = 'OptIn',
        OPT_OUT = 'OptOut',
        UNKNOWN = 'Unknown',
    }
}


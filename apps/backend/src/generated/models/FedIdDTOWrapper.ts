/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonDTO } from './PersonDTO';
export type FedIdDTOWrapper = {
    person: PersonDTO;
    /**
     * The person's date of birth
     */
    dateOfBirth: string;
    /**
     * The expiry date for the Fed ID
     */
    expiryDate: string;
    /**
     * The person's status
     */
    status: string;
};


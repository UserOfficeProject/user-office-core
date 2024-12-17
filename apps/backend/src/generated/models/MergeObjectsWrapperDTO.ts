/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EmergencyContactDTO } from './EmergencyContactDTO';
import type { PersonDTO } from './PersonDTO';
export type MergeObjectsWrapperDTO = {
    person: PersonDTO;
    emergencyContact?: EmergencyContactDTO;
    /**
     * The user number from/assigned to the new person's facilities
     */
    keepFacilityUserNumber: string;
};


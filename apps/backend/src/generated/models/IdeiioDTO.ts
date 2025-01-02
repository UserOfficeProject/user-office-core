/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IdeiioCustom } from './IdeiioCustom';
import type { IdeiioDates } from './IdeiioDates';
import type { IdeiioEmail } from './IdeiioEmail';
import type { IdeiioMeta } from './IdeiioMeta';
import type { IdeiioName } from './IdeiioName';
import type { IdeiioOrganisation } from './IdeiioOrganisation';
export type IdeiioDTO = {
    schemas?: Array<string>;
    id?: string;
    externalId?: string;
    meta?: IdeiioMeta;
    userName?: string;
    name: IdeiioName;
    emails: Array<IdeiioEmail>;
    'urn:scim:schemas:extension:enterprise:1.0': IdeiioOrganisation;
    'urn:scim:schemas:com_ideiio:1.0': IdeiioDates;
    'urn:scim:schemas:com_ideiio_custom:1.0': IdeiioCustom;
};


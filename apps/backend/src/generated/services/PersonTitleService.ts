/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonTitleDTO } from '../models/PersonTitleDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PersonTitleService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get all person titles
     * @returns PersonTitleDTO List of person titles
     * @throws ApiError
     */
    public getPersonTitles(): CancelablePromise<Array<PersonTitleDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/person-titles',
        });
    }
}

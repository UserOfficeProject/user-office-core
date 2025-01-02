/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonStatusDTO } from '../models/PersonStatusDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PersonStatusService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get all person statuses
     * @returns PersonStatusDTO List of person statuses
     * @throws ApiError
     */
    public getPersonStatus(): CancelablePromise<Array<PersonStatusDTO>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/person-statuses',
        });
    }
}

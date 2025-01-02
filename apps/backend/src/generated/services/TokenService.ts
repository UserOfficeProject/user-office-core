/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TokenDetails } from '../models/TokenDetails';
import type { TokenWrapperDTO } from '../models/TokenWrapperDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TokenService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Validate a sessionID or an API-key
     * Requires an API-key GET_ALL_BASICPERSONDETAILS permissions
     * @param requestBody
     * @returns TokenDetails Token is valid
     * @throws ApiError
     */
    public validateToken(
        requestBody?: TokenWrapperDTO,
    ): CancelablePromise<TokenDetails> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Token is invalid`,
            },
        });
    }
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginDTO } from '../models/LoginDTO';
import type { UsernamePasswordWrapperDTO } from '../models/UsernamePasswordWrapperDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SessionsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get login by session ID
     * No auth required
     * @param sessionId SessionID associated with the login
     * @returns LoginDTO Login found
     * @throws ApiError
     */
    public getLoginBySessionId(
        sessionId: string,
    ): CancelablePromise<LoginDTO> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/sessions/{sessionId}',
            path: {
                'sessionId': sessionId,
            },
            errors: {
                401: `Session expired`,
                404: `No login found`,
            },
        });
    }
    /**
     * Logout - delete session
     * Requires at least USER roleOnly the user themselves can logout their account. ADMIN role or ADMIN API-key can logout any account.
     * @param sessionId SessionID to logout
     * @returns void
     * @throws ApiError
     */
    public logout(
        sessionId: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v1/sessions/{sessionId}',
            path: {
                'sessionId': sessionId,
            },
            errors: {
                401: `Unauthorized to perform this action`,
                404: `Session does not exist`,
            },
        });
    }
    /**
     * Login - create session
     * No auth required
     * @param requestBody
     * @returns LoginDTO Login successful
     * @throws ApiError
     */
    public login(
        requestBody?: UsernamePasswordWrapperDTO,
    ): CancelablePromise<LoginDTO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v1/sessions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `No username or password provided`,
                401: `Username or password is incorrect`,
                403: `Account locked`,
                503: `Service unavailable`,
            },
        });
    }
    /**
     * Logout all sessions for a user
     * Requires at least USER_OFFICE role or ADMIN API-Key
     * @param email Email of the user who is being logged out
     * @returns void
     * @throws ApiError
     */
    public logoutAllSessionsForUser(
        email: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/v1/sessions/all',
            query: {
                'email': email,
            },
            errors: {
                401: `Unauthorized to perform this action`,
                404: `No account found with email`,
                409: `Multiple records found for email`,
            },
        });
    }
}

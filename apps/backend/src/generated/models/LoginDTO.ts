/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LoginDTO = {
    /**
     * The user number of the user to whom the login belongs
     */
    userId: string;
    /**
     * The session identifier in the form of UUID, sessionID
     */
    sessionId: string;
    /**
     * The date and time of the last access to the session
     */
    readonly lastAccessTime?: string;
    /**
     * The type of login
     */
    readonly loginType?: LoginDTO.loginType;
    /**
     * Comments about the login
     */
    comments?: string | null;
};
export namespace LoginDTO {
    /**
     * The type of login
     */
    export enum loginType {
        DATABASE = 'DATABASE',
        LDAP = 'LDAP',
        ALTERNATIVE_IDENTIFIER = 'ALTERNATIVE_IDENTIFIER',
    }
}


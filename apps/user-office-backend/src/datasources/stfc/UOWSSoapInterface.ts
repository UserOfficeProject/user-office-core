
    import * as soap from 'soap';
    import { logger } from '@user-office-software/duo-logger';
    import { createHash } from 'crypto';

    export default class UOWSSoapClient {
      private static instance: UOWSSoapClient | undefined = undefined;
      private wsdlUrl: string;
      private client!: soap.Client;
      private activeUowsRequests: Map<string, Promise<any>> = new Map();
      private wsdlDesc: any = {"UserOfficeWebService":{"UserOfficeWebServicePort":{"logoutAllSessionsForUser":{"input":{"apiKey":"xs:string","emailAddress":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPeopleDetailsFromSurname":{"input":{"Token":"xs:string","Surname":"xs:string","FuzzySearch":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAgeRangeOptions":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsByEncryptedId":{"input":{"token":"xs:string","encryptedId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getSearchableBasicPeopleDetailsFromSurname":{"input":{"Token":"xs:string","Surname":"xs:string","FuzzySearch":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"unlinkAlternativeIdentifierToUser":{"input":{"Token":"xs:string","AlternativeIdentifier":{"alternativeIdentifierID":"xs:long","created":"xs:dateTime","createdBy":"xs:string","displayName":"xs:string","modified":"xs:dateTime","modifiedBy":"xs:string","provider":"xs:string","secretKey":"xs:string","thruDate":"xs:dateTime","userNumber":"xs:string","uuid":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPrivacyDTO":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"id":"xs:long","searchable":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEstablishmentDTO":{"input":{"establishmentId":"xs:long","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"buildingName":"xs:string","buildingNumber":"xs:string","cityTown":"xs:string","country":"xs:string","countyProvinceState":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","district":"xs:string","establishmentId":"xs:long","fromDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"orgAcronym":"xs:string","orgName":"xs:string","poBox":"xs:string","postalAddressId":"xs:long","postalCode":"xs:string","site":"xs:string","street":"xs:string","thruDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"verified":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonDetailsFromSessionId":{"input":{"SessionId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonsFacilities":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEstablishmentDTOsBySearchDetails":{"input":{"searchDetails[]":{"departmentName":"xs:string","organisationName":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"buildingName":"xs:string","buildingNumber":"xs:string","cityTown":"xs:string","country":"xs:string","countyProvinceState":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","district":"xs:string","establishmentId":"xs:long","fromDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"orgAcronym":"xs:string","orgName":"xs:string","poBox":"xs:string","postalAddressId":"xs:long","postalCode":"xs:string","site":"xs:string","street":"xs:string","thruDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"verified":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPeopleDetailsFromUserNumbers":{"input":{"Token":"xs:string","UserNumbers[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getSearchableBasicPersonDetailsFromUserNumber":{"input":{"Token":"xs:string","UserNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"deleteEstablishmentById":{"input":{"Token":"xs:string","EstablishmentId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllTitles":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updatePersonByDTO":{"input":{"token":"xs:string","person":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","orcidId":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPeopleDetailsFromEmails":{"input":{"Token":"xs:string","Emails[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"loginWithAlternativeIdentifier":{"input":{"SystemSessionId":"xs:string","Uuid":"xs:string","Provider":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonDTOByMarketingEmail":{"input":{"token":"xs:string","marketingEmail":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","orcidId":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getSearchableBasicPeopleDetailsFromUserNumbers":{"input":{"Token":"xs:string","UserNumbers[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"isTokenValid":{"input":{"Token":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getSearchableBasicPeopleDetailsFromEmails":{"input":{"Token":"xs:string","Emails[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updatePersonsFacilities":{"input":{"token":"xs:string","userNumber":"xs:string","facilities[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getMonitorDTO":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"ageOption":"xs:string","disability":"xs:string","ethnicity":"xs:string","gender":"xs:string","optIn":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"resetPassword":{"input":{"encryptedResetId":"xs:string","password":"xs:string","ipAddress":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getDataUsages":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"name":"xs:string","value":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updateEmergencyContactDTO":{"input":{"token":"xs:string","userNumber":"xs:string","emergencyContactDTO":{"contact":"xs:string","contactId":"xs:long","dateAdded":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"sendAccountActivationEmail":{"input":{"Token":"xs:string","Email":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getDisabilities":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEstablishmentsBySearchDetails":{"input":{"searchDetails[]":{"departmentName":"xs:string","organisationName":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"departmentAcronym":"xs:string","departmentName":"xs:string","departmentUrl":"xs:string","establishmentId":"xs:long","groupAcronym":"xs:string","groupName":"xs:string","organisationAcronym":"xs:string","organisationName":"xs:string","organisationType":"xs:string","organisationUrl":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getRolesForUser":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"name":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"resetPasswordWithOldPassword":{"input":{"sessionId":"xs:string","oldPassword":"xs:string","newPassword":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getUsersPermissionUserGroupDTOs":{"input":{"Token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"comments":"xs:string","groupName":"xs:string","id":"xs:long","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"deactivatePerson":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"logout":{"input":{"SessionId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"setPrivacyDTO":{"input":{"token":"xs:string","userNumber":"xs:string","privacyDTO":{"id":"xs:long","searchable":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getChangesSince":{"input":{"Token":"xs:string","Since":"xs:dateTime","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"comments":"xs:string","deactivated":"xs:boolean","dpaDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"givenName":"xs:string","initials":"xs:string","isisSalt":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastpwdreset":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","monitorId":"xs:long","newUserNumber":"xs:string","orcidId":"xs:string","privacyId":"xs:long","rid":"xs:long","sha2":"xs:string","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","updated":"xs:string","userNumber":"xs:string","verified":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getGenders":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"createPersonFromPersonDTO":{"input":{"token":"xs:string","person":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","orcidId":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"detailsCheckNeeded":{"input":{"sessionId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"loginWithAlternativeIdentifierECP":{"input":{"Provider":"xs:string","Username":"xs:string","Password":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updateExpiredPassword":{"input":{"token":"xs:string","encryptedId":"xs:string","oldPassword":"xs:string","newPassword":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getDataLookup":{"input":{"Name":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updateAlternativeIdentifiersForUser":{"input":{"Token":"xs:string","AlternativeIdentifiers[]":{"alternativeIdentifierID":"xs:long","created":"xs:dateTime","createdBy":"xs:string","displayName":"xs:string","modified":"xs:dateTime","modifiedBy":"xs:string","provider":"xs:string","secretKey":"xs:string","thruDate":"xs:dateTime","userNumber":"xs:string","uuid":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getTokenDetails":{"input":{"token":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"identifier":"xs:string","type":"tokenType|xs:string|API_KEY,SESSION_ID","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"noLdapLogin":{"input":{"UserNumber":"xs:string","Password":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getFrequentGenders":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEthnicities":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPeopleDetailsSinceDate":{"input":{"Token":"xs:string","Date":"xs:dateTime","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"createEstablishmentFromEstablishmentDTO":{"input":{"token":"xs:string","establishment":{"buildingName":"xs:string","buildingNumber":"xs:string","cityTown":"xs:string","country":"xs:string","countyProvinceState":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","district":"xs:string","establishmentId":"xs:long","fromDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"orgAcronym":"xs:string","orgName":"xs:string","poBox":"xs:string","postalAddressId":"xs:long","postalCode":"xs:string","site":"xs:string","street":"xs:string","thruDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"verified":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:long","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsByEncryptedActivationId":{"input":{"token":"xs:string","encryptedActivationId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"requestLinkExistingFedId":{"input":{"token":"xs:string","dob":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsFromEmail":{"input":{"Token":"xs:string","Email":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"requestNewFedId":{"input":{"token":"xs:string","dob":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"sendPasswordResetEmail":{"input":{"Token":"xs:string","Email":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllEstablishmentDTOs":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"buildingName":"xs:string","buildingNumber":"xs:string","cityTown":"xs:string","country":"xs:string","countyProvinceState":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","district":"xs:string","establishmentId":"xs:long","fromDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"orgAcronym":"xs:string","orgName":"xs:string","poBox":"xs:string","postalAddressId":"xs:long","postalCode":"xs:string","site":"xs:string","street":"xs:string","thruDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"verified":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEstablishmentDTOsByQuery":{"input":{"searchQuery":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"buildingName":"xs:string","buildingNumber":"xs:string","cityTown":"xs:string","country":"xs:string","countyProvinceState":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","district":"xs:string","establishmentId":"xs:long","fromDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"orgAcronym":"xs:string","orgName":"xs:string","poBox":"xs:string","postalAddressId":"xs:long","postalCode":"xs:string","site":"xs:string","street":"xs:string","thruDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"verified":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"acceptLatestDataProtectionAgreement":{"input":{"token":"xs:string","encryptedId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"setMonitorDTO":{"input":{"token":"xs:string","userNumber":"xs:string","monitorDTO":{"ageOption":"xs:string","disability":"xs:string","ethnicity":"xs:string","gender":"xs:string","optIn":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"activateAccountWithoutPassword":{"input":{"encryptedActivationId":"xs:string","ipAddress":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsFromFedId":{"input":{"Token":"xs:string","FedId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"activateAccount":{"input":{"encryptedActivationId":"xs:string","password":"xs:string","ipAddress":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPeopleDetailsFromUserNumbers":{"input":{"Token":"xs:string","UserNumbers[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllCountries":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getSearchableBasicPersonDetailsFromEmail":{"input":{"Token":"xs:string","Email":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonDetailsFromUserNumber":{"input":{"Token":"xs:string","UserNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonDetailsFromEmail":{"input":{"Token":"xs:string","Email":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"createFedId":{"input":{"token":"xs:string","fedIdUserName":"xs:string","fedIdLoginPassword":"xs:string","person":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","orcidId":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"status":"xs:string","expiryDate":"xs:dateTime","fedIdDob":"xs:dateTime","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllFacilityNames":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPeopleDetailsFromEmails":{"input":{"Token":"xs:string","Emails[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"isAlternativeIdentifierActive":{"input":{"Uuid":"xs:string","Provider":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"isAlternativeIdentifierLinked":{"input":{"Uuid":"xs:string","Provider":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"login":{"input":{"Account":"xs:string","Password":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"linkAlternativeIdentifierToUser":{"input":{"Token":"xs:string","AlternativeIdentifier":{"alternativeIdentifierID":"xs:long","created":"xs:dateTime","createdBy":"xs:string","displayName":"xs:string","modified":"xs:dateTime","modifiedBy":"xs:string","provider":"xs:string","secretKey":"xs:string","thruDate":"xs:dateTime","userNumber":"xs:string","uuid":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAlternativeIdentifiersForUser":{"input":{"Token":"xs:string","UserNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"alternativeIdentifierID":"xs:long","created":"xs:dateTime","createdBy":"xs:string","displayName":"xs:string","modified":"xs:dateTime","modifiedBy":"xs:string","provider":"xs:string","secretKey":"xs:string","thruDate":"xs:dateTime","userNumber":"xs:string","uuid":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPeopleDetailsFromEstablishments":{"input":{"Token":"xs:string","SearchDetails[]":{"departmentName":"xs:string","organisationName":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonDTOFromUserNumber":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","orcidId":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsByEncryptedPasswordResetId":{"input":{"token":"xs:string","encryptedResetId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllEuCountries":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"isAccountActive":{"input":{"UserNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllPersonStatuses":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsFromUserNumber":{"input":{"Token":"xs:string","UserNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPeopleDetailsFromSurname":{"input":{"Token":"xs:string","Surname":"xs:string","FuzzySearch":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updateFedIdEndDate":{"input":{"token":"xs:string","fedIdUserName":"xs:string","fedIdLoginPassword":"xs:string","objid":"xs:string","objdomid":"xs:string","expiryDate":"xs:dateTime","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEmergencyContactDTO":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"contact":"xs:string","contactId":"xs:long","dateAdded":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updatePersonByDTOFromSource":{"input":{"token":"xs:string","person":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","orcidId":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"updateSource":"requestSourceDTO|xs:string|DEFAULT,MAILING_API","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}}}}};

      static getInstance(): UOWSSoapClient {
        if (!this.instance) {
          this.instance = new UOWSSoapClient(process.env.EXTERNAL_AUTH_SERVICE_URL);
        }

        return this.instance;
      }

         private constructor(wsdlUrl?: string) {
              if(wsdlUrl == null)
                  this.wsdlUrl = 'https://devapis.facilities.rl.ac.uk/ws/UserOfficeWebService?wsdl';
              else
                  this.wsdlUrl = wsdlUrl;

              this.setClient();
          }



      private setClient() {
        logger.logInfo('Attempting to create UOWS client', {});
        soap.createClient(this.wsdlUrl, (error, client) => {
          if (error) {
            logger.logError('An error occurred while creating the UOWS client', {error: error});
            setTimeout(() => { this.setClient() }, 10000);
            return;
          }
          logger.logInfo('Created UOWS client', {});
          this.client = client
        });
      }

          public async logoutAllSessionsForUser(apiKey: any, emailAddress: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('logoutAllSessionsForUser', apiKey, emailAddress);
                  const requestId = createHash('sha1').update('logoutAllSessionsForUser' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['logoutAllSessionsForUserAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'logoutAllSessionsForUser',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPeopleDetailsFromSurname(Token: any, Surname: any, FuzzySearch: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPeopleDetailsFromSurname', Token, Surname, FuzzySearch);
                  const requestId = createHash('sha1').update('getBasicPeopleDetailsFromSurname' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPeopleDetailsFromSurnameAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPeopleDetailsFromSurname',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getAgeRangeOptions() : Promise<any> {
                  const argsObj = this.makeArgsObj('getAgeRangeOptions');
                  const requestId = createHash('sha1').update('getAgeRangeOptions' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getAgeRangeOptionsAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getAgeRangeOptions',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPersonDetailsByEncryptedId(token: any, encryptedId: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPersonDetailsByEncryptedId', token, encryptedId);
                  const requestId = createHash('sha1').update('getBasicPersonDetailsByEncryptedId' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPersonDetailsByEncryptedIdAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPersonDetailsByEncryptedId',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getSearchableBasicPeopleDetailsFromSurname(Token: any, Surname: any, FuzzySearch: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getSearchableBasicPeopleDetailsFromSurname', Token, Surname, FuzzySearch);
                  const requestId = createHash('sha1').update('getSearchableBasicPeopleDetailsFromSurname' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getSearchableBasicPeopleDetailsFromSurnameAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getSearchableBasicPeopleDetailsFromSurname',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async unlinkAlternativeIdentifierToUser(Token: any, AlternativeIdentifier: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('unlinkAlternativeIdentifierToUser', Token, AlternativeIdentifier);
                  const requestId = createHash('sha1').update('unlinkAlternativeIdentifierToUser' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['unlinkAlternativeIdentifierToUserAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'unlinkAlternativeIdentifierToUser',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getPrivacyDTO(token: any, userNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getPrivacyDTO', token, userNumber);
                  const requestId = createHash('sha1').update('getPrivacyDTO' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getPrivacyDTOAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getPrivacyDTO',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getEstablishmentDTO(establishmentId: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getEstablishmentDTO', establishmentId);
                  const requestId = createHash('sha1').update('getEstablishmentDTO' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getEstablishmentDTOAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getEstablishmentDTO',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getPersonDetailsFromSessionId(SessionId: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getPersonDetailsFromSessionId', SessionId);
                  const requestId = createHash('sha1').update('getPersonDetailsFromSessionId' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getPersonDetailsFromSessionIdAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getPersonDetailsFromSessionId',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getPersonsFacilities(token: any, userNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getPersonsFacilities', token, userNumber);
                  const requestId = createHash('sha1').update('getPersonsFacilities' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getPersonsFacilitiesAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getPersonsFacilities',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getEstablishmentDTOsBySearchDetails(searchDetails: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('getEstablishmentDTOsBySearchDetails', searchDetails);
                  const requestId = createHash('sha1').update('getEstablishmentDTOsBySearchDetails' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getEstablishmentDTOsBySearchDetailsAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getEstablishmentDTOsBySearchDetails',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getPeopleDetailsFromUserNumbers(Token: any, UserNumbers: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('getPeopleDetailsFromUserNumbers', Token, UserNumbers);
                  const requestId = createHash('sha1').update('getPeopleDetailsFromUserNumbers' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getPeopleDetailsFromUserNumbersAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getPeopleDetailsFromUserNumbers',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getSearchableBasicPersonDetailsFromUserNumber(Token: any, UserNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getSearchableBasicPersonDetailsFromUserNumber', Token, UserNumber);
                  const requestId = createHash('sha1').update('getSearchableBasicPersonDetailsFromUserNumber' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getSearchableBasicPersonDetailsFromUserNumberAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getSearchableBasicPersonDetailsFromUserNumber',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async deleteEstablishmentById(Token: any, EstablishmentId: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('deleteEstablishmentById', Token, EstablishmentId);
                  const requestId = createHash('sha1').update('deleteEstablishmentById' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['deleteEstablishmentByIdAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'deleteEstablishmentById',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getAllTitles() : Promise<any> {
                  const argsObj = this.makeArgsObj('getAllTitles');
                  const requestId = createHash('sha1').update('getAllTitles' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getAllTitlesAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getAllTitles',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async updatePersonByDTO(token: any, person: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('updatePersonByDTO', token, person);
                  const requestId = createHash('sha1').update('updatePersonByDTO' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['updatePersonByDTOAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'updatePersonByDTO',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPeopleDetailsFromEmails(Token: any, Emails: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPeopleDetailsFromEmails', Token, Emails);
                  const requestId = createHash('sha1').update('getBasicPeopleDetailsFromEmails' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPeopleDetailsFromEmailsAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPeopleDetailsFromEmails',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async loginWithAlternativeIdentifier(SystemSessionId: any, Uuid: any, Provider: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('loginWithAlternativeIdentifier', SystemSessionId, Uuid, Provider);
                  const requestId = createHash('sha1').update('loginWithAlternativeIdentifier' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['loginWithAlternativeIdentifierAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'loginWithAlternativeIdentifier',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getPersonDTOByMarketingEmail(token: any, marketingEmail: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getPersonDTOByMarketingEmail', token, marketingEmail);
                  const requestId = createHash('sha1').update('getPersonDTOByMarketingEmail' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getPersonDTOByMarketingEmailAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getPersonDTOByMarketingEmail',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getSearchableBasicPeopleDetailsFromUserNumbers(Token: any, UserNumbers: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('getSearchableBasicPeopleDetailsFromUserNumbers', Token, UserNumbers);
                  const requestId = createHash('sha1').update('getSearchableBasicPeopleDetailsFromUserNumbers' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getSearchableBasicPeopleDetailsFromUserNumbersAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getSearchableBasicPeopleDetailsFromUserNumbers',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async isTokenValid(Token: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('isTokenValid', Token);
                  const requestId = createHash('sha1').update('isTokenValid' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['isTokenValidAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'isTokenValid',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getSearchableBasicPeopleDetailsFromEmails(Token: any, Emails: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('getSearchableBasicPeopleDetailsFromEmails', Token, Emails);
                  const requestId = createHash('sha1').update('getSearchableBasicPeopleDetailsFromEmails' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getSearchableBasicPeopleDetailsFromEmailsAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getSearchableBasicPeopleDetailsFromEmails',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async updatePersonsFacilities(token: any, userNumber: any, facilities: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('updatePersonsFacilities', token, userNumber, facilities);
                  const requestId = createHash('sha1').update('updatePersonsFacilities' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['updatePersonsFacilitiesAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'updatePersonsFacilities',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getMonitorDTO(token: any, userNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getMonitorDTO', token, userNumber);
                  const requestId = createHash('sha1').update('getMonitorDTO' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getMonitorDTOAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getMonitorDTO',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async resetPassword(encryptedResetId: any, password: any, ipAddress: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('resetPassword', encryptedResetId, password, ipAddress);
                  const requestId = createHash('sha1').update('resetPassword' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['resetPasswordAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'resetPassword',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getDataUsages() : Promise<any> {
                  const argsObj = this.makeArgsObj('getDataUsages');
                  const requestId = createHash('sha1').update('getDataUsages' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getDataUsagesAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getDataUsages',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async updateEmergencyContactDTO(token: any, userNumber: any, emergencyContactDTO: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('updateEmergencyContactDTO', token, userNumber, emergencyContactDTO);
                  const requestId = createHash('sha1').update('updateEmergencyContactDTO' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['updateEmergencyContactDTOAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'updateEmergencyContactDTO',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async sendAccountActivationEmail(Token: any, Email: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('sendAccountActivationEmail', Token, Email);
                  const requestId = createHash('sha1').update('sendAccountActivationEmail' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['sendAccountActivationEmailAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'sendAccountActivationEmail',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getDisabilities() : Promise<any> {
                  const argsObj = this.makeArgsObj('getDisabilities');
                  const requestId = createHash('sha1').update('getDisabilities' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getDisabilitiesAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getDisabilities',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getEstablishmentsBySearchDetails(searchDetails: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('getEstablishmentsBySearchDetails', searchDetails);
                  const requestId = createHash('sha1').update('getEstablishmentsBySearchDetails' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getEstablishmentsBySearchDetailsAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getEstablishmentsBySearchDetails',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getRolesForUser(token: any, userNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getRolesForUser', token, userNumber);
                  const requestId = createHash('sha1').update('getRolesForUser' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getRolesForUserAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getRolesForUser',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async resetPasswordWithOldPassword(sessionId: any, oldPassword: any, newPassword: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('resetPasswordWithOldPassword', sessionId, oldPassword, newPassword);
                  const requestId = createHash('sha1').update('resetPasswordWithOldPassword' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['resetPasswordWithOldPasswordAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'resetPasswordWithOldPassword',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getUsersPermissionUserGroupDTOs(Token: any, userNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getUsersPermissionUserGroupDTOs', Token, userNumber);
                  const requestId = createHash('sha1').update('getUsersPermissionUserGroupDTOs' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getUsersPermissionUserGroupDTOsAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getUsersPermissionUserGroupDTOs',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async deactivatePerson(token: any, userNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('deactivatePerson', token, userNumber);
                  const requestId = createHash('sha1').update('deactivatePerson' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['deactivatePersonAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'deactivatePerson',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async logout(SessionId: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('logout', SessionId);
                  const requestId = createHash('sha1').update('logout' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['logoutAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'logout',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async setPrivacyDTO(token: any, userNumber: any, privacyDTO: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('setPrivacyDTO', token, userNumber, privacyDTO);
                  const requestId = createHash('sha1').update('setPrivacyDTO' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['setPrivacyDTOAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'setPrivacyDTO',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getChangesSince(Token: any, Since: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getChangesSince', Token, Since);
                  const requestId = createHash('sha1').update('getChangesSince' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getChangesSinceAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getChangesSince',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getGenders() : Promise<any> {
                  const argsObj = this.makeArgsObj('getGenders');
                  const requestId = createHash('sha1').update('getGenders' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getGendersAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getGenders',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async createPersonFromPersonDTO(token: any, person: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('createPersonFromPersonDTO', token, person);
                  const requestId = createHash('sha1').update('createPersonFromPersonDTO' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['createPersonFromPersonDTOAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'createPersonFromPersonDTO',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async detailsCheckNeeded(sessionId: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('detailsCheckNeeded', sessionId);
                  const requestId = createHash('sha1').update('detailsCheckNeeded' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['detailsCheckNeededAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'detailsCheckNeeded',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async loginWithAlternativeIdentifierECP(Provider: any, Username: any, Password: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('loginWithAlternativeIdentifierECP', Provider, Username, Password);
                  const requestId = createHash('sha1').update('loginWithAlternativeIdentifierECP' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['loginWithAlternativeIdentifierECPAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'loginWithAlternativeIdentifierECP',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async updateExpiredPassword(token: any, encryptedId: any, oldPassword: any, newPassword: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('updateExpiredPassword', token, encryptedId, oldPassword, newPassword);
                  const requestId = createHash('sha1').update('updateExpiredPassword' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['updateExpiredPasswordAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'updateExpiredPassword',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getDataLookup(Name: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getDataLookup', Name);
                  const requestId = createHash('sha1').update('getDataLookup' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getDataLookupAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getDataLookup',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async updateAlternativeIdentifiersForUser(Token: any, AlternativeIdentifiers: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('updateAlternativeIdentifiersForUser', Token, AlternativeIdentifiers);
                  const requestId = createHash('sha1').update('updateAlternativeIdentifiersForUser' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['updateAlternativeIdentifiersForUserAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'updateAlternativeIdentifiersForUser',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getTokenDetails(token: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getTokenDetails', token);
                  const requestId = createHash('sha1').update('getTokenDetails' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getTokenDetailsAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getTokenDetails',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async noLdapLogin(UserNumber: any, Password: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('noLdapLogin', UserNumber, Password);
                  const requestId = createHash('sha1').update('noLdapLogin' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['noLdapLoginAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'noLdapLogin',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getFrequentGenders() : Promise<any> {
                  const argsObj = this.makeArgsObj('getFrequentGenders');
                  const requestId = createHash('sha1').update('getFrequentGenders' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getFrequentGendersAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getFrequentGenders',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getEthnicities() : Promise<any> {
                  const argsObj = this.makeArgsObj('getEthnicities');
                  const requestId = createHash('sha1').update('getEthnicities' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getEthnicitiesAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getEthnicities',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPeopleDetailsSinceDate(Token: any, Date: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPeopleDetailsSinceDate', Token, Date);
                  const requestId = createHash('sha1').update('getBasicPeopleDetailsSinceDate' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPeopleDetailsSinceDateAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPeopleDetailsSinceDate',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async createEstablishmentFromEstablishmentDTO(token: any, establishment: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('createEstablishmentFromEstablishmentDTO', token, establishment);
                  const requestId = createHash('sha1').update('createEstablishmentFromEstablishmentDTO' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['createEstablishmentFromEstablishmentDTOAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'createEstablishmentFromEstablishmentDTO',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPersonDetailsByEncryptedActivationId(token: any, encryptedActivationId: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPersonDetailsByEncryptedActivationId', token, encryptedActivationId);
                  const requestId = createHash('sha1').update('getBasicPersonDetailsByEncryptedActivationId' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPersonDetailsByEncryptedActivationIdAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPersonDetailsByEncryptedActivationId',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async requestLinkExistingFedId(token: any, dob: any, userNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('requestLinkExistingFedId', token, dob, userNumber);
                  const requestId = createHash('sha1').update('requestLinkExistingFedId' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['requestLinkExistingFedIdAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'requestLinkExistingFedId',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPersonDetailsFromEmail(Token: any, Email: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPersonDetailsFromEmail', Token, Email);
                  const requestId = createHash('sha1').update('getBasicPersonDetailsFromEmail' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPersonDetailsFromEmailAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPersonDetailsFromEmail',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async requestNewFedId(token: any, dob: any, userNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('requestNewFedId', token, dob, userNumber);
                  const requestId = createHash('sha1').update('requestNewFedId' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['requestNewFedIdAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'requestNewFedId',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async sendPasswordResetEmail(Token: any, Email: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('sendPasswordResetEmail', Token, Email);
                  const requestId = createHash('sha1').update('sendPasswordResetEmail' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['sendPasswordResetEmailAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'sendPasswordResetEmail',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getAllEstablishmentDTOs() : Promise<any> {
                  const argsObj = this.makeArgsObj('getAllEstablishmentDTOs');
                  const requestId = createHash('sha1').update('getAllEstablishmentDTOs' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getAllEstablishmentDTOsAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getAllEstablishmentDTOs',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getEstablishmentDTOsByQuery(searchQuery: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getEstablishmentDTOsByQuery', searchQuery);
                  const requestId = createHash('sha1').update('getEstablishmentDTOsByQuery' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getEstablishmentDTOsByQueryAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getEstablishmentDTOsByQuery',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async acceptLatestDataProtectionAgreement(token: any, encryptedId: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('acceptLatestDataProtectionAgreement', token, encryptedId);
                  const requestId = createHash('sha1').update('acceptLatestDataProtectionAgreement' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['acceptLatestDataProtectionAgreementAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'acceptLatestDataProtectionAgreement',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async setMonitorDTO(token: any, userNumber: any, monitorDTO: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('setMonitorDTO', token, userNumber, monitorDTO);
                  const requestId = createHash('sha1').update('setMonitorDTO' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['setMonitorDTOAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'setMonitorDTO',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async activateAccountWithoutPassword(encryptedActivationId: any, ipAddress: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('activateAccountWithoutPassword', encryptedActivationId, ipAddress);
                  const requestId = createHash('sha1').update('activateAccountWithoutPassword' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['activateAccountWithoutPasswordAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'activateAccountWithoutPassword',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPersonDetailsFromFedId(Token: any, FedId: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPersonDetailsFromFedId', Token, FedId);
                  const requestId = createHash('sha1').update('getBasicPersonDetailsFromFedId' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPersonDetailsFromFedIdAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPersonDetailsFromFedId',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async activateAccount(encryptedActivationId: any, password: any, ipAddress: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('activateAccount', encryptedActivationId, password, ipAddress);
                  const requestId = createHash('sha1').update('activateAccount' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['activateAccountAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'activateAccount',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPeopleDetailsFromUserNumbers(Token: any, UserNumbers: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPeopleDetailsFromUserNumbers', Token, UserNumbers);
                  const requestId = createHash('sha1').update('getBasicPeopleDetailsFromUserNumbers' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPeopleDetailsFromUserNumbersAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPeopleDetailsFromUserNumbers',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getAllCountries() : Promise<any> {
                  const argsObj = this.makeArgsObj('getAllCountries');
                  const requestId = createHash('sha1').update('getAllCountries' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getAllCountriesAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getAllCountries',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getSearchableBasicPersonDetailsFromEmail(Token: any, Email: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getSearchableBasicPersonDetailsFromEmail', Token, Email);
                  const requestId = createHash('sha1').update('getSearchableBasicPersonDetailsFromEmail' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getSearchableBasicPersonDetailsFromEmailAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getSearchableBasicPersonDetailsFromEmail',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getPersonDetailsFromUserNumber(Token: any, UserNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getPersonDetailsFromUserNumber', Token, UserNumber);
                  const requestId = createHash('sha1').update('getPersonDetailsFromUserNumber' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getPersonDetailsFromUserNumberAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getPersonDetailsFromUserNumber',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getPersonDetailsFromEmail(Token: any, Email: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getPersonDetailsFromEmail', Token, Email);
                  const requestId = createHash('sha1').update('getPersonDetailsFromEmail' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getPersonDetailsFromEmailAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getPersonDetailsFromEmail',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async createFedId(token: any, fedIdUserName: any, fedIdLoginPassword: any, person: any, status: any, expiryDate: any, fedIdDob: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('createFedId', token, fedIdUserName, fedIdLoginPassword, person, status, expiryDate, fedIdDob);
                  const requestId = createHash('sha1').update('createFedId' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['createFedIdAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'createFedId',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getAllFacilityNames() : Promise<any> {
                  const argsObj = this.makeArgsObj('getAllFacilityNames');
                  const requestId = createHash('sha1').update('getAllFacilityNames' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getAllFacilityNamesAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getAllFacilityNames',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getPeopleDetailsFromEmails(Token: any, Emails: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('getPeopleDetailsFromEmails', Token, Emails);
                  const requestId = createHash('sha1').update('getPeopleDetailsFromEmails' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getPeopleDetailsFromEmailsAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getPeopleDetailsFromEmails',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async isAlternativeIdentifierActive(Uuid: any, Provider: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('isAlternativeIdentifierActive', Uuid, Provider);
                  const requestId = createHash('sha1').update('isAlternativeIdentifierActive' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['isAlternativeIdentifierActiveAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'isAlternativeIdentifierActive',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async isAlternativeIdentifierLinked(Uuid: any, Provider: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('isAlternativeIdentifierLinked', Uuid, Provider);
                  const requestId = createHash('sha1').update('isAlternativeIdentifierLinked' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['isAlternativeIdentifierLinkedAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'isAlternativeIdentifierLinked',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async login(Account: any, Password: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('login', Account, Password);
                  const requestId = createHash('sha1').update('login' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['loginAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'login',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async linkAlternativeIdentifierToUser(Token: any, AlternativeIdentifier: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('linkAlternativeIdentifierToUser', Token, AlternativeIdentifier);
                  const requestId = createHash('sha1').update('linkAlternativeIdentifierToUser' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['linkAlternativeIdentifierToUserAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'linkAlternativeIdentifierToUser',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getAlternativeIdentifiersForUser(Token: any, UserNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getAlternativeIdentifiersForUser', Token, UserNumber);
                  const requestId = createHash('sha1').update('getAlternativeIdentifiersForUser' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getAlternativeIdentifiersForUserAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getAlternativeIdentifiersForUser',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPeopleDetailsFromEstablishments(Token: any, SearchDetails: any[]) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPeopleDetailsFromEstablishments', Token, SearchDetails);
                  const requestId = createHash('sha1').update('getBasicPeopleDetailsFromEstablishments' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPeopleDetailsFromEstablishmentsAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPeopleDetailsFromEstablishments',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getPersonDTOFromUserNumber(token: any, userNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getPersonDTOFromUserNumber', token, userNumber);
                  const requestId = createHash('sha1').update('getPersonDTOFromUserNumber' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getPersonDTOFromUserNumberAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getPersonDTOFromUserNumber',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPersonDetailsByEncryptedPasswordResetId(token: any, encryptedResetId: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPersonDetailsByEncryptedPasswordResetId', token, encryptedResetId);
                  const requestId = createHash('sha1').update('getBasicPersonDetailsByEncryptedPasswordResetId' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPersonDetailsByEncryptedPasswordResetIdAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPersonDetailsByEncryptedPasswordResetId',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getAllEuCountries() : Promise<any> {
                  const argsObj = this.makeArgsObj('getAllEuCountries');
                  const requestId = createHash('sha1').update('getAllEuCountries' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getAllEuCountriesAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getAllEuCountries',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async isAccountActive(UserNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('isAccountActive', UserNumber);
                  const requestId = createHash('sha1').update('isAccountActive' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['isAccountActiveAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'isAccountActive',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getAllPersonStatuses() : Promise<any> {
                  const argsObj = this.makeArgsObj('getAllPersonStatuses');
                  const requestId = createHash('sha1').update('getAllPersonStatuses' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getAllPersonStatusesAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getAllPersonStatuses',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getBasicPersonDetailsFromUserNumber(Token: any, UserNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getBasicPersonDetailsFromUserNumber', Token, UserNumber);
                  const requestId = createHash('sha1').update('getBasicPersonDetailsFromUserNumber' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getBasicPersonDetailsFromUserNumberAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getBasicPersonDetailsFromUserNumber',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getPeopleDetailsFromSurname(Token: any, Surname: any, FuzzySearch: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getPeopleDetailsFromSurname', Token, Surname, FuzzySearch);
                  const requestId = createHash('sha1').update('getPeopleDetailsFromSurname' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getPeopleDetailsFromSurnameAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getPeopleDetailsFromSurname',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async updateFedIdEndDate(token: any, fedIdUserName: any, fedIdLoginPassword: any, objid: any, objdomid: any, expiryDate: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('updateFedIdEndDate', token, fedIdUserName, fedIdLoginPassword, objid, objdomid, expiryDate);
                  const requestId = createHash('sha1').update('updateFedIdEndDate' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['updateFedIdEndDateAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'updateFedIdEndDate',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async getEmergencyContactDTO(token: any, userNumber: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('getEmergencyContactDTO', token, userNumber);
                  const requestId = createHash('sha1').update('getEmergencyContactDTO' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['getEmergencyContactDTOAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'getEmergencyContactDTO',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }

    public async updatePersonByDTOFromSource(token: any, person: any, updateSource: any) : Promise<any> {
                  const argsObj = this.makeArgsObj('updatePersonByDTOFromSource', token, person, updateSource);
                  const requestId = createHash('sha1').update('updatePersonByDTOFromSource' + JSON.stringify(argsObj)).digest('base64');

                  const activeUowsRequest = this.activeUowsRequests.get(requestId);
                  if (activeUowsRequest) {
                    return activeUowsRequest;
                  }

                  const refinedResult = this.client['updatePersonByDTOFromSourceAsync'](argsObj).then((result: any) => {
                      return result[0];
                  }).catch((result: any) => {
                      const response = result?.response;
                      const exceptionMessage = response?.data?.match("<faultstring>(.*)</faultstring>")[1];
                      logger.logWarn("A call to the UserOfficeWebService returned an exception: ", {
                          exceptionMessage: exceptionMessage,
                          method: 'updatePersonByDTOFromSource',
                          serviceUrl: response?.config?.url,
                          rawResponse: response?.data
                      });

                      throw (exceptionMessage) ? exceptionMessage : "Error while calling UserOfficeWebService";
                  }).finally(() => {
                    this.activeUowsRequests.delete(requestId);
                  });
                  this.activeUowsRequests.set(requestId, refinedResult);

                  return refinedResult;
              }



         private makeArgsObj(functName: string, ...args: any[]) {
              const argsObj : {[key: string]: any} = {};
              const serviceDesc = this.wsdlDesc[Object.keys(this.wsdlDesc)[0]];
              const collectionOfFunctions = serviceDesc[Object.keys(serviceDesc)[0]];
              const argsDescr = collectionOfFunctions[functName];
  
              Object.keys(argsDescr.input).forEach((element: string, index: number) => {
                  if (element !== 'targetNSAlias' && element !== 'targetNamespace') {
                      const argName: string = element.replace('[]', '');
                      argsObj[argName] = args[index];
                  }
              });
              return argsObj;
          }


    }
  
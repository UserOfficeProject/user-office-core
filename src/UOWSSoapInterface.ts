import * as soap from "soap";

export default class UOWSSoapClient {

private wsdlUrl: string;
private wsdlDesc: any = {"UserOfficeWebService":{"UserOfficeWebServicePort":{"getBasicPeopleDetailsFromSurname":{"input":{"Token":"xs:string","Surname":"xs:string","FuzzySearch":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAgeRangeOptions":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsByEncryptedId":{"input":{"token":"xs:string","encryptedId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getSearchableBasicPeopleDetailsFromSurname":{"input":{"Token":"xs:string","Surname":"xs:string","FuzzySearch":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"unlinkAlternativeIdentifierToUser":{"input":{"Token":"xs:string","AlternativeIdentifier":{"created":"xs:dateTime","createdBy":"xs:string","displayName":"xs:string","modified":"xs:dateTime","modifiedBy":"xs:string","provider":"xs:string","secretKey":"xs:string","thruDate":"xs:dateTime","userNumber":"xs:string","uuid":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPrivacyDTO":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"searchable":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEstablishmentDTO":{"input":{"establishmentId":"xs:long","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"buildingName":"xs:string","buildingNumber":"xs:string","cityTown":"xs:string","country":"xs:string","countyProvinceState":"xs:string","deptAccronym":"xs:string","deptName":"xs:string","district":"xs:string","establishmentId":"xs:long","orgAcronym":"xs:string","orgName":"xs:string","poBox":"xs:string","postalCode":"xs:string","site":"xs:string","street":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonDetailsFromSessionId":{"input":{"SessionId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonsFacilities":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEstablishmentDTOsBySearchDetails":{"input":{"searchDetails[]":{"departmentName":"xs:string","organisationName":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"buildingName":"xs:string","buildingNumber":"xs:string","cityTown":"xs:string","country":"xs:string","countyProvinceState":"xs:string","deptAccronym":"xs:string","deptName":"xs:string","district":"xs:string","establishmentId":"xs:long","orgAcronym":"xs:string","orgName":"xs:string","poBox":"xs:string","postalCode":"xs:string","site":"xs:string","street":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPeopleDetailsFromUserNumbers":{"input":{"Token":"xs:string","UserNumbers[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getSearchableBasicPersonDetailsFromUserNumber":{"input":{"Token":"xs:string","UserNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"deleteEstablishmentById":{"input":{"Token":"xs:string","EstablishmentId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllTitles":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updatePersonByDTO":{"input":{"token":"xs:string","person":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPeopleDetailsFromEmails":{"input":{"Token":"xs:string","Emails[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"loginWithAlternativeIdentifier":{"input":{"SystemSessionId":"xs:string","Uuid":"xs:string","Provider":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonDTOByMarketingEmail":{"input":{"token":"xs:string","marketingEmail":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getSearchableBasicPeopleDetailsFromUserNumbers":{"input":{"Token":"xs:string","UserNumbers[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"isTokenValid":{"input":{"Token":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getSearchableBasicPeopleDetailsFromEmails":{"input":{"Token":"xs:string","Emails[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updatePersonsFacilities":{"input":{"token":"xs:string","userNumber":"xs:string","facilities[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getMonitorDTO":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"ageOption":"xs:string","disability":"xs:string","ethnicity":"xs:string","gender":"xs:string","optIn":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"resetPassword":{"input":{"encryptedResetId":"xs:string","password":"xs:string","ipAddress":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getDataUsages":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"name":"xs:string","value":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updateEmergencyContactDTO":{"input":{"token":"xs:string","userNumber":"xs:string","emergencyContactDTO":{"contact":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"sendAccountActivationEmail":{"input":{"Token":"xs:string","Email":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getDisabilities":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEstablishmentsBySearchDetails":{"input":{"searchDetails[]":{"departmentName":"xs:string","organisationName":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"departmentAcronym":"xs:string","departmentName":"xs:string","departmentUrl":"xs:string","establishmentId":"xs:long","groupAcronym":"xs:string","groupName":"xs:string","organisationAcronym":"xs:string","organisationName":"xs:string","organisationType":"xs:string","organisationUrl":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getRolesForUser":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"name":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"resetPasswordWithOldPassword":{"input":{"sessionId":"xs:string","oldPassword":"xs:string","newPassword":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getUsersPermissionUserGroupDTOs":{"input":{"Token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"comments":"xs:string","groupName":"xs:string","id":"xs:long","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"deactivatePerson":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"logout":{"input":{"SessionId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"setPrivacyDTO":{"input":{"token":"xs:string","userNumber":"xs:string","privacyDTO":{"searchable":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getChangesSince":{"input":{"Token":"xs:string","Since":"xs:dateTime","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"comments":"xs:string","deactivated":"xs:boolean","dpaDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"givenName":"xs:string","initials":"xs:string","isisSalt":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastpwdreset":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","monitorId":"xs:long","newUserNumber":"xs:string","privacyId":"xs:long","rid":"xs:long","sha2":"xs:string","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","updated":"xs:string","userNumber":"xs:string","verified":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getGenders":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"createPersonFromPersonDTO":{"input":{"token":"xs:string","person":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getInductionsSafetyTestsFacilityAwarenessForUser":{"input":{"arg0":"xs:string","arg1":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"facilities[]":"xs:string","inductions[]":{"course":"xs:string","dateTaken":"xs:dateTime","id":"xs:long","modifiedBy":"xs:string","modifiedByName":"xs:string","modifiedDate":"xs:dateTime","thruDate":"xs:dateTime","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"loginWithAlternativeIdentifierECP":{"input":{"Provider":"xs:string","Username":"xs:string","Password":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updateExpiredPassword":{"input":{"token":"xs:string","encryptedId":"xs:string","oldPassword":"xs:string","newPassword":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getDataLookup":{"input":{"Name":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updateAlternativeIdentifiersForUser":{"input":{"Token":"xs:string","AlternativeIdentifiers[]":{"created":"xs:dateTime","createdBy":"xs:string","displayName":"xs:string","modified":"xs:dateTime","modifiedBy":"xs:string","provider":"xs:string","secretKey":"xs:string","thruDate":"xs:dateTime","userNumber":"xs:string","uuid":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"noLdapLogin":{"input":{"UserNumber":"xs:string","Password":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEthnicities":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPeopleDetailsSinceDate":{"input":{"Token":"xs:string","Date":"xs:dateTime","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"createEstablishmentFromEstablishmentDTO":{"input":{"token":"xs:string","establishment":{"buildingName":"xs:string","buildingNumber":"xs:string","cityTown":"xs:string","country":"xs:string","countyProvinceState":"xs:string","deptAccronym":"xs:string","deptName":"xs:string","district":"xs:string","establishmentId":"xs:long","orgAcronym":"xs:string","orgName":"xs:string","poBox":"xs:string","postalCode":"xs:string","site":"xs:string","street":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:long","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsByEncryptedActivationId":{"input":{"token":"xs:string","encryptedActivationId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"requestLinkExistingFedId":{"input":{"token":"xs:string","dob":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsFromEmail":{"input":{"Token":"xs:string","Email":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"requestNewFedId":{"input":{"token":"xs:string","dob":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"sendPasswordResetEmail":{"input":{"Token":"xs:string","Email":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllEstablishmentDTOs":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"buildingName":"xs:string","buildingNumber":"xs:string","cityTown":"xs:string","country":"xs:string","countyProvinceState":"xs:string","deptAccronym":"xs:string","deptName":"xs:string","district":"xs:string","establishmentId":"xs:long","orgAcronym":"xs:string","orgName":"xs:string","poBox":"xs:string","postalCode":"xs:string","site":"xs:string","street":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEstablishmentDTOsByQuery":{"input":{"searchQuery":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"buildingName":"xs:string","buildingNumber":"xs:string","cityTown":"xs:string","country":"xs:string","countyProvinceState":"xs:string","deptAccronym":"xs:string","deptName":"xs:string","district":"xs:string","establishmentId":"xs:long","orgAcronym":"xs:string","orgName":"xs:string","poBox":"xs:string","postalCode":"xs:string","site":"xs:string","street":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"acceptLatestDataProtectionAgreement":{"input":{"token":"xs:string","encryptedId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"setMonitorDTO":{"input":{"token":"xs:string","userNumber":"xs:string","monitorDTO":{"ageOption":"xs:string","disability":"xs:string","ethnicity":"xs:string","gender":"xs:string","optIn":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"activateAccountWithoutPassword":{"input":{"encryptedActivationId":"xs:string","ipAddress":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsFromFedId":{"input":{"Token":"xs:string","FedId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"activateAccount":{"input":{"encryptedActivationId":"xs:string","password":"xs:string","ipAddress":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPeopleDetailsFromUserNumbers":{"input":{"Token":"xs:string","UserNumbers[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllCountries":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getSearchableBasicPersonDetailsFromEmail":{"input":{"Token":"xs:string","Email":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonDetailsFromUserNumber":{"input":{"Token":"xs:string","UserNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonDetailsFromEmail":{"input":{"Token":"xs:string","Email":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"createFedId":{"input":{"token":"xs:string","fedIdUserName":"xs:string","fedIdLoginPassword":"xs:string","person":{"comments":"xs:string","deactivated":"xs:boolean","dpaDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"givenName":"xs:string","initials":"xs:string","isisSalt":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastpwdreset":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","monitorId":"xs:long","newUserNumber":"xs:string","privacyId":"xs:long","rid":"xs:long","sha2":"xs:string","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","updated":"xs:string","userNumber":"xs:string","verified":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"status":"xs:string","expiryDate":"xs:dateTime","fedIdDob":"xs:dateTime","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllFacilityNames":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPeopleDetailsFromEmails":{"input":{"Token":"xs:string","Emails[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"isAlternativeIdentifierActive":{"input":{"Uuid":"xs:string","Provider":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"isAlternativeIdentifierLinked":{"input":{"Uuid":"xs:string","Provider":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"login":{"input":{"Account":"xs:string","Password":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"linkAlternativeIdentifierToUser":{"input":{"Token":"xs:string","AlternativeIdentifier":{"created":"xs:dateTime","createdBy":"xs:string","displayName":"xs:string","modified":"xs:dateTime","modifiedBy":"xs:string","provider":"xs:string","secretKey":"xs:string","thruDate":"xs:dateTime","userNumber":"xs:string","uuid":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAlternativeIdentifiersForUser":{"input":{"Token":"xs:string","UserNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"created":"xs:dateTime","createdBy":"xs:string","displayName":"xs:string","modified":"xs:dateTime","modifiedBy":"xs:string","provider":"xs:string","secretKey":"xs:string","thruDate":"xs:dateTime","userNumber":"xs:string","uuid":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPeopleDetailsFromEstablishments":{"input":{"Token":"xs:string","SearchDetails[]":{"departmentName":"xs:string","organisationName":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPersonDTOFromUserNumber":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsByEncryptedPasswordResetId":{"input":{"token":"xs:string","encryptedResetId":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllEuCountries":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"isAccountActive":{"input":{"UserNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getAllPersonStatuses":{"input":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getBasicPersonDetailsFromUserNumber":{"input":{"Token":"xs:string","UserNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","establishmentId":"xs:string","familyName":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getPeopleDetailsFromSurname":{"input":{"Token":"xs:string","Surname":"xs:string","FuzzySearch":"xs:boolean","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return[]":{"country":"xs:string","deptAcronym":"xs:string","deptName":"xs:string","displayName":"xs:string","email":"xs:string","emergencyContact":"xs:string","establishmentId":"xs:string","familyName":"xs:string","fedId":"xs:string","firstNameKnownAs":"xs:string","fullName":"xs:string","givenName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"mobilePhone":"xs:string","orgAcronym":"xs:string","orgName":"xs:string","status":"xs:string","title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"getEmergencyContactDTO":{"input":{"token":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":{"contact":"xs:string","userNumber":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updateFedId":{"input":{"token":"xs:string","fedIdUserName":"xs:string","fedIdLoginPassword":"xs:string","objid":"xs:string","objdomid":"xs:string","expiryDate":"xs:dateTime","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"return":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}},"updatePersonByDTOFromSource":{"input":{"token":"xs:string","person":{"deactivated":"xs:boolean","displayName":"xs:string","dpaDate":"xs:dateTime","email":"xs:string","establishmentId":"xs:long","familyName":"xs:string","fedId":"xs:string","firstName":"xs:string","firstNameKnownAs":"xs:string","fromDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"fullName":"xs:string","initials":"xs:string","joinedDate":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"lastAccessTime":{"nanos":"xs:int","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"marketingEmail":"xs:string","mobilePhone":"xs:string","resetPasswordDate":"xs:dateTime","rid":"xs:long","status":"xs:string","subscribedToMarketingEmails":"xs:boolean","thruDate":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"title":"xs:string","userNumber":"xs:string","workPhone":"xs:string","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"updateSource":"requestSourceDTO|xs:string|DEFAULT,MAILING_API","targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"},"output":{"targetNSAlias":"tns","targetNamespace":"http://webservice.UserOffice.stfc.com/"}}}}};

   public constructor(wsdlUrl?: string) {
            if(wsdlUrl == null)
                this.wsdlUrl = 'https://api.facilities.rl.ac.uk/ws/UserOfficeWebService?wsdl';
            else
                this.wsdlUrl = wsdlUrl;
        }

    public getBasicPeopleDetailsFromSurname(Token: any, Surname: any, FuzzySearch: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPeopleDetailsFromSurname", Token, Surname, FuzzySearch);
                        return client["getBasicPeopleDetailsFromSurnameAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getAgeRangeOptions(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getAgeRangeOptions");
                        return client["getAgeRangeOptionsAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getBasicPersonDetailsByEncryptedId(token: any, encryptedId: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPersonDetailsByEncryptedId", token, encryptedId);
                        return client["getBasicPersonDetailsByEncryptedIdAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getSearchableBasicPeopleDetailsFromSurname(Token: any, Surname: any, FuzzySearch: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getSearchableBasicPeopleDetailsFromSurname", Token, Surname, FuzzySearch);
                        return client["getSearchableBasicPeopleDetailsFromSurnameAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public unlinkAlternativeIdentifierToUser(Token: any, AlternativeIdentifier: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("unlinkAlternativeIdentifierToUser", Token, AlternativeIdentifier);
                        return client["unlinkAlternativeIdentifierToUserAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getPrivacyDTO(token: any, userNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getPrivacyDTO", token, userNumber);
                        return client["getPrivacyDTOAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getEstablishmentDTO(establishmentId: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getEstablishmentDTO", establishmentId);
                        return client["getEstablishmentDTOAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getPersonDetailsFromSessionId(SessionId: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getPersonDetailsFromSessionId", SessionId);
                        return client["getPersonDetailsFromSessionIdAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getPersonsFacilities(token: any, userNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getPersonsFacilities", token, userNumber);
                        return client["getPersonsFacilitiesAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getEstablishmentDTOsBySearchDetails(searchDetails: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getEstablishmentDTOsBySearchDetails", searchDetails);
                        return client["getEstablishmentDTOsBySearchDetailsAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getPeopleDetailsFromUserNumbers(Token: any, UserNumbers: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getPeopleDetailsFromUserNumbers", Token, UserNumbers);
                        return client["getPeopleDetailsFromUserNumbersAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getSearchableBasicPersonDetailsFromUserNumber(Token: any, UserNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getSearchableBasicPersonDetailsFromUserNumber", Token, UserNumber);
                        return client["getSearchableBasicPersonDetailsFromUserNumberAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public deleteEstablishmentById(Token: any, EstablishmentId: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("deleteEstablishmentById", Token, EstablishmentId);
                        return client["deleteEstablishmentByIdAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getAllTitles(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getAllTitles");
                        return client["getAllTitlesAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public updatePersonByDTO(token: any, person: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("updatePersonByDTO", token, person);
                        return client["updatePersonByDTOAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getBasicPeopleDetailsFromEmails(Token: any, Emails: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPeopleDetailsFromEmails", Token, Emails);
                        return client["getBasicPeopleDetailsFromEmailsAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public loginWithAlternativeIdentifier(SystemSessionId: any, Uuid: any, Provider: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("loginWithAlternativeIdentifier", SystemSessionId, Uuid, Provider);
                        return client["loginWithAlternativeIdentifierAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getPersonDTOByMarketingEmail(token: any, marketingEmail: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getPersonDTOByMarketingEmail", token, marketingEmail);
                        return client["getPersonDTOByMarketingEmailAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getSearchableBasicPeopleDetailsFromUserNumbers(Token: any, UserNumbers: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getSearchableBasicPeopleDetailsFromUserNumbers", Token, UserNumbers);
                        return client["getSearchableBasicPeopleDetailsFromUserNumbersAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public isTokenValid(Token: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("isTokenValid", Token);
                        return client["isTokenValidAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getSearchableBasicPeopleDetailsFromEmails(Token: any, Emails: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getSearchableBasicPeopleDetailsFromEmails", Token, Emails);
                        return client["getSearchableBasicPeopleDetailsFromEmailsAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public updatePersonsFacilities(token: any, userNumber: any, facilities: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("updatePersonsFacilities", token, userNumber, facilities);
                        return client["updatePersonsFacilitiesAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getMonitorDTO(token: any, userNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getMonitorDTO", token, userNumber);
                        return client["getMonitorDTOAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public resetPassword(encryptedResetId: any, password: any, ipAddress: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("resetPassword", encryptedResetId, password, ipAddress);
                        return client["resetPasswordAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getDataUsages(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getDataUsages");
                        return client["getDataUsagesAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public updateEmergencyContactDTO(token: any, userNumber: any, emergencyContactDTO: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("updateEmergencyContactDTO", token, userNumber, emergencyContactDTO);
                        return client["updateEmergencyContactDTOAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public sendAccountActivationEmail(Token: any, Email: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("sendAccountActivationEmail", Token, Email);
                        return client["sendAccountActivationEmailAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getDisabilities(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getDisabilities");
                        return client["getDisabilitiesAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getEstablishmentsBySearchDetails(searchDetails: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getEstablishmentsBySearchDetails", searchDetails);
                        return client["getEstablishmentsBySearchDetailsAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getRolesForUser(token: any, userNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getRolesForUser", token, userNumber);
                        return client["getRolesForUserAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public resetPasswordWithOldPassword(sessionId: any, oldPassword: any, newPassword: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("resetPasswordWithOldPassword", sessionId, oldPassword, newPassword);
                        return client["resetPasswordWithOldPasswordAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getUsersPermissionUserGroupDTOs(Token: any, userNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getUsersPermissionUserGroupDTOs", Token, userNumber);
                        return client["getUsersPermissionUserGroupDTOsAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public deactivatePerson(token: any, userNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("deactivatePerson", token, userNumber);
                        return client["deactivatePersonAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public logout(SessionId: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("logout", SessionId);
                        return client["logoutAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public setPrivacyDTO(token: any, userNumber: any, privacyDTO: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("setPrivacyDTO", token, userNumber, privacyDTO);
                        return client["setPrivacyDTOAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getChangesSince(Token: any, Since: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getChangesSince", Token, Since);
                        return client["getChangesSinceAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getGenders(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getGenders");
                        return client["getGendersAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public createPersonFromPersonDTO(token: any, person: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("createPersonFromPersonDTO", token, person);
                        return client["createPersonFromPersonDTOAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getInductionsSafetyTestsFacilityAwarenessForUser(arg0: any, arg1: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getInductionsSafetyTestsFacilityAwarenessForUser", arg0, arg1);
                        return client["getInductionsSafetyTestsFacilityAwarenessForUserAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public loginWithAlternativeIdentifierECP(Provider: any, Username: any, Password: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("loginWithAlternativeIdentifierECP", Provider, Username, Password);
                        return client["loginWithAlternativeIdentifierECPAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public updateExpiredPassword(token: any, encryptedId: any, oldPassword: any, newPassword: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("updateExpiredPassword", token, encryptedId, oldPassword, newPassword);
                        return client["updateExpiredPasswordAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getDataLookup(Name: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getDataLookup", Name);
                        return client["getDataLookupAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public updateAlternativeIdentifiersForUser(Token: any, AlternativeIdentifiers: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("updateAlternativeIdentifiersForUser", Token, AlternativeIdentifiers);
                        return client["updateAlternativeIdentifiersForUserAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public noLdapLogin(UserNumber: any, Password: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("noLdapLogin", UserNumber, Password);
                        return client["noLdapLoginAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getEthnicities(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getEthnicities");
                        return client["getEthnicitiesAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getBasicPeopleDetailsSinceDate(Token: any, Date: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPeopleDetailsSinceDate", Token, Date);
                        return client["getBasicPeopleDetailsSinceDateAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public createEstablishmentFromEstablishmentDTO(token: any, establishment: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("createEstablishmentFromEstablishmentDTO", token, establishment);
                        return client["createEstablishmentFromEstablishmentDTOAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getBasicPersonDetailsByEncryptedActivationId(token: any, encryptedActivationId: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPersonDetailsByEncryptedActivationId", token, encryptedActivationId);
                        return client["getBasicPersonDetailsByEncryptedActivationIdAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public requestLinkExistingFedId(token: any, dob: any, userNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("requestLinkExistingFedId", token, dob, userNumber);
                        return client["requestLinkExistingFedIdAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getBasicPersonDetailsFromEmail(Token: any, Email: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPersonDetailsFromEmail", Token, Email);
                        return client["getBasicPersonDetailsFromEmailAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public requestNewFedId(token: any, dob: any, userNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("requestNewFedId", token, dob, userNumber);
                        return client["requestNewFedIdAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public sendPasswordResetEmail(Token: any, Email: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("sendPasswordResetEmail", Token, Email);
                        return client["sendPasswordResetEmailAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getAllEstablishmentDTOs(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getAllEstablishmentDTOs");
                        return client["getAllEstablishmentDTOsAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getEstablishmentDTOsByQuery(searchQuery: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getEstablishmentDTOsByQuery", searchQuery);
                        return client["getEstablishmentDTOsByQueryAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public acceptLatestDataProtectionAgreement(token: any, encryptedId: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("acceptLatestDataProtectionAgreement", token, encryptedId);
                        return client["acceptLatestDataProtectionAgreementAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public setMonitorDTO(token: any, userNumber: any, monitorDTO: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("setMonitorDTO", token, userNumber, monitorDTO);
                        return client["setMonitorDTOAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public activateAccountWithoutPassword(encryptedActivationId: any, ipAddress: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("activateAccountWithoutPassword", encryptedActivationId, ipAddress);
                        return client["activateAccountWithoutPasswordAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getBasicPersonDetailsFromFedId(Token: any, FedId: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPersonDetailsFromFedId", Token, FedId);
                        return client["getBasicPersonDetailsFromFedIdAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public activateAccount(encryptedActivationId: any, password: any, ipAddress: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("activateAccount", encryptedActivationId, password, ipAddress);
                        return client["activateAccountAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getBasicPeopleDetailsFromUserNumbers(Token: any, UserNumbers: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPeopleDetailsFromUserNumbers", Token, UserNumbers);
                        return client["getBasicPeopleDetailsFromUserNumbersAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getAllCountries(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getAllCountries");
                        return client["getAllCountriesAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getSearchableBasicPersonDetailsFromEmail(Token: any, Email: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getSearchableBasicPersonDetailsFromEmail", Token, Email);
                        return client["getSearchableBasicPersonDetailsFromEmailAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getPersonDetailsFromUserNumber(Token: any, UserNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getPersonDetailsFromUserNumber", Token, UserNumber);
                        return client["getPersonDetailsFromUserNumberAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getPersonDetailsFromEmail(Token: any, Email: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getPersonDetailsFromEmail", Token, Email);
                        return client["getPersonDetailsFromEmailAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public createFedId(token: any, fedIdUserName: any, fedIdLoginPassword: any, person: any, status: any, expiryDate: any, fedIdDob: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("createFedId", token, fedIdUserName, fedIdLoginPassword, person, status, expiryDate, fedIdDob);
                        return client["createFedIdAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getAllFacilityNames(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getAllFacilityNames");
                        return client["getAllFacilityNamesAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getPeopleDetailsFromEmails(Token: any, Emails: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getPeopleDetailsFromEmails", Token, Emails);
                        return client["getPeopleDetailsFromEmailsAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public isAlternativeIdentifierActive(Uuid: any, Provider: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("isAlternativeIdentifierActive", Uuid, Provider);
                        return client["isAlternativeIdentifierActiveAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public isAlternativeIdentifierLinked(Uuid: any, Provider: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("isAlternativeIdentifierLinked", Uuid, Provider);
                        return client["isAlternativeIdentifierLinkedAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public login(Account: any, Password: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("login", Account, Password);
                        return client["loginAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public linkAlternativeIdentifierToUser(Token: any, AlternativeIdentifier: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("linkAlternativeIdentifierToUser", Token, AlternativeIdentifier);
                        return client["linkAlternativeIdentifierToUserAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getAlternativeIdentifiersForUser(Token: any, UserNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getAlternativeIdentifiersForUser", Token, UserNumber);
                        return client["getAlternativeIdentifiersForUserAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getBasicPeopleDetailsFromEstablishments(Token: any, SearchDetails: any[]): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPeopleDetailsFromEstablishments", Token, SearchDetails);
                        return client["getBasicPeopleDetailsFromEstablishmentsAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getPersonDTOFromUserNumber(token: any, userNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getPersonDTOFromUserNumber", token, userNumber);
                        return client["getPersonDTOFromUserNumberAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getBasicPersonDetailsByEncryptedPasswordResetId(token: any, encryptedResetId: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPersonDetailsByEncryptedPasswordResetId", token, encryptedResetId);
                        return client["getBasicPersonDetailsByEncryptedPasswordResetIdAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getAllEuCountries(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getAllEuCountries");
                        return client["getAllEuCountriesAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public isAccountActive(UserNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("isAccountActive", UserNumber);
                        return client["isAccountActiveAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getAllPersonStatuses(): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getAllPersonStatuses");
                        return client["getAllPersonStatusesAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getBasicPersonDetailsFromUserNumber(Token: any, UserNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getBasicPersonDetailsFromUserNumber", Token, UserNumber);
                        return client["getBasicPersonDetailsFromUserNumberAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getPeopleDetailsFromSurname(Token: any, Surname: any, FuzzySearch: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getPeopleDetailsFromSurname", Token, Surname, FuzzySearch);
                        return client["getPeopleDetailsFromSurnameAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public getEmergencyContactDTO(token: any, userNumber: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("getEmergencyContactDTO", token, userNumber);
                        return client["getEmergencyContactDTOAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public updateFedId(token: any, fedIdUserName: any, fedIdLoginPassword: any, objid: any, objdomid: any, expiryDate: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("updateFedId", token, fedIdUserName, fedIdLoginPassword, objid, objdomid, expiryDate);
                        return client["updateFedIdAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

    public updatePersonByDTOFromSource(token: any, person: any, updateSource: any): any {
                    let refinedResult: any =
                    soap.createClientAsync(this.wsdlUrl).then((client: soap.Client) => {
                        let argsObj: any = this.makeArgsObj("updatePersonByDTOFromSource", token, person, updateSource);
                        return client["updatePersonByDTOFromSourceAsync"](argsObj);
                    }).then((result: any) => {
                        return result[0];
                    }).catch((err: any) => {
                        console.error(err);
                    });

                    return refinedResult;
                }

   private makeArgsObj(functName: string, ...args: any[]): any {
            let argsObj: any = {};
            let serviceDesc: any = this.wsdlDesc[Object.keys(this.wsdlDesc)[0]];
            let collectionOfFunctions: any = serviceDesc[Object.keys(serviceDesc)[0]];
            let argsDescr: any = collectionOfFunctions[functName];

            Object.keys(argsDescr.input).forEach((element: string, index: number) => {
                if (element !== 'targetNSAlias' && element !== 'targetNamespace') {
                    let argName: string = element.replace('[]', '');
                    argsObj[argName] = args[index];
                }
            });
            return argsObj;
        }


}
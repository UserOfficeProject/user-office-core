/**
 * Add ticket request
 * @param proposalTitle proposal title
 * @param containerId  container id
 * @param experimentStartDate experiment start date
 * @param experimentEndDate experiment end date
 * @param dateRequested experiment date requested
 * @returns the SOAP request
 */
const getRequest = (
  proposalId: string,
  proposalTitle: string,
  containerId: string,
  experimentStartDate: Date,
  experimentEndDate: Date,
  dateRequested: Date,
  localContactEmail: string,
  location: string
) => `<?xml version="1.0" encoding="utf-8"?>
<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Header>
		<Tenant>DS_MP_1</Tenant>
		<SessionScenario xmlns="http://schemas.datastream.net/headers">terminate</SessionScenario>
		<Organization xmlns="http://schemas.datastream.net/headers">ESS</Organization>
	</Header>
  <Body>
    <MP3640_AddCaseManagement_001 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" verb="Add" noun="CaseManagement" version="001" xmlns="http://schemas.datastream.net/MP_functions/MP3640_001">     
      <CaseManagement recordid="1" has_department_security="has_1" is_enhancedplanning_task="is_e1" is_casehavetasks="is_c1" xmlns="http://schemas.datastream.net/MP_entities/CaseManagement_001">
        <CASEID xmlns="http://schemas.datastream.net/MP_fields">
          <CASECODE></CASECODE>
          <ORGANIZATIONID entity="User">
            <ORGANIZATIONCODE>ESS</ORGANIZATIONCODE>            
          </ORGANIZATIONID>
          <DESCRIPTION>${proposalTitle.substr(0, 80)}</DESCRIPTION>
        </CASEID>
        <EQUIPMENTID xmlns="http://schemas.datastream.net/MP_fields">
          <EQUIPMENTCODE>${containerId}</EQUIPMENTCODE>
          <ORGANIZATIONID entity="Organization">
            <ORGANIZATIONCODE>ESS</ORGANIZATIONCODE>            
          </ORGANIZATIONID>          
        </EQUIPMENTID>
        <CASETYPE entity="User" xmlns="http://schemas.datastream.net/MP_fields">
          <TYPECODE>CMCONT</TYPECODE>          
        </CASETYPE>
        <DEPARTMENTID xmlns="http://schemas.datastream.net/MP_fields">
          <DEPARTMENTCODE>SMPL</DEPARTMENTCODE>
          <ORGANIZATIONID entity="Group">
            <ORGANIZATIONCODE>*</ORGANIZATIONCODE>            
          </ORGANIZATIONID>          
        </DEPARTMENTID>
        <STATUS entity="User" xmlns="http://schemas.datastream.net/MP_fields">
          <STATUSCODE>R</STATUSCODE>          
        </STATUS>
        <RSTATUS entity="User" xmlns="http://schemas.datastream.net/MP_fields">
          <STATUSCODE>R</STATUSCODE>          
        </RSTATUS>                      
        <CaseDetails>
          <CASECLASSID entity="ent1" xmlns="http://schemas.datastream.net/MP_fields">
            <CLASSCODE>CSM</CLASSCODE>
            <ORGANIZATIONID entity="Class">
              <ORGANIZATIONCODE>*</ORGANIZATIONCODE>              
            </ORGANIZATIONID>            
          </CASECLASSID>          
          <SERVICEPROBLEMID xmlns="http://schemas.datastream.net/MP_fields">
            <SERVICEPROBLEMCODE>CSM</SERVICEPROBLEMCODE>
            <ORGANIZATIONID entity="Personnel">
              <ORGANIZATIONCODE>*</ORGANIZATIONCODE>              
            </ORGANIZATIONID>            
          </SERVICEPROBLEMID>         
        </CaseDetails>		
        <TrackingDetails>          
          <DATEREQUESTED qualifier="ACCOUNTING" xmlns="http://schemas.datastream.net/MP_fields">
            <YEAR xmlns="http://www.openapplications.org/oagis_fields">${dateRequested.getUTCFullYear()}</YEAR>
            <MONTH xmlns="http://www.openapplications.org/oagis_fields">${
              dateRequested.getUTCMonth() + 1 // month is zero-based
            }</MONTH>
            <DAY xmlns="http://www.openapplications.org/oagis_fields">${dateRequested.getUTCDate()}</DAY>
            <HOUR xmlns="http://www.openapplications.org/oagis_fields">${dateRequested.getUTCHours()}</HOUR>
            <MINUTE xmlns="http://www.openapplications.org/oagis_fields">${dateRequested.getUTCMinutes()}</MINUTE>
            <SECOND xmlns="http://www.openapplications.org/oagis_fields">${dateRequested.getUTCSeconds()}</SECOND>
            <SUBSECOND xmlns="http://www.openapplications.org/oagis_fields">${dateRequested.getUTCMilliseconds()}</SUBSECOND>
            <TIMEZONE xmlns="http://www.openapplications.org/oagis_fields">${dateRequested.getTimezoneOffset()}</TIMEZONE>
          </DATEREQUESTED>
          <PERSONRESPONSIBLE xmlns="http://schemas.datastream.net/MP_fields">
            <EMPLOYEECODE></EMPLOYEECODE>
			      <DESCRIPTION></DESCRIPTION>             
            <ORGANIZATIONID entity="Location">
              <ORGANIZATIONCODE>*</ORGANIZATIONCODE>              
            </ORGANIZATIONID>
          </PERSONRESPONSIBLE>
          <EMAIL xmlns="http://schemas.datastream.net/MP_fields">${localContactEmail}</EMAIL>         
          <SCHEDULEDSTARTDATE qualifier="ACCOUNTING" xmlns="http://schemas.datastream.net/MP_fields">
          <YEAR xmlns="http://www.openapplications.org/oagis_fields">${experimentStartDate.getUTCFullYear()}</YEAR>
          <MONTH xmlns="http://www.openapplications.org/oagis_fields">${
            experimentStartDate.getUTCMonth() + 1 // month is zero-based
          }</MONTH>
          <DAY xmlns="http://www.openapplications.org/oagis_fields">${experimentStartDate.getUTCDate()}</DAY>
          <HOUR xmlns="http://www.openapplications.org/oagis_fields">${experimentStartDate.getUTCHours()}</HOUR>
          <MINUTE xmlns="http://www.openapplications.org/oagis_fields">${experimentStartDate.getUTCMinutes()}</MINUTE>
          <SECOND xmlns="http://www.openapplications.org/oagis_fields">${experimentStartDate.getUTCSeconds()}</SECOND>
          <SUBSECOND xmlns="http://www.openapplications.org/oagis_fields">${experimentStartDate.getUTCMilliseconds()}</SUBSECOND>
          <TIMEZONE xmlns="http://www.openapplications.org/oagis_fields">${experimentStartDate.getTimezoneOffset()}</TIMEZONE>
          </SCHEDULEDSTARTDATE>
          <SCHEDULEDENDDATE qualifier="ACCOUNTING" xmlns="http://schemas.datastream.net/MP_fields">
          <YEAR xmlns="http://www.openapplications.org/oagis_fields">${experimentEndDate.getUTCFullYear()}</YEAR>
          <MONTH xmlns="http://www.openapplications.org/oagis_fields">${
            experimentEndDate.getUTCMonth() + 1 // month is zero-based
          }</MONTH>
          <DAY xmlns="http://www.openapplications.org/oagis_fields">${experimentEndDate.getUTCDate()}</DAY>
          <HOUR xmlns="http://www.openapplications.org/oagis_fields">${experimentEndDate.getUTCHours()}</HOUR>
          <MINUTE xmlns="http://www.openapplications.org/oagis_fields">${experimentEndDate.getUTCMinutes()}</MINUTE>
          <SECOND xmlns="http://www.openapplications.org/oagis_fields">${experimentEndDate.getUTCSeconds()}</SECOND>
          <SUBSECOND xmlns="http://www.openapplications.org/oagis_fields">${experimentEndDate.getUTCMilliseconds()}</SUBSECOND>
          <TIMEZONE xmlns="http://www.openapplications.org/oagis_fields">${experimentEndDate.getTimezoneOffset()}</TIMEZONE>
          </SCHEDULEDENDDATE>                 
        </TrackingDetails>		
        <StandardUserDefinedFields xmlns="http://schemas.datastream.net/MP_fields">         
          <UDFCHAR03>${location}</UDFCHAR03>
          <UDFCHAR04>${proposalId}</UDFCHAR04>
		  <UDFCHAR05>Responsible Phone Number</UDFCHAR05>          
        </StandardUserDefinedFields>
      </CaseManagement>
    </MP3640_AddCaseManagement_001>
  </Body>
</Envelope>`;

export default getRequest;

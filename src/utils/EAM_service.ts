// This is work in progress implementation for EAM service
import { logger } from '@esss-swap/duo-logger';
import axios from 'axios';
import { ModuleOptions, ResourceOwnerPassword } from 'simple-oauth2';

type EnvVars =
  | 'EAM_API_URL'
  | 'EAM_AUTH_URL'
  | 'EAM_AUTH_SECRET'
  | 'EAM_AUTH_USER'
  | 'EAM_AUTH_PASS';

const isEamDisabled = process.env.UO_FEATURE_DISABLE_EAM === '1';

const getEnvOrThrow = (envVariable: EnvVars): string => {
  const value = process.env[envVariable];
  if (!value) {
    logger.logError(`Environmental variable ${envVariable} is not set`, {
      envVariable,
      value,
    });
    throw new Error(`Environmental variable ${envVariable} is not set`);
  }

  return value;
};

const addAssetSoapRequest = `<?xml version="1.0" encoding="utf-8"?>
  <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Header>
      <Tenant>DS_MP_1</Tenant>
      <SessionScenario xmlns="http://schemas.datastream.net/headers">terminate</SessionScenario>
      <Organization xmlns="http://schemas.datastream.net/headers">ESS</Organization>
    </Header>
    <Body>
      <MP0301_AddAssetEquipment_001 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" verb="Add" noun="AssetEquipment" version="001" confirm_availability_status="confirm_availability_status1" confirmaddlinearreferences="confirmaddlinearreferences1" confirmnewequipmentlength="confirmnewequipmentlength1" xmlns="http://schemas.datastream.net/MP_functions/MP0301_001">     
        <AssetEquipment recordid="1" user_entity="user_entity1" system_entity="system_entity1" autonumber="default" creategis="true" has_department_security="has_1" has_readonly_department_security_for_createwo="has_1" is_gis_webservice_request="false" is_associated_to_current_consist="false" is_default_rankings_available="false" instructure="false" haswo="false" confirm_delete_surveryanswers="confirmed" xmlns="http://schemas.datastream.net/MP_entities/AssetEquipment_001">
          <ASSETID xmlns="http://schemas.datastream.net/MP_fields">
            <EQUIPMENTCODE></EQUIPMENTCODE>
            <ORGANIZATIONID entity="User">
              <ORGANIZATIONCODE>ESS</ORGANIZATIONCODE>            
            </ORGANIZATIONID>
            <DESCRIPTION>Description</DESCRIPTION>
          </ASSETID>
          <TYPE entity="User" xmlns="http://schemas.datastream.net/MP_fields">
            <TYPECODE>A</TYPECODE>          
          </TYPE>
          <CLASSID entity="ent1" xmlns="http://schemas.datastream.net/MP_fields">
            <CLASSCODE>*</CLASSCODE>
            <ORGANIZATIONID entity="Organization">
              <ORGANIZATIONCODE>*</ORGANIZATIONCODE>            
            </ORGANIZATIONID>          
          </CLASSID>
          <STATUS entity="User" xmlns="http://schemas.datastream.net/MP_fields">
            <STATUSCODE>I</STATUSCODE>          
          </STATUS>
          <DEPARTMENTID xmlns="http://schemas.datastream.net/MP_fields">
            <DEPARTMENTCODE>*</DEPARTMENTCODE>
            <ORGANIZATIONID entity="Group">
              <ORGANIZATIONCODE>*</ORGANIZATIONCODE>            
            </ORGANIZATIONID>          
          </DEPARTMENTID>       
          <COMMISSIONDATE qualifier="ACCOUNTING" xmlns="http://schemas.datastream.net/MP_fields">
            <YEAR xmlns="http://www.openapplications.org/oagis_fields">2021</YEAR>
            <MONTH xmlns="http://www.openapplications.org/oagis_fields">02</MONTH>
            <DAY xmlns="http://www.openapplications.org/oagis_fields">10</DAY>
            <HOUR xmlns="http://www.openapplications.org/oagis_fields">10</HOUR>
            <MINUTE xmlns="http://www.openapplications.org/oagis_fields">00</MINUTE>
            <SECOND xmlns="http://www.openapplications.org/oagis_fields">00</SECOND>
            <SUBSECOND xmlns="http://www.openapplications.org/oagis_fields">00</SUBSECOND>
            <TIMEZONE xmlns="http://www.openapplications.org/oagis_fields"></TIMEZONE>
          </COMMISSIONDATE>       
        </AssetEquipment>
      </MP0301_AddAssetEquipment_001>
    </Body>
  </Envelope>`;

const performApiRequest = async (request: string) => {
  const accessToken = await getToken();

  const response = await axios({
    method: 'post',
    url: `${getEnvOrThrow(
      'EAM_API_URL'
    )}/infor/CustomerApi/EAMWS/EAMTESTAPI/EWSConnector`,
    data: request,
    headers: {
      'Content-Type': 'text/xml',
      'Content-Length': addAssetSoapRequest.length,
      Authorization: `Bearer ${accessToken?.token.access_token}`,
    },
  });

  if (response.status !== 200) {
    logger.logError('Failed to execute addAssetEquipment', { response });
    throw new Error('Failed to execute addAssetEquipment');
  }

  return response.data as string;
};

const addAssetEquipment = async () => {
  if (isEamDisabled) {
    return '';
  }
  const response = await performApiRequest(addAssetSoapRequest);

  const regexFindEquipmentCode = /<ns2:EQUIPMENTCODE>([0-9]*)<\/ns2:EQUIPMENTCODE>/;
  const result = response.match(regexFindEquipmentCode);

  if (!result || result.length < 2) {
    logger.logError('Unexpected response from EAM API', { response });
    throw new Error('Unexpected response from EAM API');
  }

  return result[1];
};

const getToken = async () => {
  const config: ModuleOptions = {
    client: {
      id: 'infor~pAVcElz8D8rmSWLPp9TmHDwLTOpOo2f3OW-2DDpW5xg',
      secret: getEnvOrThrow('EAM_AUTH_SECRET'),
    },
    auth: {
      tokenHost: getEnvOrThrow('EAM_AUTH_URL'),
      tokenPath: 'InforIntSTS/connect/token',
    },
  };
  const client = new ResourceOwnerPassword(config);

  const tokenParams = {
    username: getEnvOrThrow('EAM_AUTH_USER'),
    password: getEnvOrThrow('EAM_AUTH_PASS'),
    scope: 'offline_access',
  };

  try {
    return await client.getToken(tokenParams);
  } catch (error) {
    logger.logError('Access Token Error', error.message);
    throw new Error('Access Token Error');
  }
};

export default addAssetEquipment;

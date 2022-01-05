const date = new Date();
const PART_CODE = 12413;
/**
 * Add Asset Equipment
 * @param proposalTitle title of the proposal
 * @param weightKilograms weight in kilograms
 * @param widthMeters width in meters
 * @param heightMeters height in meters
 * @param lengthMeters length in meters
 * @returns the SOAP request
 */
const getRequest = (
  proposalId: string,
  proposalTitle: string,
  weightKilograms: number,
  widthMeters: number,
  heightMeters: number,
  lengthMeters: number
) => `<?xml version="1.0" encoding="utf-8"?>
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
					<EQUIPMENTCODE/>
					<ORGANIZATIONID entity="User">
						<ORGANIZATIONCODE>ESS</ORGANIZATIONCODE>
					</ORGANIZATIONID>
					<DESCRIPTION>${proposalTitle.substr(0, 80)}</DESCRIPTION>
				</ASSETID>
				<TYPE entity="User" xmlns="http://schemas.datastream.net/MP_fields">
					<TYPECODE>A</TYPECODE>
				</TYPE>
				<CLASSID entity="ent1" xmlns="http://schemas.datastream.net/MP_fields">
					<CLASSCODE>SMPCON</CLASSCODE>
					<ORGANIZATIONID entity="Organization">
						<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
					</ORGANIZATIONID>
				</CLASSID>
				<STATUS entity="User" xmlns="http://schemas.datastream.net/MP_fields">
					<STATUSCODE>C</STATUSCODE>
				</STATUS>
				<DEPARTMENTID xmlns="http://schemas.datastream.net/MP_fields">
					<DEPARTMENTCODE>SMPL</DEPARTMENTCODE>
					<ORGANIZATIONID entity="Group">
						<ORGANIZATIONCODE>*</ORGANIZATIONCODE>						
					</ORGANIZATIONID>					
				</DEPARTMENTID>
				<COMMISSIONDATE qualifier="ACCOUNTING" xmlns="http://schemas.datastream.net/MP_fields">
					<YEAR xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCFullYear()}</YEAR>
					<MONTH xmlns="http://www.openapplications.org/oagis_fields">${
            date.getUTCMonth() + 1 // +1 because getUTCMonth returns 0-11
          }</MONTH>
					<DAY xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCDay()}</DAY>
					<HOUR xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCHours()}</HOUR>
					<MINUTE xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCMinutes()}</MINUTE>
					<SECOND xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCSeconds()}</SECOND>
					<SUBSECOND xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCMilliseconds()}</SUBSECOND>
					<TIMEZONE xmlns="http://www.openapplications.org/oagis_fields"/>
				</COMMISSIONDATE>
				<PartAssociation is_bylot="is_b1">
					<PARTID xmlns="http://schemas.datastream.net/MP_fields">
						<PARTCODE>${PART_CODE}</PARTCODE>
						<ORGANIZATIONID entity="Equipment">
							<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
						</ORGANIZATIONID>
					</PARTID>
					<STORELOCATION xmlns="http://schemas.datastream.net/MP_fields">
						<STOREID>
							<STORECODE>US-OF</STORECODE>
							<ORGANIZATIONID entity="AssetEquipment">
								<ORGANIZATIONCODE>ESS</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</STOREID>
						<BIN>*</BIN>
						<LOT>*</LOT>
					</STORELOCATION>
				</PartAssociation>
				<USERDEFINEDAREA xmlns="http://schemas.datastream.net/MP_fields">
					<CUSTOMFIELD index="10" entity="OBJ" type="CHAR">
							<PROPERTYCODE>10000001</PROPERTYCODE>
							<PROPERTYLABEL>Weight (Kg)</PROPERTYLABEL>
							 <CLASSID>
								<CLASSCODE>SMPCON</CLASSCODE>
								 <ORGANIZATIONID>
									<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
								</ORGANIZATIONID>
							</CLASSID>
							<TEXTFIELD>${weightKilograms}</TEXTFIELD>
							 <LOVSETTINGS>
								<LOV_TYPE>-</LOV_TYPE>
								<LOV_VALIDATE>-</LOV_VALIDATE>
							</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="20" entity="OBJ" type="CHAR">
							<PROPERTYCODE>10000002</PROPERTYCODE>
							<PROPERTYLABEL>Width (m)</PROPERTYLABEL>
							 <CLASSID>
								<CLASSCODE>SMPCON</CLASSCODE>
								 <ORGANIZATIONID>
									<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
								</ORGANIZATIONID>
							</CLASSID>
							<TEXTFIELD>${widthMeters}</TEXTFIELD>
							 <LOVSETTINGS>
								<LOV_TYPE>-</LOV_TYPE>
								<LOV_VALIDATE>-</LOV_VALIDATE>
							</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="30" entity="OBJ" type="CHAR">
							<PROPERTYCODE>10000003</PROPERTYCODE>
							<PROPERTYLABEL>Height (m)</PROPERTYLABEL>
							 <CLASSID>
								<CLASSCODE>SMPCON</CLASSCODE>
								 <ORGANIZATIONID>
									<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
								</ORGANIZATIONID>
							</CLASSID>
							<TEXTFIELD>${heightMeters}</TEXTFIELD>
							 <LOVSETTINGS>
								<LOV_TYPE>-</LOV_TYPE>
								<LOV_VALIDATE>-</LOV_VALIDATE>
							</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="40" entity="OBJ" type="CHAR">
							<PROPERTYCODE>10000004</PROPERTYCODE>
							<PROPERTYLABEL>Length (m)</PROPERTYLABEL>
							 <CLASSID>
								<CLASSCODE>SMPCON</CLASSCODE>
								 <ORGANIZATIONID>
									<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
								</ORGANIZATIONID>
							</CLASSID>
							<TEXTFIELD>${lengthMeters}</TEXTFIELD>
							 <LOVSETTINGS>
								<LOV_TYPE>-</LOV_TYPE>
								<LOV_VALIDATE>-</LOV_VALIDATE>
							</LOVSETTINGS>
					</CUSTOMFIELD>
				</USERDEFINEDAREA>
				<UserDefinedFields>
					<UDFCHAR22 xmlns="http://schemas.datastream.net/MP_fields">${proposalId}</UDFCHAR22>
				</UserDefinedFields>
			</AssetEquipment>
		</MP0301_AddAssetEquipment_001>
	</Body>
</Envelope>`;

export default getRequest;

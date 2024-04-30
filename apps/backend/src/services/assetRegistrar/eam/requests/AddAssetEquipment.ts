const date = new Date();

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
  partCode: string,
  proposalId: string,
  proposalTitle: string,
  weightKilograms: number,
  widthMeters: number,
  heightMeters: number,
  lengthMeters: number,
  isDangerousGoods: string,
  dangerousGoodsUnNumber: string,
  dangerousGoodsDetails: string,
  shipmentSampleRisks: string,
  parcelValue: string,
  shipmentSenderCompany: string,
  shipmentSenderStreetAddress: string,
  shipmentSenderZipCode: string,
  shipmentSenderCityCountry: string,
  shipmentSenderName: string,
  shipmentSenderEmail: string,
  shipmentSenderPhone: string,
  instrumentShortCode: string
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
					<DAY xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCDate()}</DAY>
					<HOUR xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCHours()}</HOUR>
					<MINUTE xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCMinutes()}</MINUTE>
					<SECOND xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCSeconds()}</SECOND>
					<SUBSECOND xmlns="http://www.openapplications.org/oagis_fields">${date.getUTCMilliseconds()}</SUBSECOND>
					<TIMEZONE xmlns="http://www.openapplications.org/oagis_fields"/>
				</COMMISSIONDATE>
				<PartAssociation is_bylot="is_b1">
					<PARTID xmlns="http://schemas.datastream.net/MP_fields">
						<PARTCODE>${partCode}</PARTCODE>
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
					<CUSTOMFIELD index="50" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000001</PROPERTYCODE>
						<PROPERTYLABEL>Dangerous Goods</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${isDangerousGoods}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="60" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000002</PROPERTYCODE>
						<PROPERTYLABEL>Dangerous Goods UN Number</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${dangerousGoodsUnNumber}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="70" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000003</PROPERTYCODE>
						<PROPERTYLABEL>Specify all dangerous goods in detail</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${dangerousGoodsDetails}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="80" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000004</PROPERTYCODE>
						<PROPERTYLABEL>Specify risks for shipment associated with samples, if any</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${shipmentSampleRisks}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="90" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000005</PROPERTYCODE>
						<PROPERTYLABEL>Value (EUR)</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${parcelValue}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="100" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000006</PROPERTYCODE>
						<PROPERTYLABEL>Sender Company</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${shipmentSenderCompany}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="110" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000007</PROPERTYCODE>
						<PROPERTYLABEL>Sender street address</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${shipmentSenderStreetAddress}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="120" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000008</PROPERTYCODE>
						<PROPERTYLABEL>Sender Zip code</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${shipmentSenderZipCode}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="130" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000009</PROPERTYCODE>
						<PROPERTYLABEL>Sender City / Country</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${shipmentSenderCityCountry}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="140" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000010</PROPERTYCODE>
						<PROPERTYLABEL>Sender Name</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${shipmentSenderName}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="150" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000011</PROPERTYCODE>
						<PROPERTYLABEL>Sender Email</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${shipmentSenderEmail}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="160" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000012</PROPERTYCODE>
						<PROPERTYLABEL>Sender Phone Number</PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${shipmentSenderPhone}</TEXTFIELD>
						<LOVSETTINGS>
							<LOV_TYPE>-</LOV_TYPE>
							<LOV_VALIDATE>-</LOV_VALIDATE>
						</LOVSETTINGS>
					</CUSTOMFIELD>
					<CUSTOMFIELD index="160" entity="OBJ" type="CHAR">
						<PROPERTYCODE>SM000013</PROPERTYCODE>
						<PROPERTYLABEL>Instrument </PROPERTYLABEL>
						<CLASSID>
							<CLASSCODE>SMPCON</CLASSCODE>
							<ORGANIZATIONID>
								<ORGANIZATIONCODE>*</ORGANIZATIONCODE>
							</ORGANIZATIONID>
						</CLASSID>
						<TEXTFIELD>${instrumentShortCode}</TEXTFIELD>
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

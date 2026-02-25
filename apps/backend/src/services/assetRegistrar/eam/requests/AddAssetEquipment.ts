import { getEnvOrThrow } from '../utils/getEnvOrThrow';

const getAddAssetEquipmentRequestPayload = (
  proposalId: string,
  proposalTitle: string,
  weight: string | undefined,
  width: string | undefined,
  height: string | undefined,
  length: string | undefined,
  dangerousGoods: string,
  dangerousGoodsUnNumber: string,
  dangerousGoodsDetails: string,
  shipmentSampleRisks: string,
  strParcelValue: string,
  shipmentSenderCompany: string,
  shipmentSenderStreetAddress: string,
  shipmentSenderZipCode: string,
  shipmentSenderCityCountry: string,
  shipmentSenderName: string,
  shipmentSenderEmail: string,
  shipmentSenderPhone: string,
  instrumentShortCodes: string[]
) => ({
  ASSETID: {
    EQUIPMENTCODE: '',
    ORGANIZATIONID: {
      ORGANIZATIONCODE: getEnvOrThrow('EAM_ORGANIZATION_CODE'),
      DESCRIPTION: getEnvOrThrow('EAM_ORGANIZATION_NAME'),
    },
    DESCRIPTION: proposalTitle,
  },
  DESCRIPTION: proposalTitle,
  STATUS: {
    STATUSCODE: 'I',
    DESCRIPTION: 'Installed',
  },
  DEPARTMENTID: {
    DEPARTMENTCODE: 'SMPL',
    ORGANIZATIONID: {
      ORGANIZATIONCODE: '*',
      DESCRIPTION: 'Default',
    },
    DESCRIPTION: 'Sample Management',
  },
  CLASSID: {
    CLASSCODE: 'SMPCON',
    ORGANIZATIONID: {
      ORGANIZATIONCODE: '*',
      DESCRIPTION: 'Default',
    },
    DESCRIPTION: 'Sample Container',
  },
  USERDEFINEDAREA: {
    CUSTOMFIELD: [
      {
        PROPERTYCODE: '10000001',
        PROPERTYLABEL: 'Weight (Kg)',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: weight,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: '10000002',
        PROPERTYLABEL: 'Width (m)',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: width,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: '10000003',
        PROPERTYLABEL: 'Height (m)',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: height,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: '10000004',
        PROPERTYLABEL: 'Length (m)',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: length,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000001',
        PROPERTYLABEL: 'Dangerous Goods',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: dangerousGoods,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000002',
        PROPERTYLABEL: 'Dangerous Goods UN Number',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: dangerousGoodsUnNumber,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000003',
        PROPERTYLABEL: 'Specify all dangerous goods in detail',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: dangerousGoodsDetails,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000004',
        PROPERTYLABEL:
          'Specify risks for shipment associated with samples, if any',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: shipmentSampleRisks,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000005',
        PROPERTYLABEL: 'Value (EUR)',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: strParcelValue,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000006',
        PROPERTYLABEL: 'Sender Company',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: shipmentSenderCompany,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000007',
        PROPERTYLABEL: 'Sender street address',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: shipmentSenderStreetAddress,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000008',
        PROPERTYLABEL: 'Sender Zip code',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: shipmentSenderZipCode,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000009',
        PROPERTYLABEL: 'Sender City / Country',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: shipmentSenderCityCountry,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000010',
        PROPERTYLABEL: 'Sender Name',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: shipmentSenderName,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000011',
        PROPERTYLABEL: 'Sender Email',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: shipmentSenderEmail,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000012',
        PROPERTYLABEL: 'Sender Phone Number',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: shipmentSenderPhone,
        entity: 'OBJ',
        type: 'CHAR',
      },
      {
        PROPERTYCODE: 'SM000013',
        PROPERTYLABEL: 'Instrument',
        CLASSID: {
          CLASSCODE: 'SMPCON',
        },
        TEXTFIELD: instrumentShortCodes.join(', '),
        entity: 'OBJ',
        type: 'CHAR',
      },
    ],
  },
  UserDefinedFields: {
    UDFCHAR22: proposalId,
  },
});

export default getAddAssetEquipmentRequestPayload;

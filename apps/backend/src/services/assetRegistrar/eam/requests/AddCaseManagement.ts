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
) => ({
  proposalId,
  proposalTitle,
  containerId,
  experimentStartDate,
  experimentEndDate,
  dateRequested,
  localContactEmail,
  location,
});

export default getRequest;

/**
 *
 *
 * @enum UserQueryContext
 * PROPOSER - when calling getBasic from  a function that has set the PI of the proposal or the PDF
 * ANY - when calling under any of circumstances, requires either User Officer or Instrument Scientist
 * permissions to run getBasic
 *
 */
enum UserQueryContext {
  PROPOSER = 'PROPOSER',
  ANY = 'ANY',
}

export default UserQueryContext;

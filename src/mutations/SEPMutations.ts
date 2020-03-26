import { SEPDataSource } from '../datasources/SEPDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { EventBus } from '../events/eventBus';
import { SEP } from '../models/SEP';
import { User } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateSEPArgs } from '../resolvers/mutations/CreateSEPMutation';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class SEPMutations {
  constructor(
    private dataSource: SEPDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>
  ) {}

  async create(
    agent: User | null,
    args: CreateSEPArgs
  ): Promise<SEP | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection('NOT_LOGGED_IN');
        }

        // Check if there is an open call, if not reject
        if (!(await this.userAuth.isUserOfficer(agent))) {
          return rejection('NOT_ALLOWED');
        }

        return this.dataSource
          .create(
            args.code,
            args.description,
            args.numberRatingsRequired,
            args.active
          )
          .then(sep => sep)
          .catch(err => {
            logger.logException(
              'Could not create scientific evaluation panel',
              err,
              { agent }
            );

            return rejection('INTERNAL_ERROR');
          });
      },
      sep => {
        return {
          type: Event.SEP_CREATED,
          sep,
          loggedInUserId: agent ? agent.id : null,
        };
      }
    );
  }

  // async update(
  //   agent: User | null,
  //   args: UpdateProposalArgs
  // ): Promise<Proposal | Rejection> {
  //   const {
  //     id,
  //     title,
  //     abstract,
  //     answers,
  //     topicsCompleted,
  //     users,
  //     proposerId,
  //     partialSave,
  //     rankOrder,
  //     finalStatus,
  //   } = args;

  //   return this.eventBus.wrap<Proposal>(
  //     async () => {
  //       if (agent == null) {
  //         return rejection('NOT_LOGGED_IN');
  //       }

  //       // Get proposal information
  //       const proposal = await this.dataSource.get(id); //Hacky

  //       // Check if there is an open call, if not reject
  //       if (
  //         !(await this.userAuth.isUserOfficer(agent)) &&
  //         !(await this.dataSource.checkActiveCall())
  //       ) {
  //         return rejection('NO_ACTIVE_CALL_FOUND');
  //       }

  //       // Check that proposal exist
  //       if (!proposal) {
  //         return rejection('INTERNAL_ERROR');
  //       }

  //       if (
  //         !(await this.userAuth.isUserOfficer(agent)) &&
  //         !(await this.userAuth.isMemberOfProposal(agent, proposal))
  //       ) {
  //         return rejection('NOT_ALLOWED');
  //       }

  //       if (
  //         proposal.status !== ProposalStatus.DRAFT &&
  //         !(await this.userAuth.isUserOfficer(agent))
  //       ) {
  //         return rejection('NOT_ALLOWED_PROPOSAL_SUBMITTED');
  //       }

  //       if (title !== undefined) {
  //         proposal.title = title;
  //       }

  //       if (abstract !== undefined) {
  //         proposal.abstract = abstract;
  //       }
  //       if (
  //         (await this.userAuth.isUserOfficer(agent)) &&
  //         rankOrder !== undefined
  //       ) {
  //         proposal.rankOrder = rankOrder;
  //       }

  //       if (
  //         (await this.userAuth.isUserOfficer(agent)) &&
  //         finalStatus !== undefined
  //       ) {
  //         proposal.finalStatus = finalStatus;
  //       }

  //       if (users !== undefined) {
  //         const [err] = await to(this.dataSource.setProposalUsers(id, users));
  //         if (err) {
  //           logger.logError('Could not update users', { err, id, agent });

  //           return rejection('INTERNAL_ERROR');
  //         }
  //       }

  //       if (proposerId !== undefined) {
  //         proposal.proposerId = proposerId;
  //       }

  //       if (answers !== undefined) {
  //         for (const answer of answers) {
  //           if (answer.value !== undefined) {
  //             const templateField = await this.templateDataSource.getTemplateField(
  //               answer.proposal_question_id
  //             );
  //             if (!templateField) {
  //               return rejection('INTERNAL_ERROR');
  //             }
  //             if (
  //               !partialSave &&
  //               !isMatchingConstraints(answer.value, templateField)
  //             ) {
  //               this.logger.logError(
  //                 'User provided value not matching constraint',
  //                 { answer, templateField }
  //               );

  //               return rejection('VALUE_CONSTRAINT_REJECTION');
  //             }
  //             await this.dataSource.updateAnswer(
  //               proposal?.id,
  //               answer.proposal_question_id,
  //               answer.value
  //             );
  //           }
  //         }
  //       }

  //       if (topicsCompleted !== undefined) {
  //         await this.dataSource.updateTopicCompletenesses(
  //           proposal.id,
  //           topicsCompleted
  //         );
  //       }

  //       return this.dataSource
  //         .update(proposal)
  //         .then(proposal => proposal)
  //         .catch(err => {
  //           logger.logException('Could not update proposal', err, {
  //             agent,
  //             id,
  //           });

  //           return rejection('INTERNAL_ERROR');
  //         });
  //     },
  //     (proposal): ApplicationEvent => {
  //       return {
  //         type: Event.PROPOSAL_UPDATED,
  //         proposal,
  //         loggedInUserId: agent ? agent.id : null,
  //       };
  //     }
  //   );
  // }

  // async delete(
  //   agent: User | null,
  //   proposalId: number
  // ): Promise<Proposal | Rejection> {
  //   if (agent == null) {
  //     return rejection('NOT_LOGGED_IN');
  //   }

  //   const proposal = await this.dataSource.get(proposalId);

  //   if (!proposal) {
  //     return rejection('INTERNAL_ERROR');
  //   }

  //   if (
  //     !(await this.userAuth.isUserOfficer(agent)) &&
  //     !(await this.userAuth.isMemberOfProposal(agent, proposal))
  //   ) {
  //     return rejection('NOT_ALLOWED');
  //   }

  //   const result = await this.dataSource.deleteProposal(proposalId);

  //   return result || rejection('INTERNAL_ERROR');
  // }
}

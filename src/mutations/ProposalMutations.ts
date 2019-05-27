import { ProposalDataSource } from "../datasources/ProposalDataSource";
import User from "../models/User";
import { isUserOfficer } from "../utils/userAuthorization";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { rejection, Rejection } from "../rejection";
import Proposal from "../models/Proposal";
import { reject } from "bluebird";

// TODO: it is here much of the logic reside

export default class ProposalMutations {
  constructor(
    private dataSource: ProposalDataSource,
    private eventBus: EventBus<ApplicationEvent>
  ) {}

  async create(
    agent: User | null,
    abstract: string,
    status: number,
    users: number[]
  ): Promise<Proposal | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection("NOT_LOGGED_IN");
        }

        if (abstract.length < 20) {
          return rejection("TOO_SHORT_ABSTRACT");
        }

        const result = await this.dataSource.create(abstract, status, users);
        return result || rejection("INTERNAL_ERROR");
      },
      proposal => {
        return { type: "PROPOSAL_ACCEPTED", proposal };
      }
    );
  }

  async accept(
    agent: User | null,
    proposalID: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }

    if (!isUserOfficer(agent)) {
      return rejection("NOT_USER_OFFICER");
    }

    const result = await this.dataSource.acceptProposal(proposalID);
    return result || reject("INTERNAL_ERROR");
  }
}

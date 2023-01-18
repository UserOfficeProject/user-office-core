import { logger } from '@user-office-software/duo-logger';
import { gql, GraphQLClient } from 'graphql-request';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { FeatureId } from '../models/Feature';

const SCHEDULER_ENDPOINT = process.env.SCHEDULER_ENDPOINT as string;

type GetAllQueriesAndMutationsQuery = {
  schedulerQueriesAndMutations: {
    queries: Array<string>;
    mutations: Array<string>;
  } | null;
};

const getSdk = (client: GraphQLClient) => {
  return {
    getQueriesAndMutations:
      async (): Promise<GetAllQueriesAndMutationsQuery> => {
        const GetAllQueriesAndMutationsQuery = gql`
          query getAllQueriesAndMutations {
            schedulerQueriesAndMutations {
              queries
              mutations
            }
          }
        `;

        return client.request(GetAllQueriesAndMutationsQuery);
      },
  };
};

export type Sdk = ReturnType<typeof getSdk>;

export default function initGraphQLClient(token?: string) {
  // create a new GraphQLClient lazily, only when we need one
  return async () => {
    const adminDataSource = container.resolve<AdminDataSource>(
      Tokens.AdminDataSource
    );
    const features = await adminDataSource.getFeatures();

    const isSchedulerEnabled = features.find(
      (feature) => feature.id === FeatureId.SCHEDULER
    )?.isEnabled;

    if (!isSchedulerEnabled) {
      return;
    }

    if (!SCHEDULER_ENDPOINT) {
      logger.logError(
        'Scheduler enabled but env `SCHEDULER_ENDPOINT` is missing',
        {}
      );

      return;
    }

    const client = new GraphQLClient(SCHEDULER_ENDPOINT, {
      headers: {
        ...(token && { authorization: token }),
      },
    });

    return getSdk(client);
  };
}

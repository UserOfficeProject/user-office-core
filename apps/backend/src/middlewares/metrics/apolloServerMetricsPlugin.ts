import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContext,
  GraphQLRequestContextWillSendResponse,
} from '@apollo/server';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { Counter, Histogram } from 'prom-client';

type OperationType = 'query' | 'mutation' | 'subscription' | 'unknown';

interface MetricLabels {
  operation: string;
  operation_type: OperationType;
  status: 'success' | 'error';
}

const graphqlRequestDuration = new Histogram({
  name: 'graphql_request_duration_seconds',
  help: 'Duration of GraphQL requests in seconds',
  labelNames: ['operation', 'operation_type', 'status'],
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const graphqlRequestCounter = new Counter({
  name: 'graphql_requests_total',
  help: 'Total number of GraphQL requests',
  labelNames: ['operation', 'operation_type', 'status'],
});

const graphqlErrorCounter = new Counter({
  name: 'graphql_errors_total',
  help: 'Total number of GraphQL errors',
  labelNames: ['operation', 'operation_type', 'error_code'],
});

// Basic plugin to collect prometheus metrics for GraphQL requests
// It is possible to extend this plugin to include more metrics
export const apolloServerMetricsPlugin = (): ApolloServerPlugin => ({
  async requestDidStart(requestContext: GraphQLRequestContext<BaseContext>) {
    const { request } = requestContext;

    const operationName = request.operationName || 'anonymous';
    const operationType = getOperationType(request.query);

    const labels: MetricLabels = {
      operation: operationName,
      operation_type: operationType,
      status: 'success',
    };

    const end = graphqlRequestDuration.startTimer(labels);
    graphqlRequestCounter.inc(labels);

    return {
      async willSendResponse(
        responseContext: GraphQLRequestContextWillSendResponse<BaseContext>
      ) {
        // Check for errors in the response body
        if (responseContext.response.body.kind === 'single') {
          const errors = responseContext.response.body.singleResult.errors;

          if (errors) {
            labels.status = 'error';

            errors.forEach((error) => {
              graphqlErrorCounter.inc({
                operation: labels.operation,
                operation_type: labels.operation_type,
                error_code: getErrorCode(error),
              });
            });
          }
        }

        end(labels);
      },

      async executionDidStart() {
        return {
          async executionDidEnd(err) {
            if (err) {
              labels.status = 'error';
              graphqlErrorCounter.inc({
                ...labels,
                error_code: getErrorCode(err),
              });
            }
          },
        };
      },
    };
  },
});

function getOperationType(query: string | undefined): OperationType {
  if (!query) return 'unknown';

  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery.startsWith('query')) return 'query';
  if (trimmedQuery.startsWith('mutation')) return 'mutation';
  if (trimmedQuery.startsWith('subscription')) return 'subscription';

  return 'unknown';
}

function getErrorCode(
  error: GraphQLError | GraphQLFormattedError | Error
): string {
  if (isGraphQLError(error)) {
    return error.extensions?.code as string;
  } else if (error instanceof Error) {
    return error.name;
  }

  return 'UNKNOWN_ERROR_CODE';
}

function isGraphQLError(
  error: GraphQLError | GraphQLFormattedError | Error
): error is GraphQLError | GraphQLFormattedError {
  return 'extensions' in error;
}

/* eslint-disable no-console */
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { KnexInstrumentation } from '@opentelemetry/instrumentation-knex';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { containerDetector } from '@opentelemetry/resource-detector-container';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { envDetector, processDetector } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';

const collectorOptions = {
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
};

const collectorTraceExporter = new OTLPTraceExporter(collectorOptions);

const otelSDK = new NodeSDK({
  traceExporter: collectorTraceExporter,
  resource: resourceFromAttributes({
    ['service.name']: process.env.OTEL_SERVICE_NAME || 'proposal-backend',
  }),
  spanProcessors: [
    new BatchSpanProcessor(collectorTraceExporter, {
      maxQueueSize: 1024,
      maxExportBatchSize: 1024,
      scheduledDelayMillis: 1000,
    }),
  ],
  instrumentations: [
    new HttpInstrumentation(),
    new GraphQLInstrumentation({
      depth: 5,
      allowValues: true,
      ignoreTrivialResolveSpans: true,
      ignoreResolveSpans: true,
    }),
    new KnexInstrumentation({
      requireParentSpan: true,
      maxQueryLength: 100,
    }),
    new AmqplibInstrumentation({}),
    new WinstonInstrumentation({
      disableLogSending: true,
      logHook: (span, record) => {
        record['service_name'] =
          process.env.OTEL_SERVICE_NAME || 'proposal-backend';
      },
    }),
  ],
  resourceDetectors: [envDetector, processDetector, containerDetector],
  autoDetectResources: false,
});
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  process.on('SIGTERM', () => {
    otelSDK
      .shutdown()
      .then(
        () => console.log('SDK shut down successfully', {}),
        (err) => console.log('Error shutting down SDK', err)
      )
      .finally(() => process.exit(0));
  });
}

export default async function startTracing() {
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    console.log('Tracing initialising', {});
    otelSDK.start();
  }
}

export function isTracingEnabled(): boolean {
  return !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
}

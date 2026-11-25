/* eslint-disable no-console */
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { KnexInstrumentation } from '@opentelemetry/instrumentation-knex';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { containerDetector } from '@opentelemetry/resource-detector-container';
import {
  envDetector,
  processDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK, NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import {
  BatchSpanProcessor,
  ReadableSpan,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-node';

import { PromClientMetricProducer } from '../metrics/PromClientMetricProducer';

const OTEL_CONFIG = {
  logProcessor: {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 5000,
  },
  spanProcessor: {
    maxQueueSize: 1024,
    maxExportBatchSize: 1024,
    scheduledDelayMillis: 1000,
  },
  graphql: {
    depth: 5,
    allowValues: true,
    ignoreTrivialResolveSpans: true,
    ignoreResolveSpans: true,
  },
  knex: {
    requireParentSpan: true,
    maxQueryLength: 100,
  },
  masking: {
    visibleCharacters: 6,
    attributes: ['graphql.variables.token', 'graphql.variables.externalToken'],
  },
  service: {
    defaultName: 'proposal-backend',
  },
} as const;

const getServiceName = (): string => {
  return process.env.OTEL_SERVICE_NAME || OTEL_CONFIG.service.defaultName;
};

class AttributeFilterProcessor implements SpanProcessor {
  private readonly maskSet: Set<string>;

  constructor(attributesToMask: readonly string[]) {
    this.maskSet = new Set(attributesToMask);
  }

  onStart(): void {}

  onEnd(span: ReadableSpan): void {
    // Mask specified attributes
    for (const [key, value] of Object.entries(span.attributes)) {
      if (this.maskSet.has(key) && typeof value === 'string') {
        span.attributes[key] = this.maskToken(value);
      }
    }
  }

  private maskToken(token: string): string {
    const { visibleCharacters } = OTEL_CONFIG.masking;

    if (token.length <= visibleCharacters) {
      return '*'.repeat(token.length);
    }

    const maskedPart = '*'.repeat(token.length - visibleCharacters);

    return maskedPart + token.slice(-visibleCharacters);
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

const initializeExporters = (): {
  traceExporter: OTLPTraceExporter;
  logsExporter: OTLPLogExporter | null;
  metricExporter: OTLPMetricExporter | null;
} | null => {
  const tracesEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const logsEndpoint = process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
  const metricsEndpoint = process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
  if (!tracesEndpoint) {
    return null;
  }

  try {
    const traceExporter = new OTLPTraceExporter({
      url: tracesEndpoint,
    });
    const logsExporter = logsEndpoint
      ? new OTLPLogExporter({
          url: logsEndpoint,
        })
      : null;
    const metricExporter = metricsEndpoint
      ? new OTLPMetricExporter({
          url: metricsEndpoint,
        })
      : null;

    return { traceExporter, logsExporter, metricExporter };
  } catch (error) {
    console.error(
      'Failed to initialize OpenTelemetry exporters:',
      error instanceof Error ? error.message : error
    );

    return null;
  }
};

const exporters = initializeExporters();

const initializeSDK = (): NodeSDK | null => {
  if (!exporters) {
    return null;
  }

  try {
    const sdkConfig: Partial<NodeSDKConfiguration> = {
      traceExporter: exporters.traceExporter,
      resource: resourceFromAttributes({
        ['service.name']: getServiceName(),
      }),
      spanProcessors: [
        new AttributeFilterProcessor(OTEL_CONFIG.masking.attributes),
        new BatchSpanProcessor(
          exporters.traceExporter,
          OTEL_CONFIG.spanProcessor
        ),
      ],
      instrumentations: [
        new HttpInstrumentation(),
        new GraphQLInstrumentation(OTEL_CONFIG.graphql),
        new KnexInstrumentation(OTEL_CONFIG.knex),
        new AmqplibInstrumentation(),
        new WinstonInstrumentation({
          disableLogSending: true,
          logHook: (span, record) => {
            record['service_name'] = getServiceName();
          },
        }),
      ],
      resourceDetectors: [envDetector, processDetector, containerDetector],
      autoDetectResources: false,
    };

    if (exporters.logsExporter) {
      sdkConfig.logRecordProcessors = [
        new BatchLogRecordProcessor(
          exporters.logsExporter,
          OTEL_CONFIG.logProcessor
        ),
      ];
    }

    if (exporters.metricExporter) {
      sdkConfig.metricReaders = [
        new PeriodicExportingMetricReader({
          exporter: exporters.metricExporter,
          metricProducers: [new PromClientMetricProducer()],
        }),
      ];
    }

    return new NodeSDK(sdkConfig);
  } catch (error) {
    console.error(
      'Failed to initialize OpenTelemetry SDK:',
      error instanceof Error ? error.message : error
    );

    return null;
  }
};

const otelSDK = initializeSDK();

const registerShutdownHandler = (): void => {
  if (!otelSDK) {
    return;
  }

  const shutdownHandler = async (): Promise<void> => {
    try {
      await otelSDK.shutdown();
      console.log('OpenTelemetry SDK shut down successfully');
    } catch (error) {
      console.error(
        'Error during OpenTelemetry SDK shutdown:',
        error instanceof Error ? error.message : error
      );
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGTERM', shutdownHandler);
  process.on('SIGINT', shutdownHandler);
};

registerShutdownHandler();

export function isTracingEnabled(): boolean {
  return !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
}

export default async function startTracing(): Promise<void> {
  if (!isTracingEnabled() || !otelSDK) {
    return;
  }

  try {
    const tracingConfig: Record<string, string> = {};
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      tracingConfig.tracesEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    }
    if (process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT) {
      tracingConfig.logsEndpoint = process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT;
    }
    if (process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT) {
      tracingConfig.metricsEndpoint =
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
    }

    console.log('Starting OpenTelemetry tracing with configuration:', {
      ...tracingConfig,
      service: getServiceName(),
    });

    otelSDK.start();
  } catch (error) {
    console.error(
      'Failed to start OpenTelemetry tracing:',
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}

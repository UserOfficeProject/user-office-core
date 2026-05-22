import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import type { AnyValueMap, AnyValue } from '@opentelemetry/api-logs';
import TransportStream from 'winston-transport';

interface OpentelemetryLogTransportOptions {
  loggerName?: string;
  loggerVersion?: string;
  severityMapper?: (level: string) => SeverityNumber;
  includeAttributesInMessage?: boolean;
  loggerProvider?: ReturnType<typeof logs.getLoggerProvider>;
}

function defaultSeverityMapper(level?: string): SeverityNumber {
  switch (level) {
    case 'error':
      return SeverityNumber.ERROR;
    case 'warn':
    case 'warning':
      return SeverityNumber.WARN;
    case 'debug':
      return SeverityNumber.DEBUG;
    case 'verbose':
    case 'silly':
      return SeverityNumber.TRACE;
    case 'http':
      return SeverityNumber.DEBUG3;
    case 'info':
    default:
      return SeverityNumber.INFO;
  }
}

function isOtelAttributeValue(value: unknown): value is AnyValue {
  if (value === null) {
    return true;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isOtelAttributeValue(item));
  }

  return false;
}

function processAttributes(
  rawAttributes: Record<string, unknown>
): AnyValueMap {
  const attributes: AnyValueMap = {};

  for (const [key, value] of Object.entries(rawAttributes)) {
    if (isOtelAttributeValue(value)) {
      attributes[key] = value;
    } else if (value instanceof Error) {
      attributes[key] = value.message;
    } else if (value !== undefined) {
      try {
        attributes[key] = JSON.stringify(value);
      } catch {
        throw new Error(
          `Failed to convert JSON object to string for attribute "${key}".`
        );
      }
    }
  }

  return attributes;
}
function formatMessage(
  message: string | undefined,
  attributes: AnyValueMap,
  includeAttributesInMessage: boolean
): string {
  if (!message) {
    return '';
  }

  if (includeAttributesInMessage && Object.keys(attributes).length > 0) {
    return `${String(message)} \n${JSON.stringify(attributes)}`;
  }

  return String(message);
}

export default class OpentelemetryLogTransport extends TransportStream {
  private readonly otelLogger;
  private readonly severityMapper: (level: string) => SeverityNumber;
  private readonly includeAttributesInMessage: boolean;

  constructor(options: OpentelemetryLogTransportOptions = {}) {
    super();

    const loggerProvider = options.loggerProvider ?? logs.getLoggerProvider();
    this.otelLogger = loggerProvider.getLogger(
      options.loggerName ?? 'winston',
      options.loggerVersion ?? '1.0.0'
    );

    this.severityMapper = options.severityMapper ?? defaultSeverityMapper;
    this.includeAttributesInMessage =
      options.includeAttributesInMessage ?? true;
  }

  override log(info: Record<string, unknown>, callback: () => void) {
    const level = String(
      Reflect.get(info, Symbol.for('level')) ?? info.level ?? 'info'
    );
    const { message, ...rawAttributes } = info;
    const attributes = processAttributes(rawAttributes);
    const formattedMessage = formatMessage(
      String(message),
      attributes,
      this.includeAttributesInMessage
    );

    this.otelLogger.emit({
      severityNumber: this.severityMapper(level),
      severityText: level,
      body: formattedMessage,
      attributes,
    });

    this.emit('logged', info);
    callback();
  }
}

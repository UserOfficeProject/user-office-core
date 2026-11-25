import { Attributes, ValueType } from '@opentelemetry/api';
import { InstrumentationScope, millisToHrTime } from '@opentelemetry/core';
import { emptyResource } from '@opentelemetry/resources';
import {
  AggregationTemporality,
  CollectionResult,
  DataPoint,
  DataPointType,
  MetricData,
  MetricProducer,
} from '@opentelemetry/sdk-metrics';
import { register } from 'prom-client';

const SCOPE: InstrumentationScope = { name: 'prom-client-bridge' };

const START_TIME = millisToHrTime(Date.now());

interface PromMetricValue {
  value: number;
  labels: Record<string, string | number>;
  metricName?: string;
}

interface PromMetric {
  name: string;
  help?: string;
  type: string;
  values: PromMetricValue[];
}

function toAttributes(
  labels: Record<string, string | number>,
  omit: string[] = []
): Attributes {
  const attributes: Attributes = {};
  for (const [key, value] of Object.entries(labels)) {
    if (omit.includes(key)) {
      continue;
    }

    attributes[key] = typeof value === 'number' ? value : String(value);
  }

  return attributes;
}

function labelsKey(
  labels: Record<string, string | number>,
  omit: string[]
): string {
  return Object.entries(labels)
    .filter(([key]) => !omit.includes(key))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
}

function toGaugeOrSumData(
  metric: PromMetric,
  now: [number, number],
  isMonotonic: boolean | null
): MetricData {
  const dataPoints: DataPoint<number>[] = metric.values.map((value) => ({
    startTime: START_TIME,
    endTime: now,
    attributes: toAttributes(value.labels),
    value: value.value,
  }));

  const descriptor = {
    name: metric.name,
    description: metric.help ?? '',
    unit: '',
    valueType: ValueType.DOUBLE,
  };

  if (isMonotonic === null) {
    return {
      descriptor,
      aggregationTemporality: AggregationTemporality.CUMULATIVE,
      dataPointType: DataPointType.GAUGE,
      dataPoints,
    };
  }

  return {
    descriptor,
    aggregationTemporality: AggregationTemporality.CUMULATIVE,
    dataPointType: DataPointType.SUM,
    isMonotonic,
    dataPoints,
  };
}

function toHistogramData(
  metric: PromMetric,
  now: [number, number]
): MetricData {
  interface Series {
    attributes: Attributes;
    buckets: Map<number, number>;
    sum: number;
    count: number;
  }

  const series = new Map<string, Series>();
  const getSeries = (labels: Record<string, string | number>): Series => {
    const key = labelsKey(labels, ['le']);
    let entry = series.get(key);
    if (!entry) {
      entry = {
        attributes: toAttributes(labels, ['le']),
        buckets: new Map(),
        sum: 0,
        count: 0,
      };
      series.set(key, entry);
    }

    return entry;
  };

  for (const value of metric.values) {
    const effectiveName = value.metricName ?? metric.name;
    const entry = getSeries(value.labels);

    if (effectiveName === `${metric.name}_bucket`) {
      const upperBound =
        value.labels.le === '+Inf' ? Infinity : Number(value.labels.le);
      entry.buckets.set(upperBound, value.value);
    } else if (effectiveName === `${metric.name}_sum`) {
      entry.sum = value.value;
    } else if (effectiveName === `${metric.name}_count`) {
      entry.count = value.value;
    }
  }

  const dataPoints: DataPoint<{
    buckets: { boundaries: number[]; counts: number[] };
    sum?: number;
    count: number;
  }>[] = [...series.values()].map((entry) => {
    const boundaries = [...entry.buckets.keys()]
      .filter((bound) => bound !== Infinity)
      .sort((a, b) => a - b);

    const counts: number[] = [];
    let previousCumulative = 0;
    for (const boundary of boundaries) {
      const cumulative = entry.buckets.get(boundary) ?? previousCumulative;
      counts.push(cumulative - previousCumulative);
      previousCumulative = cumulative;
    }
    counts.push(entry.count - previousCumulative);

    return {
      startTime: START_TIME,
      endTime: now,
      attributes: entry.attributes,
      value: {
        buckets: { boundaries, counts },
        sum: entry.sum,
        count: entry.count,
      },
    };
  });

  return {
    descriptor: {
      name: metric.name,
      description: metric.help ?? '',
      unit: '',
      valueType: ValueType.DOUBLE,
    },
    aggregationTemporality: AggregationTemporality.CUMULATIVE,
    dataPointType: DataPointType.HISTOGRAM,
    dataPoints,
  };
}

function toSummaryData(
  metric: PromMetric,
  now: [number, number]
): MetricData[] {
  const quantileValues = metric.values.filter(
    (value) => (value.metricName ?? metric.name) === metric.name
  );
  const countValues = metric.values.filter(
    (value) => value.metricName === `${metric.name}_count`
  );
  const sumValues = metric.values.filter(
    (value) => value.metricName === `${metric.name}_sum`
  );

  const results: MetricData[] = [];

  if (quantileValues.length > 0) {
    results.push(
      toGaugeOrSumData({ ...metric, values: quantileValues }, now, null)
    );
  }

  if (countValues.length > 0) {
    results.push(
      toGaugeOrSumData(
        { ...metric, name: `${metric.name}_count`, values: countValues },
        now,
        true
      )
    );
  }

  if (sumValues.length > 0) {
    results.push(
      toGaugeOrSumData(
        { ...metric, name: `${metric.name}_sum`, values: sumValues },
        now,
        true
      )
    );
  }

  return results;
}

function toMetricData(metric: PromMetric, now: [number, number]): MetricData[] {
  switch (metric.type) {
    case 'counter':
      return [toGaugeOrSumData(metric, now, true)];
    case 'histogram':
      return [toHistogramData(metric, now)];
    case 'summary':
      return toSummaryData(metric, now);
    case 'gauge':
    default:
      return [toGaugeOrSumData(metric, now, null)];
  }
}

export class PromClientMetricProducer implements MetricProducer {
  async collect(): Promise<CollectionResult> {
    const snapshot =
      (await register.getMetricsAsJSON()) as unknown as PromMetric[];
    const now = millisToHrTime(Date.now());
    const metrics = snapshot
      .flatMap((metric) => toMetricData(metric, now))
      .filter((metric) => metric.dataPoints.length > 0);

    return {
      resourceMetrics: {
        resource: emptyResource(),
        scopeMetrics: [{ scope: SCOPE, metrics }],
      },
      errors: [],
    };
  }
}

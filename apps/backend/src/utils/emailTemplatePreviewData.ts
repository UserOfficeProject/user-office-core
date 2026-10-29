import {
  buildSubstitutionData,
  TemplateVariable,
} from './emailTemplateRenderer';

const PROPOSAL_WORKFLOW_PREVIEW_DATA: Record<string, unknown> = {
  proposals: [
    {
      primaryKey: 1,
      proposalId: '123456',
      title: 'Sample proposal',
      commentForUser: null,
    },
  ],
  instruments: [
    {
      id: 1,
      name: 'Sample instrument',
      shortCode: 'SAMPLE',
      description: 'Sample instrument for preview',
      managementTimeAllocation: 1,
    },
  ],
  technicalReviews: [
    {
      instrumentId: 1,
      status: 0,
      publicComment: 'Sample technical review comment',
    },
  ],
  call: {
    shortCode: 'SAMPLE',
    startCall: '2026-01-01T00:00:00.000Z',
    endCall: '2026-12-31T23:59:59.000Z',
  },
};

function isPlaceholder(value: unknown, path: string): boolean {
  if (value === path) {
    return true;
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const entries = Object.entries(value);

  return (
    entries.length > 0 &&
    entries.every(([key, child]) => isPlaceholder(child, `${path}.${key}`))
  );
}

export function buildEmailTemplatePreviewData(
  variables: TemplateVariable[]
): Record<string, unknown> {
  const data = buildSubstitutionData(variables);

  for (const [key, sample] of Object.entries(PROPOSAL_WORKFLOW_PREVIEW_DATA)) {
    if (isPlaceholder(data[key], key)) {
      data[key] = sample;
    }
  }

  return data;
}

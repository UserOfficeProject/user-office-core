import { extractAnswerMap } from './answerMap';
import { FullProposalPDFData } from './proposal';
import { DataType } from '../../models/Template';

const answer = (
  naturalKey: string,
  dataType: DataType,
  value: unknown,
  config: Record<string, unknown> = {}
) => ({
  question: { naturalKey, dataType },
  config,
  value,
});

const proposalData = (
  fields: ReturnType<typeof answer>[],
  genericTemplates: unknown[] = []
) =>
  ({
    questionarySteps: [{ fields }],
    genericTemplates,
  }) as unknown as FullProposalPDFData;

describe('extractAnswerMap', () => {
  it('keys every answer by its question natural key', () => {
    const answers = extractAnswerMap(
      proposalData([
        answer('title', DataType.TEXT_INPUT, 'A study'),
        answer('count', DataType.NUMBER_INPUT, 7),
      ])
    );

    expect(answers).toEqual({ title: 'A study', count: 7 });
  });

  it('flattens answers across every questionary step', () => {
    const data = {
      questionarySteps: [
        { fields: [answer('a', DataType.TEXT_INPUT, 1)] },
        { fields: [answer('b', DataType.TEXT_INPUT, 2)] },
      ],
      genericTemplates: [],
    } as unknown as FullProposalPDFData;

    expect(Object.keys(extractAnswerMap(data))).toEqual(['a', 'b']);
  });

  it('formats a date as an ISO day', () => {
    const answers = extractAnswerMap(
      proposalData([answer('when', DataType.DATE, '2026-03-09T23:30:00Z')])
    );

    expect(answers.when).toBe('2026-03-09');
  });

  it('appends the time when the question asks for it', () => {
    const answers = extractAnswerMap(
      proposalData([
        answer('when', DataType.DATE, '2026-03-09T12:00:00Z', {
          includeTime: true,
        }),
      ])
    );

    expect(answers.when).toMatch(/^2026-03-09 /);
  });

  it('keeps rich text unescaped so the template can emit it as HTML', () => {
    const answers = extractAnswerMap(
      proposalData([answer('body', DataType.RICH_TEXT_INPUT, '<p>hi</p>')])
    );

    expect(String(answers.body)).toBe('<p>hi</p>');
  });

  it('expands a generic template answer into its own field map', () => {
    const answers = extractAnswerMap(
      proposalData(
        [
          answer('equipment', DataType.GENERIC_TEMPLATE, [
            { questionaryId: 5, questionId: 'q1' },
          ]),
        ],
        [
          {
            genericTemplate: {
              questionaryId: 5,
              questionId: 'q1',
              title: 'Detector',
            },
            genericTemplateQuestionaryFields: [
              answer('basis', DataType.GENERIC_TEMPLATE_BASIS, null),
              answer('serial', DataType.TEXT_INPUT, 'SN-1'),
            ],
          },
        ]
      )
    );

    expect(answers.equipment).toEqual([
      { generic_template_basis: 'Detector', serial: 'SN-1' },
    ]);
  });

  it('skips a generic template answer with no matching template', () => {
    const answers = extractAnswerMap(
      proposalData([
        answer('equipment', DataType.GENERIC_TEMPLATE, [
          { questionaryId: 99, questionId: 'missing' },
        ]),
      ])
    );

    expect(answers.equipment).toEqual([]);
  });
});

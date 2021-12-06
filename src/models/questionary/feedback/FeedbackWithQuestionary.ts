import { GetFeedbackQuery } from 'generated/sdk';
import { ExcludeNull } from 'utils/utilTypes';

export type FeedbackWithQuestionary = ExcludeNull<GetFeedbackQuery['feedback']>;

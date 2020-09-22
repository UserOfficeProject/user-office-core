import { createContext, default as React } from 'react';

export const SubmissionContext = createContext<{
  dispatch: React.Dispatch<any>;
} | null>(null);

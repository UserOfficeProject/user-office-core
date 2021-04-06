import { ApplicationEvent } from '../events/applicationEvents';

export type handleEvent = (event: ApplicationEvent) => void;

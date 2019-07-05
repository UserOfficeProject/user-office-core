import { ApplicationEvent } from "../events/applicationEvents";

export default function createHandler() {
  // Handler that just logs every event to stdout
  
  return function loggingHandler(event: ApplicationEvent) {
    const json = JSON.stringify(event);
    const timestamp = new Date().toLocaleString();
    console.log(`${timestamp} -- ${json}`);
  };
}

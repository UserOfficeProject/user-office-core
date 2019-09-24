import { ILogger } from "../../utils/Logger";

class DummyLogger implements ILogger {
  logInfo(message: string, context: object): void {
    
  }
  logWarn(message: string, context: object): void {
    
  }
  logDebug(message: string, context: object): void {
    
  }
  logError(message: string, context: object): void {
    
  }
  log(
    level: import("../../utils/Logger").LEVEL,
    message: string,
    context: object
  ): void {
    
  }
}

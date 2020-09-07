import { ConsoleLogger } from './Logger';
test('Should able to create log with circular dependency', () => {
  var logger = new ConsoleLogger();
  const circ: ContainsCircularDependency = { circularDependency: null };
  circ.circularDependency = circ;
  logger.logWarn('Warning', circ);
});

interface ContainsCircularDependency {
  circularDependency: ContainsCircularDependency | null;
}

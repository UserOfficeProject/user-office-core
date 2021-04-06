import 'reflect-metadata';

switch (process.env.DEPENDENCY_CONFIG) {
  case 'e2e':
    require('./dependencyConfigE2E');
    break;
  case 'ess':
    require('./dependencyConfigESS');
    break;
  case 'stfc':
    require('./dependencyConfigSTFC');
    break;
  case 'test':
    require('./dependencyConfigTest');
    break;
  default:
    throw new Error(
      `process.env.DEPENDENCY_CONFIG contains invalid value '${process.env.DEPENDENCY_CONFIG}'.
       Available values are <e2e|ess|stfc|test>`
    );
}

export {};

import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';

export function configureDevelopmentEnvironment() {
  if (process.env.NODE_ENV === 'development') {
    // only toggle for development, as production already has the desired values
    container.resolve<() => void>(Tokens.EnableDefaultFeatures)();
    container.resolve<() => void>(Tokens.SetColourTheme)();
  }
}

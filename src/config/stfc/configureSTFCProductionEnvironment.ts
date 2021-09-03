import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../Tokens';

export function configureSTFCProductionEnvironment() {
  container.resolve<() => void>(Tokens.EnableDefaultFeatures)();
  container.resolve<() => void>(Tokens.SetColourTheme)();
}

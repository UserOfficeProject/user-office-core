import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ExperimentDataSource } from '../ExperimentDataSource';

@injectable()
export default class PostgresExperimentDataSource
  implements ExperimentDataSource
{
  constructor(
    @inject(Tokens.ExperimentDataSource)
    private experimentDataSource: ExperimentDataSource
  ) {}
}

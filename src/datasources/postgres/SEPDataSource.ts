/* eslint-disable @typescript-eslint/camelcase */
import { SEP } from '../../models/SEP';
import { SEPDataSource } from '../SEPDataSource';
import database from './database';
import { SEPRecord } from './records';

export default class PostgresSEPDataSource implements SEPDataSource {
  private createSEPObject(sep: SEPRecord) {
    return new SEP(
      sep.sep_id,
      sep.code,
      sep.description,
      sep.number_ratings_required,
      sep.active
    );
  }

  async create(
    code: string,
    description: string,
    numberRatingsRequired: number | null,
    active: boolean
  ) {
    return database
      .insert(
        {
          code: code,
          description: description,
          number_ratings_required: numberRatingsRequired,
          active: active,
        },
        ['*']
      )
      .from('SEPs')
      .then((resultSet: SEPRecord[]) => this.createSEPObject(resultSet[0]));
  }

  async get() {
    return database
      .select()
      .from('SEPs')
      .then((seps: SEPRecord[]) => {
        return seps.map(sep => this.createSEPObject(sep));
      });
  }
}

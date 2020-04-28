import * as fs from 'fs';

import { Page } from '../../models/Admin';
import { logger } from '../../utils/Logger';
import { AdminDataSource, Entry } from '../AdminDataSource';
import database from './database';
import {
  CountryRecord,
  createPageObject,
  InstitutionRecord,
  NationalityRecord,
  PagetextRecord,
} from './records';

export default class PostgresAdminDataSource implements AdminDataSource {
  async get(id: number): Promise<string | null> {
    return database
      .select('content')
      .from('pagetext')
      .where('pagetext_id', id)
      .first()
      .then(res => (res ? res.content : null));
  }

  async setPageText(id: number, content: string): Promise<Page> {
    return database
      .update({
        content,
      })
      .from('pagetext')
      .where('pagetext_id', id)
      .returning('*')
      .then((updatedRows: Array<PagetextRecord>) => {
        if (updatedRows.length === 0) {
          throw new Error(`Could not update page with id:${id}`);
        }

        return createPageObject(updatedRows[0]);
      });
  }

  async getNationalities(): Promise<Entry[]> {
    return database
      .select()
      .from('nationalities')
      .then((natDB: NationalityRecord[]) =>
        natDB.map(nat => {
          return { id: nat.nationality_id, value: nat.nationality };
        })
      );
  }

  async getInstitutions(): Promise<Entry[]> {
    return database
      .select()
      .from('institutions')
      .where('verified', true)
      .orderByRaw('institution_id=1 desc')
      .orderBy('institution', 'asc')
      .then((intDB: InstitutionRecord[]) =>
        intDB.map(int => {
          return { id: int.institution_id, value: int.institution };
        })
      );
  }

  async getInstitution(id: number): Promise<string | null> {
    return database
      .select('*')
      .from('institutions')
      .where('institution_id', id)
      .first()
      .then((res: InstitutionRecord) => res.institution);
  }

  async getCountries(): Promise<Entry[]> {
    return database
      .select()
      .from('countries')
      .then((countDB: CountryRecord[]) =>
        countDB.map(count => {
          return { id: count.country_id, value: count.country };
        })
      );
  }

  async resetDB() {
    return new Promise<boolean>((resolve, reject) => {
      const directoryPath = './db_patches';
      fs.readdir(directoryPath, async function(err, files) {
        if (err) {
          logger.logError(err.message, err);

          return false;
        }
        for await (const file of files) {
          const contents = fs.readFileSync(`${directoryPath}/${file}`, 'utf8');
          await database
            .raw(contents)
            .then(() => console.log(`${file} executed`))
            .catch(err => {
              console.error(`${file} failed. ${err}`);
              resolve(false);
            });
        }

        resolve(true);
      });
    });
  }
}

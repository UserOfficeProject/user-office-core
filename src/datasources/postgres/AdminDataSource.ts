import * as fs from 'fs';

import { Page } from '../../models/Admin';
import { Institution } from '../../models/Institution';
import { BasicUserDetails } from '../../models/User';
import { logger } from '../../utils/Logger';
import { AdminDataSource, Entry } from '../AdminDataSource';
import { InstitutionsFilter } from './../../resolvers/queries/InstitutionsQuery';
import database from './database';
import {
  CountryRecord,
  createPageObject,
  InstitutionRecord,
  NationalityRecord,
  PagetextRecord,
} from './records';
import { UserRecord, createBasicUserObject } from './records';

export default class PostgresAdminDataSource implements AdminDataSource {
  async updateInstitution(
    institution: Institution
  ): Promise<Institution | null> {
    return database
      .update({
        institution: institution.name,
        verified: institution.verified,
      })
      .from('institutions')
      .where('institution_id', institution.id)
      .returning('*')
      .then((updatedRows: Array<InstitutionRecord>) => {
        if (updatedRows.length === 0) {
          throw new Error(`Could not update page with id:${institution.id}`);
        }

        return {
          id: updatedRows[0].institution_id,
          name: updatedRows[0].institution,
          verified: updatedRows[0].verified,
        };
      });
  }

  async createInstitution(
    institution: Institution
  ): Promise<Institution | null> {
    return database
      .insert({
        institution: institution.name,
        verified: institution.verified,
      })
      .into('institutions')
      .returning(['*'])
      .then((inst: InstitutionRecord[]) => {
        if (inst.length !== 1) {
          throw new Error('Could not create call');
        }

        return {
          id: inst[0].institution_id,
          name: inst[0].institution,
          verified: inst[0].verified,
        };
      });
  }

  async deleteInstitution(id: number): Promise<Institution> {
    return database('institutions')
      .where('institutions.institution_id', id)
      .del()
      .from('institutions')
      .returning('*')
      .then((inst: InstitutionRecord[]) => {
        if (inst === undefined || inst.length !== 1) {
          throw new Error(`Could not delete institution with id:${id}`);
        }

        return {
          id: inst[0].institution_id,
          name: inst[0].institution,
          verified: inst[0].verified,
        };
      });
  }

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

  async getInstitutions(filter: InstitutionsFilter): Promise<Institution[]> {
    return database
      .select()
      .from('institutions')
      .orderByRaw('institution_id=1 desc')
      .orderBy('institution', 'asc')
      .modify(query => {
        if (filter?.isVerified) {
          query.where('verified', filter.isVerified);
        }
      })
      .then((intDB: InstitutionRecord[]) =>
        intDB.map(int => {
          return {
            id: int.institution_id,
            name: int.institution,
            verified: int.verified,
          };
        })
      );
  }

  async getInstitution(id: number): Promise<Institution | null> {
    return database
      .select('*')
      .from('institutions')
      .where('institution_id', id)
      .first()
      .then(
        (int: InstitutionRecord) =>
          new Institution(int.institution_id, int.institution, int.verified)
      );
  }

  async getInstitutionUsers(id: number): Promise<BasicUserDetails[]> {
    return database
      .select()
      .from('users')
      .where('organisation', id)
      .then((users: UserRecord[]) =>
        users.map(user => createBasicUserObject(user))
      );
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

  /**
   * NB! This will actually wipe the database
   */
  async resetDB() {
    await database.raw(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO duouser;
        GRANT ALL ON SCHEMA public TO public;
      `);

    return await this.applyPatches();
  }

  async applyPatches(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const log = [`Upgrade started: ${Date.now()}`];
      const directoryPath = './db_patches';
      fs.readdir(directoryPath, async function(err, files) {
        if (err) {
          logger.logError(err.message, err);
          log.push(err.message);

          return false;
        }
        for await (const file of files) {
          const contents = fs.readFileSync(`${directoryPath}/${file}`, 'utf8');
          await database
            .raw(contents)
            .then(result => {
              const msg = `${file} executed. ${result.command || ''}\n`;
              log.push(msg);
              console.log(msg);
            })
            .catch(err => {
              const msg = `${file} failed. ${err}`;
              log.push(msg);
              console.error(msg);
              resolve(log.join('\n'));
            });
        }

        resolve(log.join('\n'));
      });
    });
  }
}

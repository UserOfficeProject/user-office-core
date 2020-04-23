import { SEP, SEPAssignment } from '../../models/SEP';
import { SEPDataSource } from '../SEPDataSource';

export const dummySEP = new SEP(
  1,
  'SEP 1',
  'Scientific evaluation panel 1',
  2,
  true
);

export const anotherDummySEP = new SEP(
  2,
  'SEP 2',
  'Scientific evaluation panel 2',
  2,
  false
);

export const dummySEPWithoutCode = new SEP(
  2,
  '',
  'Scientific evaluation panel 2',
  2,
  false
);

export const dummySEPs = [dummySEP, anotherDummySEP];

export const dummySEPAssignment = new SEPAssignment(
  null,
  2,
  1,
  new Date('2020-04-20 08:25:12.23043+00'),
  false,
  null,
  false
);

export const anotherDummySEPAssignment = new SEPAssignment(
  null,
  3,
  2,
  new Date('2020-04-20 08:25:12.23043+00'),
  false,
  null,
  false
);

export const dummySEPAssignments = [
  dummySEPAssignment,
  anotherDummySEPAssignment,
];

export class SEPDataSourceMock implements SEPDataSource {
  async create(
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ) {
    const id = 2;

    return new SEP(id, code, description, numberRatingsRequired, active);
  }

  async update(
    id: number,
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ) {
    return new SEP(id, code, description, numberRatingsRequired, active);
  }

  async get(id: number) {
    if (id && id > 0) {
      if (id == dummySEP.id) {
        return dummySEP;
      }
    }

    return null;
  }

  async getAll(filter?: string, first?: number, offset?: number) {
    // NOTE: Copy sorted by id 'desc'
    let dummySEPsCopy = [...dummySEPs.sort((a, b) => b.id - a.id)];

    if (filter) {
      dummySEPsCopy = dummySEPsCopy.filter(
        sep => sep.code.includes(filter) || sep.description.includes(filter)
      );
    }

    if (first || offset) {
      dummySEPsCopy = dummySEPsCopy.slice(
        offset || 0,
        first ? first + (offset || 0) : dummySEPsCopy.length
      );
    }

    return { totalCount: dummySEPsCopy.length, seps: dummySEPsCopy };
  }

  async getAssignments(id: number) {
    return dummySEPAssignments.filter(assignment => assignment.sepId === id);
  }

  async assignChairAndSecretary(memberIds: number[], sepId: number) {
    const sep = dummySEPs.find(element => element.id === sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${sepId}`);
  }

  async assignMember(memberId: number, sepId: number) {
    const sep = dummySEPs.find(element => element.id === sepId);

    if (sep) {
      return sep;
    }

    throw new Error(`SEP not found ${sepId}`);
  }
}

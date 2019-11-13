import { UserDataSource } from "../UserDataSource";
import { User } from "../../models/User";
import { Role } from "../../models/Role";

export const dummyUserOfficer = new User(
  4,
  "Mr.",
  "John",
  "Smith",
  "Doe",
  "JoDo",
  "Hailey",
  "683142616",
  "male",
  "United Kingdom",
  "1990-01-25",
  "Johnston, Hammes and Keeling",
  "IT department",
  "Vietnam, Consueloburgh, 4788 Frederik Parkways",
  "Producer",
  "Dorris83@gmail.com",
  true,
  "(012) 325-1151",
  "1-316-182-3694",
  "2019-07-17 08:25:12.23043+00",
  "2019-07-17 08:25:12.23043+00"
);
export const dummyUser = new User(
  2,
  "",
  "Jane",
  null,
  "Doe",
  "JaDa",
  "Meta",
  "568567353",
  "male",
  "Pitcairn Islands",
  "1981-05-04",
  "Anderson LLC",
  "IT department",
  "Sudan, North Catalina, 7486 Schimmel Pine",
  "Architect",
  "Cleve30@yahoo.com",
  true,
  "045-272-7984 x34539",
  "028-065-8228 x08367",
  "2019-07-17 08:25:12.23043+00",
  "2019-07-17 08:25:12.23043+00"
);

export const dummyUserNotOnProposal = new User(
  3,
  "Dr.",
  "Noel",
  null,
  "Doe",
  "NoDO",
  "Damion",
  "182082741",
  "female",
  "Zambia",
  "1991-11-08",
  "Ritchie - Balistreri",
  "IT department",
  "Andorra, Strackeview, 81436 Summer Mill",
  "Facilitator",
  "Tyrique41@hotmail.com",
  true,
  "1-272-760-1466 x03877",
  "174-603-1024",
  "2019-07-17 08:25:12.23043+00",
  "2019-07-17 08:25:12.23043+00"
);

export class userDataSource implements UserDataSource {
  async checkOrcIDExist(orcID: string): Promise<Boolean | null> {
    return false;
  }
  async checkEmailExist(email: string): Promise<Boolean | null> {
    return false;
  }
  async getPasswordByEmail(email: string): Promise<string | null> {
    return "$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm";
  }
  async setUserEmailVerified(id: number): Promise<Boolean> {
    return true;
  }
  async setUserPassword(id: number, password: string): Promise<Boolean> {
    return true;
  }
  async getByEmail(email: string): Promise<User | null> {
    if (dummyUser.email === email) {
      return dummyUser;
    } else {
      return null;
    }
  }
  async addUserForReview(
    userID: number,
    proposalID: number
  ): Promise<Boolean | null> {
    return true;
  }
  async getByUsername(username: string): Promise<User | null> {
    return dummyUser;
  }
  async getPasswordByUsername(username: string): Promise<string | null> {
    return "$2a$10$1svMW3/FwE5G1BpE7/CPW.aMyEymEBeWK4tSTtABbsoo/KaSQ.vwm";
  }
  async setUserRoles(id: number, roles: number[]): Promise<Boolean | null> {
    return true;
  }
  async getUserRoles(id: number): Promise<Role[]> {
    if (id == dummyUserOfficer.id) {
      return [{ id: 1, shortCode: "user_officer", title: "User Officer" }];
    } else {
      return [{ id: 2, shortCode: "user", title: "User" }];
    }
  }
  async getRoles(): Promise<Role[]> {
    return [
      { id: 1, shortCode: "user_officer", title: "User Officer" },
      { id: 2, shortCode: "user", title: "User" }
    ];
  }
  async update(user: User): Promise<User | null> {
    return dummyUser;
  }

  async get(id: number) {
    return dummyUser;
  }

  async getUsers(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; users: User[] }> {
    return { totalCount: 2, users: [dummyUser, dummyUserOfficer] };
  }

  async getProposalUsers(id: number) {
    return [dummyUser];
  }

  async create(firstname: string, lastname: string) {
    return dummyUser;
  }
}

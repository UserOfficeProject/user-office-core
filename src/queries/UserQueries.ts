import { UserDataSource } from "../datasources/UserDataSource";
import { User, BasicUserDetails } from "../models/User";
import { UserAuthorization } from "../utils/UserAuthorization";
var rp = require("request-promise");
const jsonwebtoken = require("jsonwebtoken");
import * as bcrypt from "bcryptjs";

export default class UserQueries {
  constructor(
    private dataSource: UserDataSource,
    private userAuth: UserAuthorization
  ) {}

  async getAgent(id: number) {
    return this.dataSource.get(id);
  }

  async get(agent: User | null, id: number) {
    if (
      (await this.userAuth.isUserOfficer(agent)) ||
      (await this.userAuth.isUser(agent, id))
    ) {
      return this.dataSource.get(id);
    } else {
      return null;
    }
  }

  async getBasic(agent: User | null, id: number) {
    if (!agent) {
      return null;
    }
    const user = await this.dataSource.getBasicUserInfo(id);
    if (!user) {
      return null;
    }
    return new BasicUserDetails(
      user.id,
      user.firstname,
      user.lastname,
      user.organisation,
      user.position
    );
  }

  async checkEmailExist(agent: User | null, email: string) {
    return this.dataSource.checkEmailExist(email);
  }

  async getOrcIDAccessToken(authorizationCode: string) {
    var options = {
      method: "POST",
      uri: process.env.ORCID_TOKEN_URL,
      qs: {
        client_id: process.env.ORCID_CLIENT_ID,
        client_secret: process.env.ORCID_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: authorizationCode
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      json: true // Automatically parses the JSON string in the response
    };
    return rp(options)
      .then(function(resp: any) {
        return {
          ...resp
        };
      })
      .catch(function(err: any) {
        return null;
      });
  }

  async getOrcIDInformation(authorizationCode: string) {
    // If in development fake response
    if (process.env.NODE_ENV === "development") {
      return {
        orcid: "0000-0000-0000-0000",
        orcidHash: "asdadgiuerervnaofhioa",
        refreshToken: "asdadgiuerervnaofhioa",
        firstname: "Kalle",
        lastname: "Kallesson"
      };
    }

    const orcData = await this.getOrcIDAccessToken(authorizationCode);
    if (!orcData) {
      return null;
    }

    const user = await this.dataSource.getByOrcID(orcData.orcid);
    if (user) {
      const roles = await this.dataSource.getUserRoles(user.id);
      const token = jsonwebtoken.sign({ user, roles }, process.env.secret, {
        expiresIn: process.env.tokenLife
      });
      return { token };
    }
    var options = {
      uri: `${process.env.ORCID_API_URL}${orcData.orcid}/person`,
      headers: {
        Accept: "application/vnd.orcid+json",
        Authorization: `Bearer ${orcData.access_token}`
      },
      json: true // Automatically parses the JSON string in the response
    };

    return rp(options)
      .then(function(resp: any) {
        // Generate hash for OrcID inorder to prevent user from change OrcID when sending back
        const salt = "$2a$10$1svMW3/FwE5G1BpE7/CPW.";
        const hash = bcrypt.hashSync(resp.name.path, salt);
        return {
          orcid: resp.name.path,
          orcidHash: hash,
          refreshToken: orcData.refresh_token,
          firstname: resp.name["given-names"]
            ? resp.name["given-names"].value
            : null,
          lastname: resp.name["family-name"]
            ? resp.name["family-name"].value
            : null
        };
      })
      .catch(function(err: any) {
        return null;
      });
  }

  async getAll(
    agent: User | null,
    filter?: string,
    first?: number,
    offset?: number,
    usersOnly?: boolean,
    subtractUsers?: [number]
  ) {
    if (agent == null) {
      return null;
    }
    return this.dataSource.getUsers(
      filter,
      first,
      offset,
      usersOnly,
      subtractUsers
    );
  }

  async getRoles(agent: User | null) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getRoles();
    } else {
      return null;
    }
  }

  async getUser(id: number) {
    return this.dataSource.get(id);
  }

  async getProposers(agent: User | null, proposalId: number) {
    return this.dataSource.getProposalUsers(proposalId);
  }
}

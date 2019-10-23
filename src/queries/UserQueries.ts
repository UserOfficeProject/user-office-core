import { UserDataSource } from "../datasources/UserDataSource";
import { User } from "../models/User";
import { UserAuthorization } from "../utils/UserAuthorization";
var rp = require("request-promise");
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

  async getOrcIDAccessToken(authorizationCode: string) {
    var options = {
      method: "POST",
      uri: "https://sandbox.orcid.org/oauth/token",
      qs: {
        client_id: "APP-CIF25IJ0S3CDB3C8",
        client_secret: "c3ba31f8-7e79-4d0d-bf4c-b6e6c300addd",
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
        console.log(resp);
        return {
          ...resp
        };
      })
      .catch(function(err: any) {
        console.log(err);
        return null;
      });
  }

  async getOrcIDInformation(user: User | null, authorizationCode: string) {
    const orcData = await this.getOrcIDAccessToken(authorizationCode);
    if (!orcData) {
      return null;
    }
    var options = {
      uri: `https://api.sandbox.orcid.org/v2.1/${orcData.orcid}/person`,
      headers: {
        Accept: "application/vnd.orcid+json",
        Authorization: `Bearer ${orcData.access_token}`
      },
      json: true // Automatically parses the JSON string in the response
    };

    return rp(options)
      .then(function(resp: any) {
        console.log(resp);
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
    offset?: number
  ) {
    if (agent == null) {
      return null;
    }
    return this.dataSource.getUsers(filter, first, offset);
  }

  async getRoles(agent: User | null) {
    if (await this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getRoles();
    } else {
      return null;
    }
  }

  async getProposers(agent: User | null, proposalId: number) {
    return this.dataSource.getProposalUsers(proposalId);
  }
}

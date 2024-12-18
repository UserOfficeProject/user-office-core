/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { AccountActivationService } from './services/AccountActivationService';
import { AddressService } from './services/AddressService';
import { ApiKeysService } from './services/ApiKeysService';
import { BasicPersonDetailsService } from './services/BasicPersonDetailsService';
import { CountryService } from './services/CountryService';
import { DataLookupService } from './services/DataLookupService';
import { EmergencyContactService } from './services/EmergencyContactService';
import { EstablishmentService } from './services/EstablishmentService';
import { FacilityService } from './services/FacilityService';
import { FailedLoginService } from './services/FailedLoginService';
import { FedIdRequestsService } from './services/FedIdRequestsService';
import { FedIdsService } from './services/FedIdsService';
import { GroupMembershipsService } from './services/GroupMembershipsService';
import { HealthcheckService } from './services/HealthcheckService';
import { IdeiioService } from './services/IdeiioService';
import { MonitorService } from './services/MonitorService';
import { PasswordResetService } from './services/PasswordResetService';
import { PermissionUserGroupService } from './services/PermissionUserGroupService';
import { PersonService } from './services/PersonService';
import { PersonDetailsService } from './services/PersonDetailsService';
import { PersonStatusService } from './services/PersonStatusService';
import { PersonTitleService } from './services/PersonTitleService';
import { PrivacyService } from './services/PrivacyService';
import { RoleService } from './services/RoleService';
import { SessionsService } from './services/SessionsService';
import { TokenService } from './services/TokenService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class UOWS {
    public readonly accountActivation: AccountActivationService;
    public readonly address: AddressService;
    public readonly apiKeys: ApiKeysService;
    public readonly basicPersonDetails: BasicPersonDetailsService;
    public readonly country: CountryService;
    public readonly dataLookup: DataLookupService;
    public readonly emergencyContact: EmergencyContactService;
    public readonly establishment: EstablishmentService;
    public readonly facility: FacilityService;
    public readonly failedLogin: FailedLoginService;
    public readonly fedIdRequests: FedIdRequestsService;
    public readonly fedIds: FedIdsService;
    public readonly groupMemberships: GroupMembershipsService;
    public readonly healthcheck: HealthcheckService;
    public readonly ideiio: IdeiioService;
    public readonly monitor: MonitorService;
    public readonly passwordReset: PasswordResetService;
    public readonly permissionUserGroup: PermissionUserGroupService;
    public readonly person: PersonService;
    public readonly personDetails: PersonDetailsService;
    public readonly personStatus: PersonStatusService;
    public readonly personTitle: PersonTitleService;
    public readonly privacy: PrivacyService;
    public readonly role: RoleService;
    public readonly sessions: SessionsService;
    public readonly token: TokenService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'http://localhost:4008/users-service',
            VERSION: config?.VERSION ?? '1.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.accountActivation = new AccountActivationService(this.request);
        this.address = new AddressService(this.request);
        this.apiKeys = new ApiKeysService(this.request);
        this.basicPersonDetails = new BasicPersonDetailsService(this.request);
        this.country = new CountryService(this.request);
        this.dataLookup = new DataLookupService(this.request);
        this.emergencyContact = new EmergencyContactService(this.request);
        this.establishment = new EstablishmentService(this.request);
        this.facility = new FacilityService(this.request);
        this.failedLogin = new FailedLoginService(this.request);
        this.fedIdRequests = new FedIdRequestsService(this.request);
        this.fedIds = new FedIdsService(this.request);
        this.groupMemberships = new GroupMembershipsService(this.request);
        this.healthcheck = new HealthcheckService(this.request);
        this.ideiio = new IdeiioService(this.request);
        this.monitor = new MonitorService(this.request);
        this.passwordReset = new PasswordResetService(this.request);
        this.permissionUserGroup = new PermissionUserGroupService(this.request);
        this.person = new PersonService(this.request);
        this.personDetails = new PersonDetailsService(this.request);
        this.personStatus = new PersonStatusService(this.request);
        this.personTitle = new PersonTitleService(this.request);
        this.privacy = new PrivacyService(this.request);
        this.role = new RoleService(this.request);
        this.sessions = new SessionsService(this.request);
        this.token = new TokenService(this.request);
    }
}


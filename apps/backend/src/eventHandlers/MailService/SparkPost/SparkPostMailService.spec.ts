import SendMailOptions from '../MailService';
import { SparkPost } from './SparkPost';
import { SparkPostMailService } from './SparkPostMailService';

// Mock dependencies
jest.mock('@user-office-software/duo-logger', () => ({
  logger: {
    logInfo: jest.fn(),
  },
}));

jest.mock('./SparkPost');

// Mock the helper functions module
jest.mock('../../../utils/helperFunctions', () => ({
  isProduction: false,
  isStaging: false,
}));

// Import the mocked helper functions to manipulate them in tests
const mockHelperFunctions = jest.requireMock('../../../utils/helperFunctions');

describe('SparkPostMailService', () => {
  let mockSparkPostClient: jest.Mocked<SparkPost>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    // Mock SparkPost constructor to return our mock client
    mockSparkPostClient = {
      send: jest.fn(),
      getTemplates: jest.fn(),
    } as unknown as jest.Mocked<SparkPost>;

    (SparkPost as jest.MockedClass<typeof SparkPost>).mockImplementation(
      () => mockSparkPostClient
    );

    // Default environment flags
    mockHelperFunctions.isProduction = false;
    mockHelperFunctions.isStaging = false;
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should throw error when SPARKPOST_TOKEN is not defined', () => {
      delete process.env.SPARKPOST_TOKEN;

      expect(() => new SparkPostMailService()).toThrow(
        'Sparkpost token must be defined to be able to use the sparkpost client'
      );
    });

    it('should successfully create instance with valid SPARKPOST_TOKEN', () => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';

      expect(() => new SparkPostMailService()).not.toThrow();
    });

    it('should initialize SparkPost client with correct endpoint', () => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';

      new SparkPostMailService();

      expect(SparkPost).toHaveBeenCalledWith('test-token-123', {
        endpoint: 'https://api.eu.sparkpost.com:443',
      });
    });

    it('should set sinkEmail from environment variable', () => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';
      process.env.SINK_EMAIL = 'sink@example.com';

      const service = new SparkPostMailService();

      expect((service as any).sinkEmail).toBe('sink@example.com');
    });

    it('should have undefined sinkEmail when SINK_EMAIL is not set', () => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';
      delete process.env.SINK_EMAIL;

      const service = new SparkPostMailService();

      expect((service as any).sinkEmail).toBeUndefined();
    });
  });

  describe('sendMail - Non-production/staging environments', () => {
    let service: SparkPostMailService;

    beforeEach(() => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';
      service = new SparkPostMailService();
      mockHelperFunctions.isProduction = false;
      mockHelperFunctions.isStaging = false;
    });

    it('should return mock response without calling client when not in production/staging and no sinkEmail', async () => {
      delete process.env.SINK_EMAIL;

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com' }],
        substitution_data: { name: 'John' },
      };

      const result = await service.sendMail(mailOptions);

      expect(result).toEqual({
        results: {
          id: 'SparkPostMailService',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });
      expect(mockSparkPostClient.send).not.toHaveBeenCalled();
    });

    it('should return correct total_accepted_recipients count for mock response', async () => {
      delete process.env.SINK_EMAIL;

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [
          { address: 'user1@example.com' },
          { address: 'user2@example.com' },
          { address: 'user3@example.com' },
        ],
        substitution_data: { name: 'John' },
      };

      const result = await service.sendMail(mailOptions);

      expect(result.results.total_accepted_recipients).toBe(3);
      expect(result.results.total_rejected_recipients).toBe(0);
    });

    it('should redirect emails to sinkEmail when not production/staging but sinkEmail is defined', async () => {
      process.env.SINK_EMAIL = 'sink@example.com';
      const service2 = new SparkPostMailService();

      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [
          { address: 'user@example.com', header_to: 'Original Name' },
        ],
        substitution_data: { name: 'John' },
      };

      await service2.sendMail(mailOptions);

      expect(mockSparkPostClient.send).toHaveBeenCalledWith({
        content: {
          template_id: 'template-id-123',
        },
        recipients: [
          {
            address: {
              email: 'sink@example.com',
              header_to: 'user@example.com; original_header_to_Original Name',
            },
          },
        ],
        substitution_data: { name: 'John' },
      });
    });

    it('should handle recipients without header_to when redirecting to sinkEmail', async () => {
      process.env.SINK_EMAIL = 'sink@example.com';
      const service2 = new SparkPostMailService();

      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com' }],
      };

      await service2.sendMail(mailOptions);

      expect(mockSparkPostClient.send).toHaveBeenCalledWith({
        content: {
          template_id: 'template-id-123',
        },
        recipients: [
          {
            address: {
              email: 'sink@example.com',
              header_to: 'user@example.com',
            },
          },
        ],
        substitution_data: undefined,
      });
    });

    it('should redirect multiple recipients to sinkEmail correctly', async () => {
      process.env.SINK_EMAIL = 'sink@example.com';
      const service2 = new SparkPostMailService();

      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 3,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [
          { address: 'user1@example.com', header_to: 'User 1' },
          { address: 'user2@example.com' },
          { address: 'user3@example.com', header_to: 'User 3' },
        ],
      };

      await service2.sendMail(mailOptions);

      expect(mockSparkPostClient.send).toHaveBeenCalledWith({
        content: {
          template_id: 'template-id-123',
        },
        recipients: [
          {
            address: {
              email: 'sink@example.com',
              header_to: 'user1@example.com; original_header_to_User 1',
            },
          },
          {
            address: {
              email: 'sink@example.com',
              header_to: 'user2@example.com',
            },
          },
          {
            address: {
              email: 'sink@example.com',
              header_to: 'user3@example.com; original_header_to_User 3',
            },
          },
        ],
        substitution_data: undefined,
      });
    });
  });

  describe('sendMail - Production environment', () => {
    let service: SparkPostMailService;

    beforeEach(() => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';
      service = new SparkPostMailService();
      mockHelperFunctions.isProduction = true;
      mockHelperFunctions.isStaging = false;
    });

    it('should send to original recipients in production', async () => {
      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com', header_to: 'User Name' }],
        substitution_data: { name: 'John', code: '12345' },
      };

      await service.sendMail(mailOptions);

      expect(mockSparkPostClient.send).toHaveBeenCalledWith({
        content: {
          template_id: 'template-id-123',
        },
        recipients: [
          {
            address: {
              email: 'user@example.com',
              header_to: 'User Name',
            },
          },
        ],
        substitution_data: { name: 'John', code: '12345' },
      });
    });

    it('should handle recipients without header_to in production', async () => {
      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com' }],
      };

      await service.sendMail(mailOptions);

      expect(mockSparkPostClient.send).toHaveBeenCalledWith({
        content: {
          template_id: 'template-id-123',
        },
        recipients: [
          {
            address: {
              email: 'user@example.com',
              header_to: undefined,
            },
          },
        ],
        substitution_data: undefined,
      });
    });

    it('should handle multiple recipients in production', async () => {
      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 3,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [
          { address: 'user1@example.com', header_to: 'User 1' },
          { address: 'user2@example.com' },
          { address: 'user3@example.com', header_to: 'User 3' },
        ],
      };

      await service.sendMail(mailOptions);

      expect(mockSparkPostClient.send).toHaveBeenCalledWith({
        content: {
          template_id: 'template-id-123',
        },
        recipients: [
          {
            address: {
              email: 'user1@example.com',
              header_to: 'User 1',
            },
          },
          {
            address: {
              email: 'user2@example.com',
              header_to: undefined,
            },
          },
          {
            address: {
              email: 'user3@example.com',
              header_to: 'User 3',
            },
          },
        ],
        substitution_data: undefined,
      });
    });

    it('should integrate sinkEmail is ignored in production', async () => {
      process.env.SINK_EMAIL = 'sink@example.com';

      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com' }],
      };

      await service.sendMail(mailOptions);

      const [callArg] = mockSparkPostClient.send.mock.calls[0];
      const recipients = callArg.recipients as any[];
      expect(recipients[0].address.email).toBe('user@example.com');
    });

    it('should return client response in production', async () => {
      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-from-api-123',
          total_accepted_recipients: 2,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [
          { address: 'user1@example.com' },
          { address: 'user2@example.com' },
        ],
      };

      const result = await service.sendMail(mailOptions);

      expect(result).toEqual({
        results: {
          id: 'msg-id-from-api-123',
          total_accepted_recipients: 2,
          total_rejected_recipients: 0,
        },
      });
    });
  });

  describe('sendMail - Staging environment', () => {
    let service: SparkPostMailService;

    beforeEach(() => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';
      service = new SparkPostMailService();
      mockHelperFunctions.isProduction = false;
      mockHelperFunctions.isStaging = true;
    });

    it('should send to original recipients in staging', async () => {
      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com' }],
      };

      await service.sendMail(mailOptions);

      const [callArg] = mockSparkPostClient.send.mock.calls[0];
      const recipients = callArg.recipients as any[];
      expect(recipients[0].address.email).toBe('user@example.com');
    });

    it('should ignore sinkEmail in staging', async () => {
      process.env.SINK_EMAIL = 'sink@example.com';

      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com' }],
      };

      await service.sendMail(mailOptions);

      const [callArg] = mockSparkPostClient.send.mock.calls[0];
      const recipients = callArg.recipients as any[];
      expect(recipients[0].address.email).toBe('user@example.com');
    });
  });

  describe('sendMail - Error handling', () => {
    let service: SparkPostMailService;

    beforeEach(() => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';
      service = new SparkPostMailService();
      mockHelperFunctions.isProduction = true;
      mockHelperFunctions.isStaging = false;
    });

    it('should propagate client.send errors', async () => {
      const errorMessage = 'Failed to send email';
      mockSparkPostClient.send.mockRejectedValue(new Error(errorMessage));

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com' }],
      };

      await expect(service.sendMail(mailOptions)).rejects.toThrow(errorMessage);
    });

    it('should propagate client.send errors with specific error codes', async () => {
      const error = new Error('Invalid email address');
      mockSparkPostClient.send.mockRejectedValue(error);

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'invalid-email' }],
      };

      await expect(service.sendMail(mailOptions)).rejects.toThrow(error);
    });
  });

  describe('sendMail - Substitution data', () => {
    let service: SparkPostMailService;

    beforeEach(() => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';
      service = new SparkPostMailService();
      mockHelperFunctions.isProduction = true;
      mockHelperFunctions.isStaging = false;
    });

    it('should pass substitution_data to client.send', async () => {
      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const substitutionData = {
        firstName: 'John',
        lastName: 'Doe',
        confirmationLink: 'https://example.com/confirm?token=abc123',
        dynamicValue: {
          nested: 'value',
        },
      };

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com' }],
        substitution_data: substitutionData,
      };

      await service.sendMail(mailOptions);

      expect(mockSparkPostClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          substitution_data: substitutionData,
        })
      );
    });

    it('should handle undefined substitution_data', async () => {
      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com' }],
      };

      await service.sendMail(mailOptions);

      expect(mockSparkPostClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          substitution_data: undefined,
        })
      );
    });

    it('should handle empty object as substitution_data', async () => {
      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com' }],
        substitution_data: {},
      };

      await service.sendMail(mailOptions);

      expect(mockSparkPostClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          substitution_data: {},
        })
      );
    });
  });

  describe('getEmailTemplates', () => {
    let service: SparkPostMailService;

    beforeEach(() => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';
      service = new SparkPostMailService();
    });

    it('should call client.getTemplates with false parameter', async () => {
      mockSparkPostClient.getTemplates.mockResolvedValue({
        results: [],
      });

      await service.getEmailTemplates();

      expect(mockSparkPostClient.getTemplates).toHaveBeenCalledWith(false);
    });

    it('should return templates from client', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Welcome Email',
          description: 'Sends welcome email to new users',
          published: true,
          has_draft: false,
          has_published: true,
          last_update_time: '2024-01-15T10:30:00Z',
          last_use: '2024-01-20T14:20:00Z',
          shared_with_subaccounts: false,
        },
        {
          id: 'template-2',
          name: 'Password Reset',
          description: 'Sends password reset link',
          published: true,
          has_draft: false,
          has_published: true,
          last_update_time: '2024-01-10T08:00:00Z',
          last_use: '2024-01-19T16:45:00Z',
          shared_with_subaccounts: false,
        },
      ];

      mockSparkPostClient.getTemplates.mockResolvedValue({
        results: mockTemplates,
      });

      const result = await service.getEmailTemplates();

      expect(result).toEqual({
        results: mockTemplates,
      });
    });

    it('should handle empty templates list', async () => {
      mockSparkPostClient.getTemplates.mockResolvedValue({
        results: [],
      });

      const result = await service.getEmailTemplates();

      expect(result).toEqual({
        results: [],
      });
    });

    it('should propagate client.getTemplates errors', async () => {
      const errorMessage = 'Failed to fetch templates';
      mockSparkPostClient.getTemplates.mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(service.getEmailTemplates()).rejects.toThrow(errorMessage);
    });

    it('should handle templates with all properties', async () => {
      const fullTemplate = {
        id: 'complete-template',
        name: 'Complete Template',
        description: 'A template with all properties',
        published: true,
        has_draft: true,
        has_published: true,
        last_update_time: '2024-01-15T10:30:00Z',
        last_use: '2024-01-20T14:20:00Z',
        shared_with_subaccounts: true,
      };

      mockSparkPostClient.getTemplates.mockResolvedValue({
        results: [fullTemplate],
      });

      const result = await service.getEmailTemplates();

      expect(result.results[0]).toEqual(fullTemplate);
      expect(result.results[0].shared_with_subaccounts).toBe(true);
      expect(result.results[0].has_draft).toBe(true);
    });
  });

  describe('getEnvOptions (via sendMail execution path)', () => {
    let service: SparkPostMailService;

    beforeEach(() => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';
      service = new SparkPostMailService();
      mockHelperFunctions.isProduction = true;
      mockHelperFunctions.isStaging = false;
    });

    it('should structure options with correct content template_id', async () => {
      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'my-template-id' },
        recipients: [{ address: 'user@example.com' }],
      };

      await service.sendMail(mailOptions);

      const [callArg] = mockSparkPostClient.send.mock.calls[0];
      expect((callArg.content as any).template_id).toBe('my-template-id');
    });

    it('should omit header_to when undefined', async () => {
      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const mailOptions: SendMailOptions = {
        content: { template: 'template-id-123' },
        recipients: [{ address: 'user@example.com', header_to: undefined }],
      };

      await service.sendMail(mailOptions);

      const [callArg] = mockSparkPostClient.send.mock.calls[0];
      const recipients = callArg.recipients as any[];
      expect(recipients[0].address.header_to).toBeUndefined();
    });
  });

  describe('Integration scenarios', () => {
    let service: SparkPostMailService;

    beforeEach(() => {
      process.env.SPARKPOST_TOKEN = 'test-token-123';
      service = new SparkPostMailService();
      mockHelperFunctions.isProduction = true;
      mockHelperFunctions.isStaging = false;
    });

    it('should handle complete email workflow in production', async () => {
      mockSparkPostClient.getTemplates.mockResolvedValue({
        results: [
          {
            id: 'welcome-email',
            name: 'Welcome Email',
            description: 'Welcome letter',
            published: true,
            has_draft: false,
            has_published: true,
            last_update_time: '2024-01-15T10:30:00Z',
            last_use: '2024-01-20T14:20:00Z',
            shared_with_subaccounts: false,
          },
        ],
      });

      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'transmission-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      // Get templates
      const templates = await service.getEmailTemplates();
      expect(templates.results).toHaveLength(1);

      // Send mail using template
      const result = await service.sendMail({
        content: { template: templates.results[0].id },
        recipients: [{ address: 'user@example.com', header_to: 'John Doe' }],
        substitution_data: { firstName: 'John' },
      });

      expect(result.results.total_accepted_recipients).toBe(1);
      expect(mockSparkPostClient.send).toHaveBeenCalled();
    });

    it('should handle development environment scenario with sinkEmail', async () => {
      process.env.SINK_EMAIL = 'dev-sink@example.com';
      const devService = new SparkPostMailService();

      mockHelperFunctions.isProduction = false;
      mockHelperFunctions.isStaging = false;

      mockSparkPostClient.send.mockResolvedValue({
        results: {
          id: 'msg-id-123',
          total_accepted_recipients: 1,
          total_rejected_recipients: 0,
        },
      });

      const result = await devService.sendMail({
        content: { template: 'welcome-email' },
        recipients: [
          { address: 'real@production.com', header_to: 'Real User' },
        ],
        substitution_data: { firstName: 'Real' },
      });

      expect(result.results.id).toBe('msg-id-123');
      expect(mockSparkPostClient.send).toHaveBeenCalledWith({
        content: { template_id: 'welcome-email' },
        recipients: [
          {
            address: {
              email: 'dev-sink@example.com',
              header_to: 'real@production.com; original_header_to_Real User',
            },
          },
        ],
        substitution_data: { firstName: 'Real' },
      });
    });
  });
});

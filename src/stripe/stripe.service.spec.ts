import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { mockAwsParameters } from '../../test/mocks';

describe('StripeService', () => {
  let service: StripeService;
  let mockLogger: any;

  beforeEach(async () => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: 'AWS_PARAMETERS',
          useValue: mockAwsParameters,
        },
        {
          provide: 'LOGGER',
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return correct stripe instance based on isSupplementApp', () => {
    const stripe = service.getStripe(false);
    const supplementStripe = service.getStripe(true);

    expect(stripe).toBeDefined();
    expect(supplementStripe).toBeDefined();
    expect(stripe).not.toBe(supplementStripe);
  });

  // Add more test cases for each method as needed
});

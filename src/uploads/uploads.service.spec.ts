import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { ParametersModule } from '../config/config.module';
describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService],
      imports: [ParametersModule],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

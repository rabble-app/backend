import { Test, TestingModule } from '@nestjs/testing';
import { PostalCodeService } from './postal-code.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';

describe('PostalCodeService', () => {
  let service: PostalCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostalCodeService, PrismaService, JwtService],
      imports: [ParametersModule],
    }).compile();

    service = module.get<PostalCodeService>(PostalCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

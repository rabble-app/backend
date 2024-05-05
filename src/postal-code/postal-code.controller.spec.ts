import { Test, TestingModule } from '@nestjs/testing';
import { PostalCodeController } from './postal-code.controller';
import { PostalCodeService } from './postal-code.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ParametersModule } from '../config/config.module';

describe('PostalCodeController', () => {
  let controller: PostalCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostalCodeController],
      providers: [PostalCodeService, PrismaService, JwtService],
      imports: [ParametersModule],
    }).compile();

    controller = module.get<PostalCodeController>(PostalCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

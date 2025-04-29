import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../src/auth/auth.service';

describe('InsightsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let userId: string;
  let jwtToken: string;
  const testTime = 120000;
  const phone = `+44${faker.phone.number()}22`;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      prisma = app.get<PrismaService>(PrismaService);
      authService = app.get<AuthService>(AuthService);
      app.useGlobalPipes(new ValidationPipe());

      await app.init();
      await app.listen(process.env.PORT);

      // create dummy user for test
      const user = await prisma.user.create({
        data: {
          phone,
        },
      });
      userId = user.id;

      // create dummy token
      jwtToken = authService.generateToken({ userId });
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  }, testTime);

  afterAll(async () => {
    try {
      if (userId) {
        await prisma.user.delete({
          where: {
            id: userId,
          },
        });
      }
      if (app) {
        await app.close();
      }
    } catch (error) {
      console.error('Test teardown failed:', error);
    }
  });

  describe('InsightsController (e2e)', () => {
    // nwro
    it(
      '/insights/nwro/?years=2024(GET) should return nwro insight',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/insights/nwro/?years=2024`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
    // unique users
    it(
      '/insights/users/?years=2024(GET) should return unique users',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/insights/users/?years=2024`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
  });
});

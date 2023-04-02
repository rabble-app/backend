import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { Producer, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { CreateTeamDto } from '../../src/teams/dto/create-team.dto';

describe('TeamsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const phone = faker.phone.number();
  let user: User;
  let producer: Producer;
  let producerId: string;
  let buyingTeamId: string;
  const buyingTeam: CreateTeamDto = {
    name: 'Team 003',
    postalCode: '234-54',
    hostId: '',
    frequency: 'weekly',
    description: 'Dummy description',
    producerId: '3425',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    await app.listen(process.env.PORT);
    // create dummy user for test
    user = await prisma.user.create({
      data: {
        phone,
      },
    });
    buyingTeam.hostId = user.id;

    // create dummy producer for test
    producer = await prisma.producer.create({
      data: {
        userId: user.id,
        businessAddress: 'dummy Addresss',
        businessName: 'dummy name',
      },
    });
    buyingTeam.producerId = producer.id;
  }, 120000);

  afterAll(async () => {
    await app.close();
  });

  describe('TeamsController (e2e)', () => {
    // create team
    it('/teams/create(POST) should create a new buying team', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams/create')
        .send(buyingTeam)
        .expect(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
      buyingTeamId = response.body.data.id;
    });

    it('/teams/create(POST) should not create buying team if uncompleted data is supplied', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams/create')
        .send({ hostId: buyingTeam.hostId })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    // return all buying team
    it('/teams(GET) should return all buying teams', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams')
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // return buying teams for a producer
    it('/teams/producer/:id(GET) should return buying team for a producer', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/producer/${producerId}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // return buying teams for a particular postal code
    it('/teams/postalcode/:id(GET) should return buying team for a postal code', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/postalcode/${producerId}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // update buying team's record
    it('/teams/:id(PATCH) should update a buying team', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/teams/${buyingTeamId}`)
        .send(buyingTeam)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // delete buying team's record
    it('/teams/:id(DELETE) should delete buying team', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/teams/${buyingTeamId}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });
  });
});

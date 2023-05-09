import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { Producer, TeamMember, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { CreateTeamDto } from '../../src/teams/dto/create-team.dto';

describe('TeamsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const phone = faker.phone.number();
  let customerId: string;
  let paymentMethodId: string;

  let user: User;
  let producer: Producer;
  let teamMember: TeamMember;
  let producerId: string;
  let buyingTeamId: string;
  let teamRequestId: string;
  let paymentIntentId: string;
  let teamMemberId: string;

  const buyingTeam: CreateTeamDto = {
    name: 'Team 003',
    postalCode: '234-54',
    hostId: '',
    frequency: 'weekly',
    description: 'Dummy description',
    producerId: '3425',
    paymentIntentId: '',
  };

  const buyingTeamUpdate = {
    name: 'Team 003',
    postalCode: '234-54',
    description: 'Dummy description',
  };

  const teamRequest = {
    userId: '',
    teamId: '',
  };

  const cardInfo = {
    cardNumber: '4242424242424242',
    expiringMonth: 1,
    expiringYear: 2033,
    cvc: '314',
    phone,
  };

  const chargeInfo = {
    amount: 2000,
    currency: 'gbp',
    customerId: '',
    paymentMethodId: '',
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
    teamRequest.userId = user.id;

    // create dummy producer for test
    producer = await prisma.producer.create({
      data: {
        userId: user.id,
        businessAddress: 'dummy Addresss',
        businessName: 'dummy name',
      },
    });
    buyingTeam.producerId = producer.id;

    // get dummy team member id for test
    teamMember = await prisma.teamMember.findFirst();
    teamMemberId = teamMember.id;
  }, 120000);

  afterAll(async () => {
    await app.close();
  });

  describe('TeamsController (e2e)', () => {
    // add payment card to user
    it('/payments/add-card(POST) should add card to user account', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/add-card')
        .send({ ...cardInfo })
        .expect(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
      customerId = response.body.data.stripeCustomerId;
      paymentMethodId = response.body.data.paymentMethodId;
    }, 120000);

    // charge user successfully
    it('/payments/charge(POST) should charge a user', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/charge')
        .send({ ...chargeInfo, customerId, paymentMethodId })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
      paymentIntentId = response.body.data.paymentIntentId;
    });

    // create team
    it('/teams/create(POST) should create a new buying team', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams/create')
        .send({ ...buyingTeam, paymentIntentId })
        .expect(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
      buyingTeamId = response.body.data.id;
    }, 120000);

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
        .send(buyingTeamUpdate)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // send request to join buying team
    it('/teams/join(POST) should create request to join buying team', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams/join')
        .send({ ...teamRequest, teamId: buyingTeamId })
        .expect(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
      teamRequestId = response.body.data.id;
    });

    it('/teams/join(POST) should not send request to join buying team if the data is not complete', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams/join')
        .send(teamRequest)
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/teams/join(POST) should not send request to join buying team if request has been sent before', async () => {
      const response = await request(app.getHttpServer())
        .post('/teams/join')
        .send({ ...teamRequest, teamId: buyingTeamId })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    // approve or reject users request to join team
    it('/teams/request/update(PATCH) should not approve/reject users request if the appropriate data is not sent', async () => {
      const response = await request(app.getHttpServer())
        .patch('/teams/request/update')
        .send({ id: teamRequestId })
        .expect(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('/teams/request/update(PATCH) should approve/reject users request if the appropriate data is not sent', async () => {
      const response = await request(app.getHttpServer())
        .patch('/teams/request/update')
        .send({ id: teamRequestId, status: 'APPROVED' })
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // return members of a buying team
    it('/teams/members/:id(GET) should return members of the buying team', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/members/${buyingTeamId}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // return buying team of a user
    it('/teams/user/:id(GET) should return the buying teams of a user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/user/${user.id}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    // quit buying team
    it('/teams/quit(DELETE)/:id should quit buying team', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/teams/quit/${teamMemberId}`)
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.error).toBeUndefined();
      expect(typeof response.body.data).toBe('object');
    });

    describe('Delete Team (e2e)', () => {
      beforeEach(async () => {
        await prisma.teamRequest.deleteMany({
          where: {
            teamId: buyingTeamId,
          },
        });

        await prisma.teamMember.deleteMany({
          where: {
            teamId: buyingTeamId,
          },
        });

        await prisma.order.deleteMany({
          where: {
            teamId: buyingTeamId,
          },
        });
      }, 120000);

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
});

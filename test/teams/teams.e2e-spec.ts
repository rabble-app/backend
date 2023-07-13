import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { BuyingTeam, Producer, TeamMember, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { CreateTeamDto } from '../../src/teams/dto/create-team.dto';
import { AuthService } from '../../src/auth/auth.service';

describe('TeamsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const phone = faker.phone.number();
  let customerId = 'cus_OFCaSUidAGIJOA';
  let paymentMethodId: string;
  let inviteToken: string;

  let user: User;
  let producer: Producer;
  let teamMember: TeamMember;
  let team: BuyingTeam;
  let producerId: string;
  let buyingTeamId: string;
  let teamRequestId: string;
  let paymentIntentId: string;
  let teamMemberId: string;
  const testTime = 120000;

  const buyingTeam: CreateTeamDto = {
    name: 'Team 003',
    postalCode: '234-54',
    hostId: '',
    frequency: 604800,
    description: 'Dummy description',
    producerId: '3425',
    paymentIntentId: '',
    isPublic: true,
    nextDeliveryDate: new Date(),
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
  };

  const chargeInfo = {
    amount: 2000,
    currency: 'gbp',
    customerId: '',
    paymentMethodId: '',
    userId: '',
  };

  beforeAll(async () => {
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

    // get dummy team id for test
    team = await prisma.buyingTeam.findFirst();

    // create team member for test
    teamMember = await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId: team.id,
        status: 'APPROVED',
      },
    });

    teamMemberId = teamMember.id;

    // get dummy invite for test
    await prisma.invite.create({
      data: {
        userId: user.id,
        teamId: team.id,
        phone,
        token: authService.generateToken({
          userId: user.id,
          teamId: team.id,
          phone,
        }),
      },
    });
    const result = await prisma.invite.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });
    inviteToken = result.token;

    // stripe customer id for test
    const result1 = await prisma.user.findFirst({
      where: {
        stripeCustomerId: {
          not: 'NULL',
        },
      },
      select: {
        stripeCustomerId: true,
      },
    });
    if (result1) {
      customerId = result1.stripeCustomerId;
    }
  }, testTime);

  afterAll(async () => {
    await app.close();
  });

  describe('TeamsController (e2e)', () => {
    // add payment card to user
    it(
      '/payments/add-card(POST) should add card to user account',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/add-card')
          .send({ ...cardInfo, stripeCustomerId: customerId })
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        paymentMethodId = response.body.data.paymentMethodId;
      },
      testTime,
    );

    // charge user successfully
    it(
      '/payments/charge(POST) should charge a user',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/charge')
          .send({ ...chargeInfo, customerId, paymentMethodId, userId: user.id })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        paymentIntentId = response.body.data.paymentIntentId;
      },
      testTime,
    );

    // create team
    it(
      '/teams/create(POST) should create a new buying team',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/create')
          .send({ ...buyingTeam, paymentIntentId })
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        buyingTeamId = response.body.data.id;
      },
      testTime,
    );

    it(
      '/teams/create(POST) should not create buying team if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/create')
          .send({ hostId: buyingTeam.hostId })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // return all buying team
    it(
      '/teams(GET) should return all buying teams',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/teams')
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return buying teams for a producer
    it(
      '/teams/producer/:id(GET) should return buying team for a producer',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/teams/producer/${producerId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return buying teams for a particular postal code
    it(
      '/teams/postalcode/:id(GET) should return buying team for a postal code',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/teams/postalcode/${producerId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // update buying team's record
    it(
      '/teams/:id(PATCH) should update a buying team',
      async () => {
        const response = await request(app.getHttpServer())
          .patch(`/teams/${buyingTeamId}`)
          .send(buyingTeamUpdate)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // send request to join buying team
    it(
      '/teams/join(POST) should create request to join buying team',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/join')
          .send({
            ...teamRequest,
            teamId: buyingTeamId,
            introduction: 'Please allow me to join the team',
          })
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        teamRequestId = response.body.data.id;
      },
      testTime,
    );

    it(
      '/teams/join(POST) should not send request to join buying team if the data supplied is not complete',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/join')
          .send(teamRequest)
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/teams/join(POST) should not send request to join buying team if request has been sent before',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/join')
          .send({ ...teamRequest, teamId: buyingTeamId })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // approve or reject users request to join team
    it(
      '/teams/request/update(PATCH) should not approve/reject users request if the appropriate data is not sent',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/teams/request/update')
          .send({ id: teamRequestId })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/teams/request/update(PATCH) should approve/reject users request if the appropriate data is not sent',
      async () => {
        const response = await request(app.getHttpServer())
          .patch('/teams/request/update')
          .send({ id: teamRequestId, status: 'APPROVED' })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
    // add a user as member of team after accepting invite
    it(
      '/teams/add-member(POST) should add a user as team member',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/add-member')
          .send({ userId: user.id, teamId: buyingTeamId, status: 'APPROVED' })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/teams/add-member(POST) should not add a user as team member if incomplete information is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/add-member')
          .send({ userId: user.id })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // return members of a buying team
    it(
      '/teams/members/:id(GET) should return members of the buying team',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/teams/members/${buyingTeamId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // skip next delivery for a particular buying team
    it(
      '/teams/members/skip-delivery/:id(GET) user should skip next delivery',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/teams/members/skip-delivery/${teamMemberId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return buying team of a user
    it(
      '/teams/user/:id(GET) should return the buying teams of a user',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/teams/user/${user.id}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return a single buying teams
    it(
      '/teams/:id(GET) should return a particular buying team',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/teams/${buyingTeamId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return a single buying teams current order
    it(
      '/teams/:id(GET) should return a particular buying team',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/teams/current-order/${buyingTeamId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // nudge team members to collect delivery
    it(
      '/teams/nudge(POST))/:id should nudge team members to collect delivery',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/teams/nudge/${buyingTeamId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('string');
      },
      testTime,
    );

    // nudge team member to update card details
    it(
      '/teams/nudge(POST) should nudge team member to update card details',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/teams/nudge`)
          .send({ teamName: buyingTeam.name, memberPhone: phone })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('string');
      },
      testTime,
    );

    it(
      '/teams/nudge(POST) should not nudge team member to update card details if the data supplied is not complete',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/nudge')
          .send({ teamName: buyingTeam.name })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // bulk invite
    // it(
    //   '/teams/bulk-invite(POST) should invite bulk member to join the team',
    //   async () => {
    //     const response = await request(app.getHttpServer())
    //       .post(`/teams/bulk-invite`)
    //       .send({
    //         userId: user.id,
    //         link: 'https://www.google.com',
    //         phones: ['+2347036541234'],
    //         teamId: buyingTeamId,
    //       })
    //       .expect(200);
    //     expect(response.body).toHaveProperty('data');
    //     expect(response.body.error).toBeUndefined();
    //     expect(typeof response.body.data).toBe('boolean');
    //   },
    //   testTime,
    // );

    it(
      '/teams/bulk-invite(POST) should not invite members to join the team if incomplete data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/teams/bulk-invite`)
          .send({
            link: 'https://www.google.com',
          })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    //  verify invite token
    it(
      '/teams/verify-invite(POST) should verify invite token',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/teams/verify-invite`)
          .send({
            token: inviteToken,
          })
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/teams/verify-invite(POST) should not allow the request if the token is not supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/teams/verify-invite`)
          .send({
            token: 'invalid invite',
          })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    it(
      '/teams/verify-invite(POST) should not pass invalid invite',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/teams/verify-invite`)
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // quit buying team
    it(
      '/teams/quit(DELETE)/:id should quit buying team',
      async () => {
        const response = await request(app.getHttpServer())
          .delete(`/teams/quit/${teamMemberId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // delete buying team's record
    it(
      '/teams/:id(DELETE) should delete buying team',
      async () => {
        const response = await request(app.getHttpServer())
          .delete(`/teams/${buyingTeamId}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );
  });
});

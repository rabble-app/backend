import Stripe from 'stripe';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/auth/auth.service';
import { TeamMember } from '@prisma/client';
import { CreateTeamDto } from '../../src/teams/dto/create-team.dto';
import { faker } from '@faker-js/faker';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../src/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('TeamsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  const phone = faker.phone.number('101-###-###');
  let paymentMethodId: string;
  let inviteToken: string;

  let teamMember: TeamMember;
  let teamId: string;
  let producerId: string;
  let buyingTeamId: string;
  let teamRequestId: string;
  let paymentIntentId: string;
  let teamMemberId: string;
  let orderId: string;
  let customerId: string;
  let userId: string;
  let jwtToken: string;
  let stripe: Stripe;
  const testTime = 120000;

  const buyingTeam: CreateTeamDto = {
    name: faker.internet.userName(),
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
    name: faker.internet.userName(),
    postalCode: '234-54',
    description: 'Dummy description',
  };

  const teamRequest = {
    userId: '',
    teamId: '',
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
    const params = app.get('AWS_PARAMETERS');

    await app.init();
    await app.listen(process.env.PORT);
    stripe = new Stripe(params.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
    // create dummy stripe user for test
    const stripeUser = await stripe.customers.create({
      phone,
    });
    customerId = stripeUser.id;

    // create dummy user for test
    const user = await prisma.user.create({
      data: {
        phone,
        stripeCustomerId: customerId,
      },
    });
    userId = user.id;
    buyingTeam.hostId = user.id;
    teamRequest.userId = user.id;

    // create payment method for the test
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 8,
        exp_year: 2026,
        cvc: '314',
      },
    });
    paymentMethodId = paymentMethod.id;

    // attach paymemt method to user
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // create dummy producer for test
    const producer = await prisma.producer.create({
      data: {
        userId,
        businessName: faker.internet.userName(),
      },
    });
    producerId = producer.id;
    buyingTeam.producerId = producer.id;

    // create  team for test
    const team = await prisma.buyingTeam.create({
      data: {
        producerId,
        hostId: userId,
        name: faker.internet.userName(),
        postalCode: '12345',
      },
    });
    teamId = team.id;

    // create team member for test
    teamMember = await prisma.teamMember.create({
      data: {
        userId,
        teamId,
        status: 'APPROVED',
      },
    });
    teamMemberId = teamMember.id;

    // get dummy invite for test
    const invite = await prisma.invite.create({
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
    inviteToken = invite.token;

    // create  order for test
    await prisma.order.create({
      data: {
        teamId,
        minimumTreshold: 50,
      },
    });

    // create token for test
    jwtToken = authService.generateToken({
      userId,
    });
  }, testTime);

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    await app.close();
  });

  describe('TeamsController (e2e)', () => {
    // charge user successfully
    it(
      '/payments/charge(POST) should charge a user',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/payments/charge')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ ...chargeInfo, customerId, paymentMethodId, userId })
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
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ ...buyingTeam, paymentIntentId })
          .expect(201);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
        buyingTeamId = response.body.data.id;
        orderId = response.body.data.orderId;
      },
      testTime,
    );

    // check if name exist
    it(
      '/teams/check-name/:keyword(POST) should check if buying team name already exist',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/teams/check-name/dummy`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('boolean');
      },
      testTime,
    );

    // check if producer team exist for a buying team
    it(
      '/teams/check-producer-group/:producerId/:postalCode(POST) should check if buying team already exist for a producer under a particular postal code',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/teams/check-producer-group/:producerId/:postalCode`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    it(
      '/teams/create(POST) should not create buying team if uncompleted data is supplied',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/create')
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
          .send(buyingTeamUpdate)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    //  verify invite token
    it(
      '/teams/verify-invite(POST) should verify invite token',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/teams/verify-invite`)
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // send request to join buying team
    it(
      '/teams/join(POST) should create request to join buying team',
      async () => {
        const response = await request(app.getHttpServer())
          .post('/teams/join')
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ userId, teamId: buyingTeamId, status: 'APPROVED' })
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
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ userId })
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .get(`/teams/user/${userId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // nudge team members to collect delivery
    it(
      '/teams/nudge(POST))/:buyingTeamId/:orderId should nudge team members to collect delivery',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/teams/nudge/${orderId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
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
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            link: 'https://www.google.com',
          })
          .expect(400);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      },
      testTime,
    );

    // return all buying team subscriptions
    it(
      '/team/subscriptions(GET) should return all buying teams subscriptions',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/team/subscriptions')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return pending team orders
    it(
      '/team/orders?status=PENDING&offset=0(GET) should return pending orders',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/team/orders?status=PENDING')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return successful team orders
    it(
      '/team/orders?status=SUCCESSFUL&offset=0(GET) should return successful orders',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/team/orders?status=SUCCESSFUL')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return failed team orders
    it(
      '/team/orders?status=FAILED&offset=0(GET) should return failed orders',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/team/orders?status=FAILED')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return single order info
    it(
      '/team/admin/orders/:orderId/:producerId(GET) should return single order',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/team/admin/orders/${orderId}/${producerId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // mark order as completed
    it(
      '/team/orders/:id(POST) should mark order as completed',
      async () => {
        const response = await request(app.getHttpServer())
          .post(`/team/orders/${orderId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // search feature
    it(
      '/team/orders/search/:keyword(GET) should return 200 on a successful search',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/team/orders/search/myteamName')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // search feature for subscription
    it(
      '/team/subscriptions/search/:keyword(GET) should return 200 on a successful search',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/team/subscriptions/search/myTeamName')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // return the total count for different order status
    it(
      '/team/orders/status/count(GET) should return 200 on a successful differen order status count',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/team/orders/status/count')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.error).toBeUndefined();
        expect(typeof response.body.data).toBe('object');
      },
      testTime,
    );

    // quit buying team
    it(
      '/teams/quit(DELETE)/:id should quit buying team',
      async () => {
        const response = await request(app.getHttpServer())
          .delete(`/teams/quit/${teamMemberId}`)
          .set('Authorization', `Bearer ${jwtToken}`)
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

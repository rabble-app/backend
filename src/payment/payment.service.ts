import Stripe from 'stripe';
import { AddBulkBasketDto, AddToBasket } from './dto/add-bulk-basket.dto';
import { AddPaymentCardDto, IPaymentMethod } from './dto/add-payment-card.dto';
import {
  Basket,
  BasketC,
  Order,
  Payment,
  PaymentStatus,
  PaymentType,
  Prisma,
  ProductPaymentStatus,
  SupplementTeamStatus,
} from '@prisma/client';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Logger } from 'winston';
import {
  ICreateIntent,
  IOrder,
  IPayment,
  OrderWithSupplementPayload,
  Status,
  notificationType,
} from '../lib/types';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { ChargeUserDto } from './dto/charge-user.dto ';
import { AddSingleBasketDto } from './dto/add-single-basket.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { TeamsServiceExtension } from '../teams/teams.service.extension';
import { ProductsService } from '../../src/products/products.service';
import { RemovePaymentCardDto } from './dto/remove-payment-card.dto';
import { TeamsService } from '../teams/teams.service';
import { add } from 'date-fns';
import { JoinSupplementTeamDto } from './dto/join-supplement-team.dto';
import { PaymentServiceExtension } from './payment.service.extension';
import { ReferralsService } from '../referrals/referrals.service';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly supplementStripe: Stripe;
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
    @Inject(forwardRef(() => TeamsServiceExtension))
    private readonly teamsServiceExtension: TeamsServiceExtension,
    @Inject(forwardRef(() => TeamsService))
    private readonly teamsService: TeamsService,
    private readonly productsService: ProductsService,
    private readonly referralsService: ReferralsService,
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
    @Inject('LOGGER') private readonly logger: Logger,
    @Inject(forwardRef(() => PaymentServiceExtension))
    private readonly paymentServiceExtension: PaymentServiceExtension,
  ) {
    this.stripe = new Stripe(this.parameters.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
    this.supplementStripe = new Stripe(
      this.parameters.SUPPLEMENT_STRIPE_SECRET_KEY,
      {
        apiVersion: '2022-11-15',
      },
    );
  }

  async addCustomerCard(
    addPaymentCardDto: AddPaymentCardDto,
    userId: string,
    isSupplementApp = false,
  ): Promise<{ paymentMethodId: string } | null> {
    const stripe = isSupplementApp ? this.supplementStripe : this.stripe;
    // attach payment method to user
    this.logger.log('info', 'Attaching payment method to user %o', {
      userId,
      paymentMethodId: addPaymentCardDto.paymentMethodId,
      stripeCustomerId: addPaymentCardDto.stripeCustomerId,
    });

    const result = await stripe.paymentMethods.attach(
      addPaymentCardDto.paymentMethodId,
      {
        customer: addPaymentCardDto.stripeCustomerId,
      },
    );
    if (result) {
      await this.SavePaymentMethod({
        cardLastFourDigits: result.card.last4,
        paymentMethodId: addPaymentCardDto.paymentMethodId,
        userId,
        stripeCustomerId: addPaymentCardDto.stripeCustomerId,
        fingerprint: result.card.fingerprint,
      });

      // make it user default payment method
      await this.userService.updateUser({
        where: {
          stripeCustomerId: addPaymentCardDto.stripeCustomerId,
        },
        data: {
          stripeDefaultPaymentMethodId: addPaymentCardDto.paymentMethodId,
        },
      });
    }

    return {
      paymentMethodId: addPaymentCardDto.paymentMethodId,
    };
  }

  async removeCustomerCard(
    removePaymentCardDto: RemovePaymentCardDto,
    isSupplementApp = false,
  ): Promise<{ paymentMethodId: string } | null> {
    const stripe = isSupplementApp ? this.supplementStripe : this.stripe;
    await stripe.paymentMethods.detach(removePaymentCardDto.paymentMethodId);

    // remove it from our record
    await this.prisma.paymentMethod.deleteMany({
      where: {
        paymentMethodId: removePaymentCardDto.paymentMethodId,
      },
    });

    return {
      paymentMethodId: removePaymentCardDto.paymentMethodId,
    };
  }

  async createIntentForCardSetup(): Promise<object | null> {
    return await this.supplementStripe.setupIntents.create({
      payment_method_types: ['card'],
      // customer: customerId,
      // confirm: true,
    });
  }

  async chargeUser(chargeUserDto: ChargeUserDto): Promise<object | null> {
    let orderId: string;
    let paymentIntentId: string;

    if (chargeUserDto.paymentIntentId) {
      paymentIntentId = chargeUserDto.paymentIntentId;
    }

    if (!chargeUserDto.isApplePay && !chargeUserDto.paymentIntentId) {
      const paymentIntent = await this.handleIntentCreation(chargeUserDto);
      if (!paymentIntent) return null;
      if (paymentIntent.status != 'requires_capture') {
        return paymentIntent;
      }
      paymentIntentId = paymentIntent.id;
    }

    // if teamId exist, get the latest order of that team
    if (chargeUserDto.teamId) {
      const result = await this.getTeamLatestOrder(chargeUserDto.teamId);
      orderId = result.id;

      // accumulate amount paid
      await this.accumulateAmount(
        orderId,
        chargeUserDto.amount,
        chargeUserDto.teamId,
      );
    }
    // record intent
    const result = await this.handleRecordPayment(
      orderId,
      paymentIntentId,
      chargeUserDto.amount,
      chargeUserDto.userId,
    );

    if (result) {
      return {
        paymentIntentId,
        orderId,
      };
    } else {
      return null;
    }
  }

  async handleIntentCreation(
    chargeUserDto: ChargeUserDto,
  ): Promise<any | null> {
    return await this.createIntent({
      amount: chargeUserDto.amount,
      currency: chargeUserDto.currency,
      customerId: chargeUserDto.customerId,
      paymentMethodId: chargeUserDto.paymentMethodId,
    });
  }

  async handleRecordPayment(
    orderId: string,
    paymentIntentId: string,
    amount: number,
    userId: string,
  ): Promise<Payment | null> {
    // record intent
    const paymentData = {
      orderId,
      paymentIntentId,
      amount: amount,
      status: PaymentStatus.INTENT_CREATED,
      userId: userId,
    };
    return await this.recordPayment(paymentData);
  }

  async getTeamLatestOrder(
    teamId: string,
  ): Promise<OrderWithSupplementPayload | null> {
    return await this.prisma.order.findFirst({
      where: {
        teamId: teamId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        deadline: true,
        team: {
          select: {
            supplementTeamProducts: {
              select: {
                product: {
                  select: {
                    leadTime: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async accumulateAmount(
    orderId: string,
    amount: number,
    teamId: string,
  ): Promise<void> {
    // get previous accumalated value so that we will not keep sending notification that threshold has been met
    const orderRecord = await this.prisma.order.findFirst({
      where: { id: orderId },
    });
    const lastAccumulatedValue = orderRecord.accumulatedAmount;

    const result = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: { accumulatedAmount: { increment: amount } },
    });
    if (
      +result.accumulatedAmount >= +result.minimumTreshold &&
      +lastAccumulatedValue < +result.minimumTreshold
    ) {
      await this.sendNotificationForThreshold(teamId, orderId, result.deadline);
    }
  }

  async sendNotificationForThreshold(
    teamId: string,
    orderId: string,
    orderDeadline: Date,
  ): Promise<void> {
    const teamMembers = await this.teamsServiceExtension.getAllTeamUsers(
      teamId,
    );
    if (teamMembers.length > 0) {
      teamMembers.forEach(async (member) => {
        // send notification
        await this.notificationService.createNotification({
          title: 'Threshold Reached 👏',
          text: `Congratulations! Your buying team ${member.team.name} have collectively reached the suppliers's minimum threshold for a new shipment. You have 24 hours to add to it or invite others to join the team before the order is shipped`,
          userId: member.userId,
          teamId: member.teamId,
          notficationToken: member.user.notificationToken,
          type: notificationType.TEAM,
        });
      });
    }
    if (orderDeadline.getTime() - new Date().getTime() > 86400000) {
      const newDeadline = new Date().getTime() + 86400000;
      // update order to end in the next 24 hours
      await this.updateOrder({
        where: {
          id: orderId,
        },
        data: {
          deadline: new Date(newDeadline),
        },
      });
    }
  }

  async createIntent(
    createIntentData: ICreateIntent,
    offline = false,
    isSupplementApp = false,
  ): Promise<any | null> {
    try {
      const stripe = isSupplementApp ? this.supplementStripe : this.stripe;
      const parameters = {
        amount: Math.round(createIntentData.amount * 100),
        currency: createIntentData.currency,
        customer: createIntentData.customerId,
      };

      if (createIntentData.paymentMethodId) {
        parameters['payment_method'] = createIntentData.paymentMethodId;
        parameters['confirm'] = true;
      }

      if (offline) {
        parameters['off_session'] = true;
      } else {
        parameters['setup_future_usage'] = 'off_session';
      }
      const paymentIntent = await stripe.paymentIntents.create({
        ...parameters,
        capture_method: 'manual',
        use_stripe_sdk: true,
      });
      return paymentIntent;
    } catch (e) {
      console.log(e);
      // const charge = await this.stripe.charges.retrieve(
      //   e.payment_intent.latest_charge,
      // );
      // if (e.type === 'StripeCardError') {
      //   if (charge.outcome.type === 'blocked') {
      //     console.log('Payment blocked for suspected fraud.');
      //   } else if (e.code === 'card_declined') {
      //     console.log('Payment declined by the issuer.');
      //   } else if (e.code === 'expired_card') {
      //     console.log('Card expired.');
      //   } else {
      //     console.log('Other card error.');
      //   }
      // }
    }
  }

  async createOrder(orderData: IOrder): Promise<Order> {
    return await this.prisma.order.create({
      data: orderData,
    });
  }

  async recordPayment(paymentData: IPayment): Promise<Payment> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (paymentData.type !== PaymentType.YEARLY_SUBSCRIPTION) {
          const hasPreviousPayment = await tx.payment.count({
            where: {
              userId: paymentData.userId,
            },
          });

          if (!hasPreviousPayment) {
            await tx.user.update({
              where: {
                id: paymentData.userId,
              },
              data: {
                firstPaymentDate: new Date(),
              },
            });

            await this.referralsService.handleRefCodeAndFreeTrial(
              paymentData.userId,
              tx,
            );
          }
        }

        return await tx.payment.create({
          data: paymentData,
        });
      });
    } catch (error) {
      this.logger.error('Failed to record payment', {
        error,
        paymentData,
      });
      throw new HttpException(
        'Failed to record payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePayment(params: {
    where: Prisma.PaymentWhereUniqueInput;
    data: Prisma.PaymentUpdateInput;
  }): Promise<Payment> {
    const { where, data } = params;
    return await this.prisma.payment.update({
      data,
      where,
    });
  }

  async updateOrder(params: {
    where: Prisma.OrderWhereUniqueInput;
    data: Prisma.OrderUpdateInput;
  }): Promise<Order> {
    const { where, data } = params;
    return await this.prisma.order.update({
      data,
      where,
    });
  }

  async saveBulkBasket(addBulkBasketDto: AddBulkBasketDto) {
    try {
      // check if team is from partner's hub
      const { partnerId } = await this.prisma.buyingTeam.findUnique({
        where: {
          id: addBulkBasketDto.teamId,
        },
      });
      const basketRecord = addBulkBasketDto.basket.map((item: AddToBasket) => {
        return {
          teamId: addBulkBasketDto.teamId,
          userId: item.userId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        };
      });

      const result = await this.prisma.basketC.createMany({
        data: basketRecord,
      });

      if (!addBulkBasketDto.deadlineReached) {
        // check for portioned products
        if (addBulkBasketDto.basket && addBulkBasketDto.basket.length > 0) {
          let index = 0;
          addBulkBasketDto.basket.forEach(async (item) => {
            if (item.type && item.type == 'PORTIONED_SINGLE_PRODUCT') {
              setTimeout(async () => {
                index++;
                await this.processPortionedProduct(
                  addBulkBasketDto.teamId,
                  item.orderId,
                  item.quantity,
                  item.productId,
                  item.userId,
                  item.price * item.quantity,
                );
              }, 4000 * index);
            }
          });
        }
        const basketRecord2 = addBulkBasketDto.basket.map(
          (item: AddToBasket) => {
            return {
              orderId: item.orderId,
              userId: item.userId,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              paymentStatus: partnerId
                ? ProductPaymentStatus.PENDING
                : ProductPaymentStatus.AUTHORIZED,
            };
          },
        );

        // calculate the payment for partner teams member
        if (partnerId) {
          const totalAmount = addBulkBasketDto.basket.reduce(
            (accumulator, item) => {
              return accumulator + item.price * item.quantity;
            },
            0,
          );

          // create payment record
          await this.prisma.payment.create({
            data: {
              orderId: addBulkBasketDto.basket[0].orderId,
              userId: addBulkBasketDto.basket[0].userId,
              amount: totalAmount,
              status: 'PENDING',
            },
          });
        }

        return await this.prisma.basket.createMany({
          data: basketRecord2,
        });
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async processPortionedProduct(
    teamId: string,
    orderId: string,
    quantity: number,
    productId: string,
    userId: string,
    amount: number,
  ): Promise<void> {
    // check if the product has been added to the portioned table before and increment if exisiting or create a new record
    let result = await this.prisma.partitionedProductsBasket.findFirst({
      where: {
        teamId,
        orderId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        accumulator: true,
        threshold: true,
        id: true,
      },
    });
    if (
      result &&
      result.accumulator < result.threshold &&
      result.accumulator + quantity <= result.threshold
    ) {
      // update
      const updateResult = await this.prisma.partitionedProductsBasket.update({
        where: {
          id: result.id,
        },
        data: {
          accumulator: {
            increment: quantity,
          },
        },
      });

      if (updateResult.accumulator >= updateResult.threshold) {
        // create new basket for that portionedProduct
        await this.prisma.partitionedProductsBasket.create({
          data: {
            orderId,
            productId,
            accumulator: 0,
            threshold: updateResult.threshold,
            teamId,
          },
        });
      }
    } else {
      // get product info
      const product = await this.productsService.getProduct(productId);

      // create new record
      result = await this.prisma.partitionedProductsBasket.create({
        data: {
          orderId,
          productId,
          accumulator: quantity,
          threshold: product.quantityOfSubUnitPerOrder,
          teamId,
        },
      });
    }
    // record the user information in the partition users table
    await this.prisma.partitionedProductUsersRecord.create({
      data: {
        userId,
        amount,
        quantity,
        partionedBasketId: result.id,
      },
    });
  }

  async findProductInCopyBasket(
    productId: string,
    teamId: string,
    userId: string,
  ): Promise<BasketC | null> {
    return await this.prisma.basketC.findFirst({
      where: {
        productId,
        teamId,
        userId,
      },
    });
  }

  async addToBasket(addSingleBasketDto: AddSingleBasketDto): Promise<BasketC> {
    // get team info
    const team = await this.teamsService.findBuyingTeam({
      id: addSingleBasketDto.teamId,
    });
    if (team?.supplementTeamProducts?.status == 'ACTIVE') {
      await this.prisma.basket.create({
        data: {
          productId: addSingleBasketDto.productId,
          userId: addSingleBasketDto.userId,
          orderId: addSingleBasketDto.orderId,
          quantity:
            addSingleBasketDto.quantity - addSingleBasketDto.topupQuantity,
          price: addSingleBasketDto.price,
          capsulePerDay: addSingleBasketDto.capsulePerDay,
          paymentStatus: ProductPaymentStatus.CAPTURED,
        },
      });

      if (
        addSingleBasketDto.topupQuantity &&
        addSingleBasketDto.topupQuantity > 0
      ) {
        await this.prisma.topUpBasket.create({
          data: {
            productId: addSingleBasketDto.productId,
            userId: addSingleBasketDto.userId,
            orderId: addSingleBasketDto.orderId,
            quantity: addSingleBasketDto.topupQuantity,
            price: addSingleBasketDto.price,
            capsulePerDay: addSingleBasketDto.capsulePerDay,
            deliveryDate: add(new Date(), {
              weeks: team.supplementTeamProducts.product.leadTime,
            }),
          },
        });
      }
    }

    const result = await this.prisma.basketC.create({
      data: {
        productId: addSingleBasketDto.productId,
        userId: addSingleBasketDto.userId,
        teamId: addSingleBasketDto.teamId,
        quantity: addSingleBasketDto.quantity,
        price: addSingleBasketDto.price,
        capsulePerDay: addSingleBasketDto.capsulePerDay,
      },
    });

    return result;
  }

  async deleteFromBasket(
    where: Prisma.BasketCWhereUniqueInput,
  ): Promise<BasketC> {
    return await this.prisma.basketC.delete({
      where,
    });
  }

  async returnPaymentIntent(paymentIntentId: string): Promise<any | null> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Updates a single basket in the database based on the provided where and data parameters.
   *
   * @param params - An object containing the where and data parameters for the update operation.
   * @param params.where - A Prisma.BasketWhereUniqueInput object that specifies the unique identifier of the basket to update.
   * @param params.data - A Prisma.BasketUpdateInput object that specifies the data to update for the matching basket.
   * @returns A Promise that resolves to the updated Basket object.
   */
  async updateBasket(params: {
    where: Prisma.BasketWhereUniqueInput;
    data: Prisma.BasketUpdateInput;
  }): Promise<Basket> {
    const { where, data } = params;
    return await this.prisma.basket.update({
      data,
      where,
    });
  }

  /**
   * Updates multiple baskets in the database based on the provided where and data parameters.
   *
   * @param params - An object containing the where and data parameters for the update operation.
   * @param params.where - A Prisma.BasketWhereInput object that specifies the conditions for the update operation.
   * @param params.data - A Prisma.BasketUpdateInput object that specifies the data to update for the matching baskets.
   * @returns A Promise that resolves to an object containing the result of the update operation.
   */
  async updateBasketBulk(params: {
    where: Prisma.BasketWhereInput;
    data: Prisma.BasketUpdateInput;
  }): Promise<object> {
    const { where, data } = params;
    return await this.prisma.basket.updateMany({
      data,
      where,
    });
  }

  async SavePaymentMethod(params: IPaymentMethod) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: {
        fingerprint: params.fingerprint,
      },
    });
    if (paymentMethod) {
      this.logger.info('Payment method already exists %o', {
        fingerprint: params.fingerprint,
        userId: params.userId,
        last4: params.cardLastFourDigits,
      });
      throw new HttpException(
        'Payment method already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.prisma.paymentMethod.create({
      data: params,
    });
  }

  async seedPaymentMethod() {
    this.logger.info('Seeding payment methods');
    const users = await this.prisma.user.findMany({
      where: {
        stripeDefaultPaymentMethodId: {
          not: null,
        },
      },
      distinct: ['stripeDefaultPaymentMethodId'],
    });
    for (const user of users) {
      const paymentMethod = await this.supplementStripe.paymentMethods.retrieve(
        user.stripeDefaultPaymentMethodId,
      );
      this.logger.info(`Seeding payment method for user ${user.id}`);
      await this.SavePaymentMethod({
        cardLastFourDigits: paymentMethod.card.last4,
        paymentMethodId: user.stripeDefaultPaymentMethodId,
        userId: user.id,
        stripeCustomerId: user.stripeCustomerId,
        isDefault: true,
        fingerprint: paymentMethod.card.fingerprint,
      });
    }
  }

  async joinSupplementTeam(joinSupplementTeamDto: JoinSupplementTeamDto) {
    // Check if user has active subscription
    const hasActiveSubscription =
      await this.paymentServiceExtension.checkUserSubscriptionStatus(
        joinSupplementTeamDto.userId,
      );
    if (!hasActiveSubscription) {
      this.logger.warn(
        'User does not have an active subscription for joining supplement team',
        {
          userId: joinSupplementTeamDto.userId,
        },
      );
      return 6;
    }

    let orderId = '';
    if (joinSupplementTeamDto.teamStatus === SupplementTeamStatus.ACTIVE) {
      // get the user stripe id
      const userInfo = await this.userService.findUser({
        id: joinSupplementTeamDto.userId,
      });
      if (!userInfo.stripeCustomerId) return 1;
      // create payment intent
      const paymentIntent = await this.createIntent(
        {
          amount: joinSupplementTeamDto.amount,
          currency: joinSupplementTeamDto.currency,
          paymentMethodId: joinSupplementTeamDto.paymentMethodId,
          customerId: userInfo.stripeCustomerId,
        },
        false,
        true,
      );
      if (!paymentIntent || paymentIntent.status != 'requires_capture')
        return 2;
      // charge the user
      const paymentCaptureResult =
        await this.paymentServiceExtension.handleSupplementPaymentCapture({
          paymentIntentId: paymentIntent.id,
          teamId: joinSupplementTeamDto.teamId,
          userId: joinSupplementTeamDto.userId,
          amount: joinSupplementTeamDto.amount,
        });
      if (!paymentCaptureResult) return 3;
      orderId = paymentCaptureResult.orderId;
    }
    // add to team --> we need a utility function to get the member status
    const addToTeam = await this.teamsService.addTeamMember({
      teamId: joinSupplementTeamDto.teamId,
      userId: joinSupplementTeamDto.userId,
      status: Status.APPROVED,
    });
    if (!addToTeam) return 4;

    // store the basket
    const basket = await this.addToBasket({
      orderId,
      teamId: joinSupplementTeamDto.teamId,
      userId: joinSupplementTeamDto.userId,
      productId: joinSupplementTeamDto.productId,
      quantity: joinSupplementTeamDto.quantity,
      price: joinSupplementTeamDto.price,
      capsulePerDay: joinSupplementTeamDto.capsulePerDay,
      topupQuantity: joinSupplementTeamDto.topupQuantity,
    });
    if (!basket) return 5;
    return joinSupplementTeamDto;
  }
}

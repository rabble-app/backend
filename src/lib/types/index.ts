import {
  OrderType,
  Prisma,
  OrderStatus,
  PaymentStatus,
  PaymentType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Request } from 'express';

export interface IAPIResponse {
  statusCode: number;
  message?: string;
  data?: object | string;
  error?: object | string;
}

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REMOVED = 'REMOVED',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
}

export enum PartnerOpenHour {
  ALL_THE_TIME = 'ALL_THE_TIME',
  MON_TO_FRI = 'MON_TO_FRI',
  CUSTOM = 'CUSTOM',
}

export enum PasswordChangeRoute {
  PASSWORD_RESET = 'PASSWORD_RESET',
  SETTINGS = 'SETTINGS',
}

export enum ProductType {
  SINGLE = 'SINGLE',
  PORTIONED_SINGLE_PRODUCT = 'PORTIONED_SINGLE_PRODUCT',
  PORTIONED_DYNAMIC_PRODUCT = 'PORTIONED_DYNAMIC_PRODUCT',
}

export enum Role {
  USER = 'USER',
  PRODUCER = 'PRODUCER',
  ADMIN = 'ADMIN',
  PARTNER = 'PARTNER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum Channel {
  CUSTOMER = 'CUSTOMER',
  HUB = 'HUB',
  SUPPLEMENT = 'SUPPLEMENT',
}
export interface IOrder {
  teamId: string;
  minimumTreshold?: Decimal;
  deadline?: Date;
  type?: OrderType;
  status?: OrderStatus;
  firstDelivery?: boolean;
  deliveryDate?: Date;
}
export interface IPricePlan {
  percentageDiscount: number;
  teamMemberCount: number;
}
export interface IPayment {
  orderId?: string;
  userId?: string;
  amount: number;
  paymentIntentId?: string;
  status: PaymentStatus;
  type?: PaymentType;
  expiryDate?: Date;
  discount?: number;
  coupons?: string;
}

export enum TeamMemberShip {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface ITeamMember {
  teamId: string;
  userId: string;
  status: Status;
  role?: TeamMemberShip;
}
export interface IScheduleTeam {
  id: string;
  frequency: number;
  producerId: string;
}

export interface IGetChat {
  teamId: string;
  producerId: string;
  offset: number;
}
export interface IPaymentAuth {
  stripeDefaultPaymentMethodId: string;
  amount: number;
  orderId: string;
  stripeCustomerId: string;
  teamId: string;
  paymentId: string;
  partnerId?: string;
  userId?: string;
}
export interface ICreateIntent {
  amount: number;
  currency: string;
  customerId: string;
  paymentMethodId?: string;
}
export interface ITeamWithOtherInfo {
  orders: [
    {
      basket: [];
    },
  ];
}
export interface IUserAlsoBoughtBasket {
  product: { id: string };
}

export enum SearchCategory {
  SUPPLIER = 'SUPPLIER',
  PRODUCT = 'PRODUCT',
  TEAM = 'TEAM',
}

export enum DayOptions {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

export enum DeliveryType {
  WEEKLY = 'WEEKLY',
  CUSTOM = 'CUSTOM',
}

export enum ProductApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REMOVED = 'REMOVED',
}

export type ProducerWithCategories = Prisma.ProducerGetPayload<{
  include: {
    categories: {
      include: {
        category: true;
      };
    };
  };
}>;

export type UserWithProducerAndPartnerInfo = Prisma.UserGetPayload<{
  include: {
    paymentMethods: {
      where: {
        isDefault: true;
      };
    };
    producer: {
      select: {
        id: true;
      };
    };
    partner: {
      select: {
        id: true;
        name: true;
        postalCode: true;
        stripeConnectId: true;
        openhour: {
          select: {
            type: true;
          };
        };
      };
    };
    employee: {
      select: {
        partner: {
          select: {
            id: true;
            name: true;
            postalCode: true;
            openhour: {
              select: {
                type: true;
              };
            };
            user: {
              select: {
                id: true;
              };
            };
          };
        };
      };
    };
    shipping: true;
  };
}>;

export type PaymentWithUserInfo = Prisma.PaymentGetPayload<{
  include: {
    user: {
      select: {
        notificationToken: true;
      };
    };
    order: {
      include: {
        team: {
          select: {
            name: true;
            id: true;
          };
        };
      };
    };
  };
}>;

export type TeamMemberWithUserInfo = Prisma.TeamMemberGetPayload<{
  include: {
    user: {
      select: {
        notificationToken: true;
      };
    };
  };
}>;

export enum notificationType {
  CHAT = 'CHAT',
  TEAM = 'TEAM',
  PAYMENT = 'PAYMENT',
}

export interface ICreateNotification {
  userId: string;
  teamId?: string;
  orderId?: string;
  producerId?: string;
  title: string;
  text: string;
  notficationToken?: string;
  type: notificationType;
}

export type TeamRequestWithOtherInfo = Prisma.TeamRequestGetPayload<{
  include: {
    team: {
      select: {
        name: true;
      };
    };
    user: {
      select: {
        notificationToken: true;
      };
    };
  };
}>;

export type TeamMemberWithUserAndTeamInfo = Prisma.TeamMemberGetPayload<{
  include: {
    user: {
      select: {
        notificationToken: true;
        id: true;
      };
    };
    team: {
      select: {
        name: true;
      };
    };
  };
}>;

export interface IOrderDeadline {
  deadline: Date;
}
export interface ITeamInformation {
  hostId: string;
  producer: { businessName: string };
  members: {
    user: {
      id: string;
      imageUrl: string;
      firstName: string;
      lastName: string;
    };
  }[];
  name: string;
}

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

export interface IProducerOrder {
  id: string;
  status: string;
  accumulatedAmount: Decimal;
  deliveryDate: Date;
  team: {
    name: string;
    frequency: number;
  };
}

export interface InsightResponse {
  id: string;
  week: number;
  year: number;
  value: Decimal;
}

export interface IPostalCodeSearchResponse {
  id: string;
  name: string;
  postalCodeArea: { id: string; code: string; name: string }[];
}

export interface IProducerDeliveryDaysInfo {
  id: string;
  day: string;
  cutOffDay: string;
  cutOffTime: string;
  regions: {
    id: string;
    region: {
      name: string;
      id: string;
    };
    minimumOrder: Decimal;
    producerAreas: {
      id: string;
      area: {
        id: string;
        name: string;
        code: string;
      };
    }[];
  }[];
}

export interface IStoreEmployee {
  user: { phone: string; firstName: string; lastName: string };
  id: string;
}

export type BuyingTeamsWithSupplementProduct = Prisma.BuyingTeamGetPayload<{
  include: {
    supplementTeamProducts: {
      select: {
        status: true;
        orderTreashold: true;
        product: {
          select: {
            leadTime: true;
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export type OrderWithSupplementPayload = Prisma.OrderGetPayload<{
  select: {
    id: true;
    deadline: true;
    deliveryDate: true;
    firstDelivery: true;
    createdAt: true;
    team: {
      select: {
        supplementTeamProducts: {
          select: {
            product: {
              select: {
                leadTime: true;
              };
            };
          };
        };
      };
    };
  };
}>;

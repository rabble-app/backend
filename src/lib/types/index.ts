import { Prisma } from '@prisma/client';

export interface IAPIResponse {
  data?: object | string;
  error?: object | string;
}

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REMOVED = 'REMOVED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PENDING_DELIVERY = 'PENDING_DELIVERY',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
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

export enum PaymentStatus {
  PENDING = 'PENDING',
  INTENT_CREATED = 'INTENT_CREATED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
}
export interface IOrder {
  teamId: string;
  minimumTreshold: number;
  deadline: Date;
}
export interface IPayment {
  orderId?: string;
  userId?: string;
  amount: number;
  paymentIntentId?: string;
  status: PaymentStatus;
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

export type ProducerWithCategories = Prisma.ProducerGetPayload<{
  include: {
    categories: {
      include: {
        category: true;
      };
    };
  };
}>;

export type UserWithProducerInfo = Prisma.UserGetPayload<{
  include: {
    producer: {
      select: {
        id: true;
      };
    };
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

export interface ICreateNotification {
  userId: string;
  teamId?: string;
  orderId?: string;
  producerId?: string;
  title: string;
  text: string;
  notficationToken?: string;
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

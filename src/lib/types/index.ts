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
  paymentIntentId: string;
  status: PaymentStatus;
}

export interface ITeamMember {
  teamId: string;
  userId: string;
  status: Status;
}
export interface IBasket {
  orderId: string;
  userId: string;
  productId: string;
  quantity: number;
  price: string;
}

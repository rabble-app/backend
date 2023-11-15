import { CourierClient } from '@trycourier/courier';

export const courier = CourierClient({
  authorizationToken: process.env.COURIER_API,
});

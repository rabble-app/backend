import { CourierClient } from '@trycourier/courier';

export const courier = CourierClient({
  authorizationToken: process.env.NEXT_COURIER_API,
});

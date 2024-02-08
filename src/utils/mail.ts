import { CourierClient } from '@trycourier/courier';

export const courier = (COURIER_API: string) =>
  CourierClient({
    authorizationToken: COURIER_API,
  });

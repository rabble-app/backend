interface User {
  postalCode: string | null;
}

interface BusinessInfo {
  vat: string | null;
  paymentTerm: number;
  businessName: string;
  businessAddress: string;
}

interface ShippingInfo {
  buildingNo: string;
  address: string;
  city: string;
}

interface HostInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
  shipping: ShippingInfo;
}

interface ProducerInfo extends BusinessInfo {
  user: User;
}

interface Team {
  name: string;
  producer: ProducerInfo;
  host: HostInfo;
}

interface ProductLog {
  productSku: string;
  name: string;
  unitsOfMeasurePerSubUnit: string;
  measuresPerSubUnit: number;
  quantityOfSubUnitPerOrder: number;
  cost: string;
  quantity: number;
  vat: string;
}

export class OrderDetailsDto {
  id: string;
  accumulatedAmount: string;
  createdAt: string;
  status: string;
  deliveryDate: string | null;
  deadline: string;
  team: Team;
  productLog: ProductLog[];
}

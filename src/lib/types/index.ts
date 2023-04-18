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

import { Response } from 'express';

export const formatResponse = (
  data: any,
  res: Response,
  statusCode: number,
  isError?: boolean,
) => {
  res.status(statusCode);
  return {
    data: !isError ? data : undefined,
    error: isError ? data : undefined,
  };
};

import { Response } from 'express';

export const formatResponse = (
  data: any,
  res: Response,
  statusCode: number,
  isError?: boolean,
  message?: string,
) => {
  res.status(statusCode);
  return {
    statusCode,
    message,
    data: !isError ? data : undefined,
    error: isError ? data : undefined,
  };
};

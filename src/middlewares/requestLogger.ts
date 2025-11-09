import { NextFunction, Request, Response } from 'express';
import { httpRequestCounter, httpRequestTimer } from '../config/metrics';
import logger from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const endTimer = httpRequestTimer.startTimer();

  logger.http(`[Request] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode, statusMessage } = res;
    const { method, originalUrl } = req;

    httpRequestCounter.labels(method, originalUrl, statusCode.toString()).inc();

    endTimer({
      method,
      route: originalUrl,
      status_code: statusCode.toString(),
    });

    logger.http(
      `[Response] ${statusCode} ${statusMessage} - ${method} ${originalUrl} - IP: ${req.ip} - Duration: ${duration}ms`
    );
  });

  next();
};

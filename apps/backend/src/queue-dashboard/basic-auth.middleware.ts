import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class BasicAuthMiddleware implements NestMiddleware {
  private readonly encodedCredentials: ReadonlyArray<string>;

  constructor(configService: ConfigService) {
    const stripeSecretKey = configService.getOrThrow('STRIPE_SECRET_KEY');
    const stripeSecretKeyEncodedCredentials = base64Encode(`${stripeSecretKey}:`);

    if (configService.get('QUEUE_DASHBOARD_USER')) {
      const username = configService.getOrThrow('QUEUE_DASHBOARD_USER');
      const password = configService.getOrThrow('QUEUE_DASHBOARD_PASSWORD');
      const encodedCredentials = base64Encode(username + ':' + password);
      this.encodedCredentials = [encodedCredentials, stripeSecretKeyEncodedCredentials];
    } else {
      this.encodedCredentials = [stripeSecretKeyEncodedCredentials];
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const reqCreds = req.get('authorization')?.split('Basic ')?.[1] ?? null;
    if (!reqCreds || !this.encodedCredentials.includes(reqCreds)) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Access to Queue Dashboard", charset="UTF-8"');
      res.sendStatus(401);
    } else {
      next();
    }
  }
}

const base64Encode = (value: string) => Buffer.from(value).toString('base64');

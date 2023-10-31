import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class BasicAuthMiddleware implements NestMiddleware {
  private readonly encodedCredentials: string;

  constructor(configService: ConfigService) {
    let username: string;
    let password: string;

    if (configService.get('QUEUE_DASHBOARD_USER')) {
      username = configService.getOrThrow('QUEUE_DASHBOARD_USER');
      password = configService.getOrThrow('QUEUE_DASHBOARD_PASSWORD');
    } else {
      // Fallback to Stripe Secret key as the username without a password.
      const stripeSecretKey = configService.getOrThrow('STRIPE_SECRET_KEY')
      username = stripeSecretKey;
      password = "";
    }
    this.encodedCredentials = Buffer.from(username + ':' + password).toString(
      'base64',
    )
  }

  use(req: Request, res: Response, next: NextFunction) {
    const reqCreds = req.get('authorization')?.split('Basic ')?.[1] ?? null;

    if (!reqCreds || reqCreds !== this.encodedCredentials) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Access to Queue Dashboard", charset="UTF-8"');
      res.sendStatus(401);
    } else {
      next();
    }
  }
}

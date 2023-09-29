import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class BasicAuthMiddleware implements NestMiddleware {
  private readonly username = 'user';
  private readonly password = 'password';

  private readonly encodedCreds = Buffer.from(
    this.username + ':' + this.password,
  ).toString('base64');

  constructor(configService: ConfigService) {
    this.username = configService.getOrThrow("BULLBOARD_USER");
    this.password = configService.getOrThrow("BULLBOARD_PASSWORD");  
  }

  use(req: Request, res: Response, next: NextFunction) {
    const reqCreds = req.get('authorization')?.split('Basic ')?.[1] ?? null;

    if (!reqCreds || reqCreds !== this.encodedCreds) {
      res.setHeader(
        'WWW-Authenticate',
        'Basic realm="Access to Queue Dashboard", charset="UTF-8"',
      );
      res.sendStatus(401);
    } else {
      next();
    }
  }
}

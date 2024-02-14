import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { RequestWithRawBody } from '../lib/types';
import { Response } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async handleIncomingEvents(
    @Headers('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    await this.webhookService.constructEventFromPayload(
      signature,
      request.rawBody,
    );

    res.send();
  }
}

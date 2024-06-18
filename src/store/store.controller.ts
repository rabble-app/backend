import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  Request,
  HttpStatus,
  Patch,
  Param,
  Get,
  HttpException,
  Query,
  UseFilters,
  UseInterceptors,
  ParseFilePipeBuilder,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { CreateOpenHoursDto } from './dto/create-open-hours.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { HttpExceptionFilter } from '../middlewares/http-exception.filters';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from '../uploads/uploads.service';
import { TeamsServiceExtension2 } from '../teams/teams.service.extension2';
import { UpdateOpenHoursDto } from './dto/update-open-hours.dto';

@ApiTags('store')
@ApiBearerAuth()
@Controller('store')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly uploadsService: UploadsService,
    private readonly teamsServiceExtension2: TeamsServiceExtension2,
  ) {}

  /**
   * create new store.
   * @param {Body} createStoreDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('create')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiConflictResponse({ description: 'Store name already exist' })
  @ApiCreatedResponse({ description: 'Store created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async create(
    @Body() createStoreDto: CreateStoreDto,
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ): Promise<IAPIResponse> {
    const userId = req.user.userId;
    const isOwnerExisting = await this.storeService.findStore({
      userId,
    });
    if (isOwnerExisting) {
      return formatResponse(
        'Duplicate owner',
        res,
        HttpStatus.CONFLICT,
        true,
        'You already have a store',
      );
    }
    const storeNameExisting = await this.storeService.findStore({
      name: createStoreDto.name,
    });
    if (storeNameExisting) {
      return formatResponse(
        'Duplicate name',
        res,
        HttpStatus.CONFLICT,
        true,
        'Store name already exist',
      );
    }
    const result = await this.storeService.createStore(userId, createStoreDto);
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Store created successfully',
    );
  }

  /**
   * Add store open hours.
   * @param {Body} createOpenHoursDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch('open-hours')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiConflictResponse({ description: 'Store open hours already exist' })
  @ApiCreatedResponse({ description: 'Store open hours added successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addOpenHours(
    @Body() createOpenHoursDto: CreateOpenHoursDto,
    @Res({ passthrough: true }) res: Response,
    @Request() req,
  ): Promise<IAPIResponse> {
    const isExisting = await this.storeService.getStoreOpenHours({
      partnerId: createOpenHoursDto.storeId,
    });
    if (isExisting) {
      return formatResponse(
        'Already exist',
        res,
        HttpStatus.CONFLICT,
        true,
        'Store open hours already exist',
      );
    }
    const userId = req.user.userId;
    const result = await this.storeService.createStoreOpenHours(
      createOpenHoursDto,
      userId,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Store open hours added successfully',
    );
  }

  /**
   * update store record.
   * @param {Body} updateStoreDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Patch(':storeId')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Store record updated successfully' })
  @ApiConflictResponse({
    description: 'Store name/stripe connect id already exist',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async updateStore(
    @Param('storeId') storeId: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    // check if name already exist
    if (updateStoreDto.name) {
      const isExisting = await this.storeService.findStore({
        name: updateStoreDto.name,
      });
      if (isExisting) {
        return formatResponse(
          'Duplicate name',
          res,
          HttpStatus.CONFLICT,
          true,
          'Store name already exist',
        );
      }
    }

    const result = await this.storeService.updateStore({
      where: { id: storeId },
      data: updateStoreDto,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Store record updated successfully',
    );
  }

  /**
   * Get store inbound deliveries.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get(':storeId/deliveries')
  @UseFilters(HttpExceptionFilter)
  @ApiBadRequestResponse({
    description: 'Invalid query parameter (offset | period)',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({ name: 'storeId', required: true, description: 'The store id' })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Pagination offset',
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return per page',
    type: 'number',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Delivery period',
    enum: ['today', 'upcoming', 'past'],
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by team name or producer name',
    type: 'string',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <access_token>',
  })
  async getStoreDeliveries(
    @Param('storeId') storeId: string,
    @Res({ passthrough: true }) res: Response,
    @Request() req,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('period') period?: 'today' | 'upcoming' | 'past',
    @Query('search') search?: string,
  ): Promise<IAPIResponse> {
    const { store, skip, take } =
      await this.storeService.storeDeliveryAndCollectionValidation(
        storeId,
        offset,
        limit,
        period,
        req.user.userId,
      );
    const result = await this.storeService.getStoreDeliveries({
      partnerId: store.userId,
      skip,
      period,
      search,
      limit: take,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Store deliveries returned successfully',
    );
  }

  /**
   * Confirm order products received.
   * @param {Body} ConfirmOrderDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('/:storeId/confirm-order-receipt')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async confirmOrderProductsReceived(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|png|jpg)$/,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
    @Body() body: ConfirmOrderDto,
    @Res({ passthrough: true }) res: Response,
    @Request() req,
    @Param('storeId') storeId: string,
  ): Promise<IAPIResponse> {
    const confirmOrderDto = {
      ...body,
      products: JSON.parse(body.products as any) as ConfirmOrderDto['products'],
    };
    const isValidEmployee = await this.storeService.isUserAnEmployee(
      req.user.userId,
      storeId,
    );
    if (!isValidEmployee) {
      throw new HttpException(
        'Invalid store id. User must be a store employee',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hasValidBasketSummary = await this.storeService.validateBasketSummary(
      confirmOrderDto.orderId,
      confirmOrderDto.products,
    );
    if (!hasValidBasketSummary && !confirmOrderDto.note) {
      throw new HttpException(
        'One of the order products has insufficient quantity, please add a note',
        HttpStatus.BAD_REQUEST,
      );
    }
    const upload = await this.uploadsService.uploadFile(
      file,
      'order-confirmation-',
    );
    const result = await this.storeService.updateOrderConfirmation(
      confirmOrderDto as any,
      req.user.userId,
      upload.Location,
      upload.Key,
    );
    if (!result) {
      throw new HttpException(
        'Order confirmation update failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const confirmationStatus = hasValidBasketSummary ? 'CONFIRMED' : 'PARTIAL';
    await this.storeService.updateOrderConfirmationStatus(
      confirmOrderDto.orderId,
      confirmationStatus,
    );
    return formatResponse(
      {
        status: confirmationStatus,
      },
      res,
      HttpStatus.OK,
      false,
      'Order confirmation updated successfully',
    );
  }

  /**
   * Get store customer collections.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get(':storeId/collections')
  @UseFilters(HttpExceptionFilter)
  // @ApiBadRequestResponse({
  //   description: 'Invalid query parameter (offset | period)',
  // })
  // @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  // @ApiParam({ name: 'storeId', required: true, description: 'The store id' })
  // @ApiQuery({
  //   name: 'offset',
  //   required: false,
  //   description: 'Pagination offset',
  //   type: 'number',
  // })
  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: 'Number of records to return per page',
  //   type: 'number',
  // })
  // @ApiQuery({
  //   name: 'period',
  //   required: false,
  //   description: 'Delivery period',
  //   enum: ['today', 'upcoming', 'past'],
  // })
  // @ApiQuery({
  //   name: 'search',
  //   required: false,
  //   description: 'Search by user first name, last name or team name',
  //   type: 'string',
  // })
  // @ApiHeader({
  //   name: 'Authorization',
  //   description: 'Bearer <access_token>',
  // })
  async getStoreCollections(
    @Param('storeId') storeId: string,
    @Res({ passthrough: true }) res: Response,
    @Request() req,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('period') period?: 'today' | 'upcoming' | 'past',
    @Query('search') search?: string,
  ): Promise<IAPIResponse> {
    const { store, skip, take } =
      await this.storeService.storeDeliveryAndCollectionValidation(
        storeId,
        offset,
        limit,
        period,
        req.user.userId,
      );

    const result = await this.storeService.getStoreCustomerCollections({
      partnerId: store.userId,
      skip,
      period,
      search,
      limit: take,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Store customer collections returned successfully',
    );
  }

  /**
   * Get order details.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get(':teamId/order-details')
  @ApiBadRequestResponse({
    description: 'Invalid query parameter (offset | period)',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({ name: 'teamId', required: true, description: 'The team id' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <access_token>',
  })
  @ApiQuery({
    name: 'orderId',
    required: false,
    description: 'The id of the order',
    type: 'string',
  })
  async getOrderDetails(
    @Param('teamId') teamId: string,
    @Query('orderId') orderId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    let teamOrderId: string;
    if (orderId) {
      teamOrderId = orderId;
    } else {
      const order = await this.teamsServiceExtension2.returnCurrentOrder(
        teamId,
      );
      teamOrderId = order.id;
    }
    const result = await this.storeService.getOrderWithGroupedBaskets(
      teamOrderId,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Order details returned successfully',
    );
  }

  /**
   * Get store information.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('profile/:storeId')
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({ name: 'stoereId', required: true, description: 'The store id' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <access_token>',
  })
  @ApiCreatedResponse({
    description: 'Store information returned successfully',
  })
  async getStoreInformation(
    @Param('storeId') storeId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.storeService.findStore({ id: storeId });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Store information returned successfully',
    );
  }

  /**
   * Get store open hours information.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('open-hours/:storeId')
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({ name: 'stoereId', required: true, description: 'The store id' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <access_token>',
  })
  @ApiCreatedResponse({
    description: 'Store open hour information returned successfully',
  })
  async getStoreOpenHoursInformation(
    @Param('storeId') storeId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.storeService.getStoreOpenHours({
      partnerId: storeId,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Store open hour information returned successfully',
    );
  }

  /**
   * Update Store open hour.
   * @param {Response} res - The payload.
   * @memberof StoreController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Put('/:openHourId/open-hour')
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'openHourId',
    required: true,
    description: 'The store open hour Id',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer <access_token>',
  })
  @ApiCreatedResponse({
    description: 'Store open hour updated successfully',
  })
  async updateStoreOpenHour(
    @Param('openHourId') openHourId: string,
    @Res({ passthrough: true }) res: Response,
    @Body() updateOpenHoursDto: UpdateOpenHoursDto,
  ): Promise<IAPIResponse> {
    const result = await this.storeService.updateStoreOpenHours({
      where: {
        id: openHourId,
      },
      data: {
        ...this.storeService.UpdateStoreOpenHoursData(
          openHourId,
          updateOpenHoursDto,
        ),
      },
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Store open hour updated successfully',
    );
  }
}

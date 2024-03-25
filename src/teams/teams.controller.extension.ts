import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Get,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { NudgeTeamMemberDto } from './dto/nudge-team-member.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { BulkInviteDto } from './dto/bulk-invite.dto';
import { VerifyInviteDto } from './dto/verify-invite.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { TeamsServiceExtension } from './teams.service.extension';
import { TeamsServiceExtension2 } from './teams.service.extension2';
import { AuthGuard } from '../../src/auth/auth.guard';

@ApiTags('teams')
@Controller('teams')
@ApiBearerAuth()
export class TeamsControllerExtension {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly notificationsService: NotificationsService,
    private readonly teamsServiceExtension: TeamsServiceExtension,
    private readonly teamsServiceExtension2: TeamsServiceExtension2,
  ) {}

  /**
   * return buying teams of a user.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('user/:id')
  @ApiOkResponse({
    description: 'User buying teams returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The user id',
  })
  async getUserTeams(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension.getUserTeams(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'User buying teams returned successfully',
    );
  }

  /**
   * quit buying team.
   * @param {Body} joinTeamDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Delete('quit/:id')
  @ApiOkResponse({ description: 'User removed from team successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The team membership id',
  })
  async quitTeam(
    @Param('id') teamMemberShipID: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension.quitBuyingTeam({
      id: teamMemberShipID,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'User removed from team successfully',
    );
  }

  /**
   * return a particular buying team information.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  // @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOkResponse({ description: 'Buying team returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the buying team',
  })
  @ApiQuery({
    name: 'trim',
    required: false,
    description:
      'This determines if a shorter version of the response should be supplied, it takes a true and false value',
  })
  async getBuyingTeam(
    @Param('id') id: string,
    @Query('trim') trim: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension.getTeamInfo(id, trim);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Buying team returned successfully',
    );
  }

  /**
   * return a particular buying team current order status.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('current-order/:id')
  @ApiOkResponse({
    description: 'Buying team order status returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the buying team',
  })
  @ApiQuery({
    name: 'trim',
    required: false,
    description:
      'This determines if a shorter version of the response should be supplied, it takes a true and false value',
  })
  async getBuyingTeamOrderStatus(
    @Param('id') id: string,
    @Query('trim') trim: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension.getTeamCurrentOrderStatus(
      id,
      trim,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Buying team order status returned successfully',
    );
  }

  /**
   * nudge team members to collect delivery.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('nudge/:orderId')
  @ApiOkResponse({
    description: 'Buying team nudged to collect delivery successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the buying team order',
  })
  async nudgeBuyingTeam(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension.nudgeTeam(id);
    if (!result) {
      return formatResponse(
        'Feature locked',
        res,
        HttpStatus.CONFLICT,
        true,
        'You are allowed to nudge the team once in 24 hours',
      );
    }
    return formatResponse(
      'Notification sent',
      res,
      HttpStatus.OK,
      false,
      'Buying team nudged to collect delivery successfully',
    );
  }

  /**
   * nudge team member to update card information.
   * @param {Body} nudgeTeamMemberDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('nudge')
  @ApiOkResponse({
    description: 'Team member nudged to update card info successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async nudgeTeamMember(
    @Body() nudgeTeamMemberDto: NudgeTeamMemberDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    await this.notificationsService.sendSMS(
      `Your payment has failed. You will need to update your card details to remain in the ${nudgeTeamMemberDto.teamName} buying Team`,
      nudgeTeamMemberDto.memberPhone,
    );
    return formatResponse(
      'Notification sent',
      res,
      HttpStatus.OK,
      false,
      'Team member nudged to update card info successfully',
    );
  }

  /**
   * bulk invite.
   * @param {Body} bulkInviteDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('bulk-invite')
  @ApiOkResponse({
    description: 'Users invited to the team successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async bulkInvite(
    @Body() bulkInviteDto: BulkInviteDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension.bulkInvite(bulkInviteDto);
    if (!result) {
      return formatResponse(
        'Error Occured',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Invite processing failed',
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Users invited to the team successfully',
    );
  }

  /**
   * verify invite.
   * @param {Body} verifyInviteDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @Post('/verify-invite')
  @ApiOkResponse({
    description: 'Invite verified successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid token supplied' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async verifyInvite(
    @Body() verifyInviteDto: VerifyInviteDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension2.verifyInvite(
      verifyInviteDto.token,
    );
    if (!result) {
      return formatResponse(
        'Token is invalid/expired',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Invalid/expired token supplied',
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Invite verified successfully',
    );
  }

  /**
   * return a particular buying team current order status.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('/members/skip-delivery/:id')
  @ApiOkResponse({
    description: 'Next delivery skipped successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the team membership',
  })
  async skipNextDelivery(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension2.skipDelivery(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Next delivery skipped successfully',
    );
  }

  /**
   * add user to team.
   * @param {Body} addMemberDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('/add-member')
  @ApiOkResponse({
    description: 'New member added successfully',
  })
  @ApiBadRequestResponse({ description: 'Invaid information supplied' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async addToTeam(
    @Body() addMemberDto: AddMemberDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsService.addTeamMember(addMemberDto);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'New member added successfully',
    );
  }

  /**
   * check if buying team name already exist
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('check-name/:keyword')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Buying team name is taken' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'keyword',
    required: true,
    description: 'The name you want to check',
  })
  async checkBuyingTeamExist(
    @Param('keyword') name: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const isExisting = await this.teamsService.findBuyingTeam({
      name,
    });

    return formatResponse(
      isExisting ? true : false,
      res,
      HttpStatus.OK,
      false,
      `Buying team name is ${isExisting ? 'taken' : 'still available'}`,
    );
  }

  /**
   * check if buying team exist for a postal code under a producer
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Get('check-producer-group/:producerId/:postalCode')
  @ApiOkResponse({ description: 'Buying teams returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'producerId',
    required: true,
    description: 'The id of the producer',
  })
  @ApiParam({
    name: 'postalCode',
    required: true,
    description: 'The postal code',
  })
  async checkProducerBuyingTeam(
    @Param('producerId') producerId: string,
    @Param('postalCode') postalCode: string,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const userId = req.user.id ? req.user.id : req.user.userId;
    const result = await this.teamsService.findProducerPCTeams(
      {
        producerId,
        postalCode,
      },
      userId,
    );

    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      `Buying teams returned successfully`,
    );
  }
}

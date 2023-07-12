import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
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

@ApiTags('teams')
@Controller('teams')
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
  @Get(':id')
  @ApiOkResponse({ description: 'Buying team returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the buying team',
  })
  async getBuyingTeam(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension.getTeamInfo(id);
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
  async getBuyingTeamOrderStatus(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension.getTeamCurrentOrderStatus(
      id,
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
  @Post('nudge/:id')
  @ApiOkResponse({
    description: 'Buying team nudged to collect delivery successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the buying team',
  })
  async nudgeBuyingTeam(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    await this.teamsServiceExtension.nudgeTeam(id);
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
        'Token is invalid',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Invalid token supplied',
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
}

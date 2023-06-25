import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Get,
  Param,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IAPIResponse } from '../lib/types';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { NudgeTeamMemberDto } from './dto/nudge-team-member.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { BulkInviteDto } from './dto/bulk-invite.dto';
import { VerifyInviteDto } from './dto/verify-invite.dto';
import { AddMemberDto } from './dto/add-member.dto';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * create new team.
   * @param {Body} createTeamDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @Post('create')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Buying team created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async createProducer(
    @Body() createTeamDto: CreateTeamDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsService.createTeam(createTeamDto);
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Buying team created successfully',
    );
  }

  /**
   * return all buying teams.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @Get('')
  @ApiOkResponse({ description: 'Buying teams returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getAllTeams(
    @Query('offset') offset: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsService.getTeams(
      offset ? +offset : undefined,
    );
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Buying teams returned successfully',
    );
  }

  /**
   * return buying teams of a particular producer.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @Get('producer/:id')
  @ApiOkResponse({ description: 'Producer buying teams returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the producer',
  })
  async getProducerTeams(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsService.getProducerTeams(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Producer buying teams returned successfully',
    );
  }

  /**
   * return buying teams of a particular postal code.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @Get('postalcode/:id')
  @ApiOkResponse({
    description: 'Postal code buying teams returned successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The postal code',
  })
  async getPostalCodeTeams(
    @Param('id') postalCode: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsService.getPostalCodeTeams(postalCode);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Postal code buying teams returned successfully',
    );
  }

  /**
   * update buying team.
   * @param {id} teamId
   * @param {Body} updateTeamDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @Patch(':id')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiOkResponse({ description: 'Team record updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The team id',
  })
  async updateTeam(
    @Param('id') teamId: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsService.updateTeam({
      where: { id: teamId },
      data: updateTeamDto,
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Team record updated successfully',
    );
  }

  /**
   * delete buying team.
   * @param {id} teamId
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @Delete(':id')
  @ApiOkResponse({ description: 'Team record deleted successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The team id',
  })
  async deleteTeam(
    @Param('id') teamId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsService.deleteTeam({ id: teamId });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Team record deleted successfully',
    );
  }

  /**
   * create request to join team.
   * @param {Body} joinTeamDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @Post('join')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Request sent successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async joinTeam(
    @Body() joinTeamDto: JoinTeamDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsService.sendJoinRequest(joinTeamDto);
    if (!result) {
      return formatResponse(
        'Request already exist',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Duplicate Request',
      );
    }
    return formatResponse(
      result,
      res,
      HttpStatus.CREATED,
      false,
      'Request sent successfully',
    );
  }

  /**
   * approve/reject request to join team.
   * @param {Body} updateRequestDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @Patch('/request/update')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Request updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async requestUpdate(
    @Body() updateRequestDto: UpdateRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsService.updateRequest(updateRequestDto);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Request updated successfully',
    );
  }

  /**
   * return members of a buying team.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @Get('/members/:id')
  @ApiOkResponse({ description: 'Team members returned successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The id of the team',
  })
  async getTeamMembers(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsService.getTeamMembers(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Team members returned successfully',
    );
  }

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
    const result = await this.teamsService.getUserTeams(id);
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
    const result = await this.teamsService.quitBuyingTeam({
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
    const result = await this.teamsService.getTeamInfo(id);
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
    const result = await this.teamsService.getTeamCurrentOrderStatus(id);
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
    await this.teamsService.nudgeTeam(id);
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
    const result = await this.teamsService.bulkInvite(bulkInviteDto);
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
    const result = await this.teamsService.verifyInvite(verifyInviteDto.token);
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
    const result = await this.teamsService.skipDelivery(id);
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

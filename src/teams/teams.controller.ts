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
  UseGuards,
  Request,
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
import { TeamsServiceExtension } from './teams.service.extension';
import { AuthGuard } from '../../src/auth/auth.guard';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly teamsServiceExtension: TeamsServiceExtension,
  ) {}

  /**
   * create new team.
   * @param {Body} createTeamDto - Request body object.
   * @param {Response} res - The payload.
   * @memberof TeamsController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('create')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Buying team created successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async createBuyingTeam(
    @Body() createTeamDto: CreateTeamDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const isExisting = await this.teamsService.findBuyingTeam({
      name: createTeamDto.name,
    });

    if (isExisting) {
      return formatResponse(
        'Duplicate name',
        res,
        HttpStatus.CONFLICT,
        true,
        'Buying team name already exist',
      );
    }
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
  @UseGuards(AuthGuard)
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
  // @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
    @Request() req,
    @Param('id') postalCode: string,
    @Res({ passthrough: true }) res: Response,
    @Query('offset') offset: number,
  ): Promise<IAPIResponse> {
    const userId = req.user.id ? req.user.id : req.user.userId;
    const result = await this.teamsService.getPostalCodeTeams(
      postalCode,
      userId,
      offset ? +offset : undefined,
    );
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  @Patch('/request/update')
  @ApiBadRequestResponse({ description: 'Invalid data sent' })
  @ApiCreatedResponse({ description: 'Request updated successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async requestUpdate(
    @Body() updateRequestDto: UpdateRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.teamsServiceExtension.updateRequest(
      updateRequestDto,
    );
    if (!result) {
      return formatResponse(
        'Invalid data',
        res,
        HttpStatus.BAD_REQUEST,
        true,
        'Wrong data supplied',
      );
    }
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
  @UseGuards(AuthGuard)
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
    const result = await this.teamsServiceExtension.getTeamMembers(id);
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Team members returned successfully',
    );
  }
}

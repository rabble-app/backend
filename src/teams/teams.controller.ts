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

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  /**
   * create new team.
   * @param {Body} CreateTeamDto - Request body object.
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
}

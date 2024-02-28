import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { formatResponse } from '../lib/helpers';
import { Response } from 'express';
import { IAPIResponse } from '../lib/types';
import { ProfilePixUploadDto } from './dto/profile-pix-upload.dto';
import { UsersService } from '../users/users.service';
import { TeamPixUploadDto } from './dto/team-pix-upload.dto';
import { TeamsService } from '../teams/teams.service';
import { AuthGuard } from '../../src/auth/auth.guard';

@ApiTags('uploads')
@Controller('uploads')
@ApiBearerAuth()
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly usersService: UsersService,
    private readonly teamsService: TeamsService,
  ) {}

  /**
   * update profile photo
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('/profile-pix')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({ description: 'Profile photo uploaded successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async profilePhoto(
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() profilePixUploadDto: ProfilePixUploadDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.uploadsService.uploadFile(
      file,
      'profile/',
      profilePixUploadDto.imageKey,
    );
    await this.usersService.updateUser({
      where: { id: profilePixUploadDto.userId },
      data: {
        imageUrl: result.Location,
        imageKey: result.Key,
      },
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Profile photo uploaded successfully',
    );
  }

  /**
   * update buying team photo
   * @param {Response} res - The payload.
   * @memberof UsersController
   * @returns {JSON} - A JSON success response.
   */
  @UseGuards(AuthGuard)
  @Post('/team-pix')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({ description: 'Buying team photo uploaded successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async teamPhoto(
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() teamPixUploadDto: TeamPixUploadDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAPIResponse> {
    const result = await this.uploadsService.uploadFile(
      file,
      'teams/',
      teamPixUploadDto.imageKey,
    );

    await this.teamsService.updateTeam({
      where: { id: teamPixUploadDto.teamId },
      data: {
        imageUrl: result.Location,
        imageKey: result.Key,
      },
    });
    return formatResponse(
      result,
      res,
      HttpStatus.OK,
      false,
      'Buying team photo uploaded successfully',
    );
  }
}

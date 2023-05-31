import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { UsersModule } from '../users/users.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  imports: [UsersModule, TeamsModule],
})
export class UploadsModule {}

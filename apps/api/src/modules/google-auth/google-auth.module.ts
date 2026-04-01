import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleToken } from '../../database/entities';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthController } from './google-auth.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([GoogleToken])],
  controllers: [GoogleAuthController],
  providers: [GoogleAuthService],
  exports: [GoogleAuthService],
})
export class GoogleAuthModule {}

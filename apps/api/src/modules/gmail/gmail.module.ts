import { Module } from '@nestjs/common';
import { GoogleAuthModule } from '../google-auth/google-auth.module';
import { GmailService } from './gmail.service';

@Module({
  imports: [GoogleAuthModule],
  providers: [GmailService],
  exports: [GmailService],
})
export class GmailModule {}

import { Module, Global } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { CloudinaryService } from './services/cloudinary.service';

@Global()
@Module({
  providers: [EmailService, CloudinaryService],
  exports: [EmailService, CloudinaryService],
})
export class SharedModule {}

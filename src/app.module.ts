
import { Module } from '@nestjs/common';
import { AdkController } from './adk/adk.controller';
import { AdkService } from './adk/adk.service';
import { A2aModule } from './a2a/a2a.module';

@Module({
  imports: [A2aModule],
  controllers: [AdkController],
  providers: [AdkService],
})
export class AppModule { }

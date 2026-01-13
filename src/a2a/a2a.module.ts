
import { Module } from '@nestjs/common';
import { A2aController } from './a2a.controller';

@Module({
    controllers: [A2aController],
})
export class A2aModule { }

import { Module } from '@nestjs/common';
import { Venue } from './entities/venue.entity.js';
import { Seat } from './entities/seat.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesController } from './venues.controller.js';
import { VenuesService } from './venues.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Venue, Seat])],
  controllers: [VenuesController],
  providers: [VenuesService],
})
export class VenuesModule {}

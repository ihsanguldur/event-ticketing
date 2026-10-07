import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { VenuesService } from './venues.service.js';
import { CreateVenueDto } from './dto/request/create-venue.dto.js';
import { ListVenuesQueryDto } from './dto/request/list-venues-query.dto.js';
import { VenueDetailResponseDto } from './dto/response/venue-detail-response.dto.js';
import { VenuePageResponseDto } from './dto/response/venue-page-response.dto.js';
import { ApiParam } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator.js';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  create(@Body() dto: CreateVenueDto): Promise<VenueDetailResponseDto> {
    return this.venuesService.create(dto);
  }

  @Public()
  @Get()
  findAll(@Query() query: ListVenuesQueryDto): Promise<VenuePageResponseDto> {
    return this.venuesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiParam({ name: 'id', format: 'uuid' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VenueDetailResponseDto> {
    return this.venuesService.findOne(id);
  }
}

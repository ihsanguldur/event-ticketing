import { OmitType } from '@nestjs/swagger';
import { Venue } from '../../entities/venue.entity.js';

export class VenueResponseDto extends OmitType(Venue, ['seats'] as const) {}

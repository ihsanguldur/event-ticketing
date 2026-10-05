import { VenueResponseDto } from './venue-response.dto.js';

export class VenuePageResponseDto {
  items: VenueResponseDto[];
  total: number;
  page: number;
  limit: number;
}

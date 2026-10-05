import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateVenueDto } from './dto/request/create-venue.dto.js';
import { Venue } from './entities/venue.entity.js';
import { Seat } from './entities/seat.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ListVenuesQueryDto } from './dto/request/list-venues-query.dto.js';

const MAX_SEATS_PER_VENUE = 10_000;

@Injectable()
export class VenuesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Venue) private readonly venues: Repository<Venue>,
    @InjectRepository(Seat) private readonly seats: Repository<Seat>,
  ) {}

  async create(dto: CreateVenueDto) {
    const { sections, ...venueFields } = dto;

    const names = sections.map((s) => s.section);
    if (new Set(names).size !== names.length) {
      throw new BadRequestException('section names must be unique');
    }

    const seatCount = sections.reduce(
      (sum, s) => sum + s.rows * s.seatsPerRow,
      0,
    );
    if (seatCount > MAX_SEATS_PER_VENUE) {
      throw new BadRequestException(
        `a venue can have at most ${MAX_SEATS_PER_VENUE} seats`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const venue = await manager.save(manager.create(Venue, venueFields));

      const seats: Partial<Seat>[] = [];
      for (const { section, rows, seatsPerRow } of sections) {
        for (let row = 1; row <= rows; row++) {
          for (let number = 1; number <= seatsPerRow; number++) {
            seats.push({
              venueId: venue.id,
              section,
              row: String(row),
              number,
            });
          }
        }
      }
      await manager.insert(Seat, seats);

      return Object.assign(venue, { seatCount });
    });
  }

  async findAll({ page, limit, city }: ListVenuesQueryDto) {
    const [items, total] = await this.venues.findAndCount({
      where: city ? { city } : {},
      order: { createdAt: 'DESC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const venue = await this.venues.findOneBy({ id });
    if (!venue) {
      throw new NotFoundException(`venue ${id} not found`);
    }

    const seatCount = await this.seats.countBy({ venueId: id });
    return Object.assign(venue, { seatCount });
  }
}

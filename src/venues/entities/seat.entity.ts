import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
} from 'typeorm';
import { Venue } from './venue.entity.js';

@Entity('seats')
@Unique(['venueId', 'section', 'row', 'number'])
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  venueId: string;

  @ManyToOne(() => Venue, (venue) => venue.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Relation<Venue>;

  @Column({ length: 20 })
  section: string;

  @Column({ length: 10 })
  row: string;

  @Column('int')
  number: number;
}

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { SectionSpecDto } from './section-spec.dto.js';

export class CreateVenueDto {
  @IsString()
  @Length(1, 200)
  name: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SectionSpecDto)
  sections: SectionSpecDto[];
}

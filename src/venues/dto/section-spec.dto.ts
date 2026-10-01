import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class SectionSpecDto {
  @IsString()
  @Length(1, 20)
  section: string;

  @IsInt()
  @Min(1)
  @Max(100)
  rows: number;

  @IsInt()
  @Min(1)
  @Max(100)
  seatsPerRow: number;
}

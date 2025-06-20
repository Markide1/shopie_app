import { IsOptional, IsString } from 'class-validator';

export class FilterProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'price' | 'name' | 'createdAt';

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}

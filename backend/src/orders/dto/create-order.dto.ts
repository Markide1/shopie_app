import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  cartIds: string[];

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

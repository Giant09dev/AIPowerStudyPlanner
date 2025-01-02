import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: "The user's username", required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: "The user's password", required: false })
  @IsOptional()
  @Length(6, 20)
  password?: string;

  @ApiProperty({ description: "The user's photo URL", required: false })
  @IsOptional()
  @IsUrl()
  photoURL?: string;
}

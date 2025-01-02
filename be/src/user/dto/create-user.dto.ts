import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ description: "The user's username" })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: "The user's email address" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: "The user's password" })
  @IsNotEmpty()
  @Length(6, 20)
  password: string;

  @ApiProperty({ description: "The user's photo URL", required: false })
  @IsOptional() // Trường photoURL là tùy chọn
  @IsUrl()
  photoURL?: string; // Ảnh đại diện của người dùng, có thể để trống
}

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ example: "user@email.com" })
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @ApiProperty({ minLength: 8, maxLength: 128 })
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ minLength: 2, maxLength: 100 })
  name!: string;
}

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: "user@email.com" })
  email!: string;

  @IsString()
  @ApiProperty()
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @ApiProperty()
  refreshToken!: string;
}

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: ["USER", "ADMIN"] })
  role!: string;

  @ApiProperty()
  createdAt!: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  expiresIn!: number;

  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;
}

export class MessageResponseDto {
  @ApiProperty()
  message!: string;
}

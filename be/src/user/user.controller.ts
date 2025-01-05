import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  registerUser(@Body() registerUserDTo: RegisterUserDto) {
    return this.userService.registerUser(registerUserDTo);
  }
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() loginDto: LoginDto) {
    return this.userService.loginUser(loginDto);
  }

  // Endpoint để login bằng Google
  @Post('login-google')
  loginWithGoogle(@Body('googleIdToken') googleIdToken: string) {
    // Gọi service để xử lý login với Google ID Token
    return this.userService.loginWithGoogle(googleIdToken);
  }

  @Post('refresh-auth')
  refreshAuth(@Body('refreshToken') refreshToken: string) {
    return this.userService.refreshAuthToken(refreshToken);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getProfile(@Req() req: Request) {
    return this.userService.getProfile(req);
  }

  @Patch('profile/update')
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    return this.userService.updateProfile(updateUserDto, req);
  }

  @Delete('remove')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  remove(@Req() req: Request) {
    return this.userService.removeUser(req);
  }
}

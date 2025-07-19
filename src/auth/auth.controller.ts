import { Controller, Post, Body, Query, Get, BadRequestException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.identifier,
      loginDto.password,
    );
    return this.authService.login(user);
  }
  @Post('magic-login')
  async sendMagicLink(@Body('email') email: string) {
    return this.authService.sendMagicLink(email);
  }
  @Get('magic-login')
  async magicLogin(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      throw new BadRequestException('Token no proporcionado');
    }
    
    const result = await this.authService.loginWithMagicLink(token);
    return res.status(200).json(result);
    //return res.redirect(`${this.config.get('FRONTEND_URL')}/login-success?token=${token}`);

    }
}

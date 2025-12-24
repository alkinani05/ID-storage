import { Controller, Post, Body, HttpCode, HttpStatus, Get, Put, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('profile')
    updateProfile(@Request() req: any, @Body() body: {
        fullName?: string;
        phone?: string;
        nationality?: string;
        dateOfBirth?: string;
        address?: string;
        bio?: string;
        notifyExpiry?: boolean;
        notifySharing?: boolean;
        language?: string;
    }) {
        return this.authService.updateProfile(req.user.userId, body);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    changePassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
        return this.authService.changePassword(req.user.userId, body.currentPassword, body.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-email')
    @HttpCode(HttpStatus.OK)
    changeEmail(@Request() req: any, @Body() body: { newEmail: string; password: string }) {
        return this.authService.updateEmail(req.user.userId, body.newEmail, body.password);
    }
}

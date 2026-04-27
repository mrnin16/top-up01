import {
  Controller, Post, Get, Patch, Body, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterSchema, LoginSchema, OtpSendSchema, OtpVerifySchema } from '@topup/shared';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @ApiOperation({ summary: 'Register a new account' })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  register(@Body() body: unknown) {
    return this.auth.register(RegisterSchema.parse(body));
  }

  @ApiOperation({ summary: 'Login with email/phone + password' })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body() body: unknown) {
    return this.auth.login(LoginSchema.parse(body));
  }

  @ApiOperation({ summary: 'Exchange refresh token for new access token' })
  @Post('refresh')
  refresh(@Body('refresh') token: string) {
    return this.auth.refresh(token);
  }

  @ApiOperation({ summary: 'Send OTP to email or phone' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('otp/send')
  sendOtp(@Body() body: unknown) {
    const dto = OtpSendSchema.parse(body);
    return this.auth.sendOtp((dto.email ?? dto.phone)!);
  }

  @ApiOperation({ summary: 'Verify OTP code' })
  @Post('otp/verify')
  verifyOtp(@Body() body: unknown) {
    const dto = OtpVerifySchema.parse(body);
    return this.auth.verifyOtp(dto.token, dto.code);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.auth.getMe(req.user.userId);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() body: { name?: string; email?: string; phone?: string }) {
    return this.auth.updateMe(req.user.userId, body);
  }
}

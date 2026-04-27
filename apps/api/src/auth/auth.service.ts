import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { randomInt, randomBytes } from 'crypto';
import { RegisterDto, LoginDto } from '@topup/shared';

@Injectable()
export class AuthService {
  // OTP store (in-process; swap for Redis in prod)
  private readonly otps = new Map<string, {
    code: string; expiresAt: number; attempts: number;
  }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Register ─────────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = dto.email
      ? await this.prisma.user.findUnique({ where: { email: dto.email } })
      : await this.prisma.user.findUnique({ where: { phone: dto.phone } });

    if (exists) throw new ConflictException('Account already exists');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: { email: dto.email, phone: dto.phone, name: dto.name, passwordHash },
    });

    return this.issueTokens(user);
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.emailOrPhone }, { phone: dto.emailOrPhone }] },
    });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user);
  }

  // ── Refresh ──────────────────────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    let payload: { sub: string; role: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();

    return this.issueTokens(user);
  }

  // ── OTP ──────────────────────────────────────────────────────────────────────
  async sendOtp(emailOrPhone: string): Promise<{ token: string }> {
    const code  = String(randomInt(100000, 999999));
    const token = randomBytes(16).toString('hex');
    this.otps.set(token, { code, expiresAt: Date.now() + 10 * 60_000, attempts: 0 });
    // Dev: log; Prod: send via email/SMS provider
    console.log(`[OTP] ${emailOrPhone} → ${code}`);
    return { token };
  }

  async verifyOtp(token: string, code: string) {
    const entry = this.otps.get(token);
    if (!entry)                        throw new BadRequestException('Invalid token');
    if (Date.now() > entry.expiresAt)  throw new BadRequestException('OTP expired');
    entry.attempts++;
    if (entry.attempts > 5)            throw new BadRequestException('Too many attempts');
    if (entry.code !== code)           throw new BadRequestException('Wrong code');
    this.otps.delete(token);
    return { verified: true };
  }

  // ── Profile ──────────────────────────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true, name: true, role: true, emailVerifiedAt: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, data: { name?: string; email?: string; phone?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, phone: true, name: true, role: true, createdAt: true },
    });
  }

  // ── Token issue ──────────────────────────────────────────────────────────────
  private issueTokens(user: { id: string; email?: string | null; name: string; role: string }) {
    // Include name so the frontend can decode it without an extra /me call
    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    const access  = this.jwt.sign(payload);
    const refresh = this.jwt.sign(payload, {
      secret:     this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn:  '30d',
    });
    return { access, refresh };
  }
}

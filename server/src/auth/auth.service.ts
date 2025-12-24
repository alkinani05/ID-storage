import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, fullName } = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName,
            },
        });

        return this.createToken(user);
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.createToken(user);
    }

    // Get user profile
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                avatar: true,
                nationality: true,
                dateOfBirth: true,
                address: true,
                bio: true,
                plan: true,
                notifyExpiry: true,
                notifySharing: true,
                language: true,
                createdAt: true,
                _count: {
                    select: { documents: true }
                }
            }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    // Update user profile
    async updateProfile(userId: string, data: {
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
        const updateData: any = {};

        if (data.fullName) updateData.fullName = data.fullName;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.nationality !== undefined) updateData.nationality = data.nationality;
        if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
        if (data.address !== undefined) updateData.address = data.address;
        if (data.bio !== undefined) updateData.bio = data.bio;
        if (data.notifyExpiry !== undefined) updateData.notifyExpiry = data.notifyExpiry;
        if (data.notifySharing !== undefined) updateData.notifySharing = data.notifySharing;
        if (data.language !== undefined) updateData.language = data.language;

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                nationality: true,
                dateOfBirth: true,
                address: true,
                bio: true,
                plan: true,
                notifyExpiry: true,
                notifySharing: true,
                language: true,
            }
        });

        return user;
    }

    // Change password
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            throw new BadRequestException('كلمة المرور الحالية غير صحيحة');
        }

        // Validate new password
        if (newPassword.length < 6) {
            throw new BadRequestException('كلمة المرور الجديدة قصيرة جداً (6 أحرف على الأقل)');
        }

        // Hash new password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });

        return { message: 'تم تغيير كلمة المرور بنجاح' };
    }

    // Update email
    async updateEmail(userId: string, newEmail: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new BadRequestException('كلمة المرور غير صحيحة');
        }

        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: newEmail },
        });

        if (existingUser) {
            throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { email: newEmail }
        });

        return { message: 'تم تحديث البريد الإلكتروني بنجاح' };
    }

    private createToken(user: any) {
        const payload = { sub: user.id, email: user.email, plan: user.plan };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                plan: user.plan,
                phone: user.phone,
                nationality: user.nationality,
            },
        };
    }
}

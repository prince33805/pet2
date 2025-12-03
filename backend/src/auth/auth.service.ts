import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto, CreateCustomerDto, loginCustomerDto } from './dto/create-customer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async create(createCustomerDto: CreateCustomerDto) {
        try {
            const existingUser = await this.prisma.customer.findFirst({
                where: {
                    OR: [
                        { username: createCustomerDto.username },
                        { phone: createCustomerDto.phone },
                    ],
                },
            });

            if (existingUser) {
                if (existingUser.username === createCustomerDto.username) {
                    throw new ConflictException('Username already exists');
                }
                if (existingUser.phone === createCustomerDto.phone) {
                    console.log("existingUser", existingUser);
                    throw new ConflictException('Phone number already exists');
                }
            }

            const hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);
            const customer = await this.prisma.customer.create({
                data: {
                    ...createCustomerDto,
                    password: hashedPassword,
                    totalPoints: 0
                },
            });
            return customer;
        } catch (error) {
            throw new HttpException(`Database create failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async validateUser(loginCustomerDto: loginCustomerDto): Promise<{ accessToken: string }> {
        try {
            const user = await this.prisma.customer.findUnique({
                where: { username: loginCustomerDto.username },
            });
            if (!user) {
                throw new ConflictException('User not found');
            }
            const isPasswordValid = await bcrypt.compare(loginCustomerDto.password, user.password);
            if (!isPasswordValid) {
                throw new ConflictException('Invalid credentials');
            }
            const payload = { sub: user.id, username: user.username, email: user.email, phone: user.phone };
            const accessToken = this.jwtService.sign(payload);
            return { accessToken };
        } catch (error) {
            throw new HttpException(`validateUser failed ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createStaff(createStaffDto: CreateStaffDto) {
        try {
            const existingUser = await this.prisma.staff.findFirst({
                where: {
                    OR: [
                        { email: createStaffDto.email },
                    ],
                },
            });

            if (existingUser) {
                if (existingUser.email === createStaffDto.email) {
                    throw new ConflictException('Username already exists');
                }
            }

            const hashedPassword = await bcrypt.hash(createStaffDto.password, 10);
            const staff = await this.prisma.staff.create({
                data: {
                    ...createStaffDto,
                    password: hashedPassword,
                },
            });
            return staff;
        } catch (error) {
            throw new HttpException(`Database create failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async loginStaff(loginCustomerDto: loginCustomerDto): Promise<{ accessToken: string }> {
        try {
            const user = await this.prisma.staff.findFirst({
                where: { name: loginCustomerDto.username },
                // where: { name: loginCustomerDto.username },
            });
            if (!user) {
                throw new ConflictException('User not found');
            }
            const isPasswordValid = await bcrypt.compare(loginCustomerDto.password, user.password);
            if (!isPasswordValid) {
                throw new ConflictException('Invalid credentials');
            }
            const payload = { sub: user.id, name: user.name, email: user.email , role: user.role };
            const accessToken = this.jwtService.sign(payload);
            return { accessToken };
        } catch (error) {
            throw new HttpException(`validateUser failed ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
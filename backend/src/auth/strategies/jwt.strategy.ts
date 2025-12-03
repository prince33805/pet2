import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'myPetSecretKey',
    });
  }
  async validate(payload: any) {
    const { sub, role } = payload;
    let user: any;
    if (role === 'STAFF') {
      user = await this.prisma.staff.findUnique({ where: { id: sub } });
    } else {
      user = await this.prisma.customer.findUnique({ where: { id: sub } });
    }
    if (!user) throw new UnauthorizedException('User not found or invalid token');
    console.log("user",user)
    return user;
  }
}
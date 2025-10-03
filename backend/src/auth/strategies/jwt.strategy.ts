import { Injectable } from "@nestjs/common";
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
    const user = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
    });
    // console.log("jwt validated")
    return user;
  }
}
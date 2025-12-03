import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'myPetSecretKey',
      signOptions: { expiresIn: '9h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,PrismaService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

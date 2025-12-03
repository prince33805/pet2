import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function STAFF() {
  return applyDecorators(
    Roles('STAFF'),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
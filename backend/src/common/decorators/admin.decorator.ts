import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function Admin() {
  return applyDecorators(
    Roles('admin'),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
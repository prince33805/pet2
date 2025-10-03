import { Body, Controller, Post, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateCustomerDto, loginCustomerDto } from './dto/create-customer.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('register')
  async create(@Body(new ValidationPipe()) body: CreateCustomerDto) {
    try {
      return await this.authService.create(body);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() loginCustomerDto: loginCustomerDto,) {
    try {
      return await this.authService.validateUser(loginCustomerDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
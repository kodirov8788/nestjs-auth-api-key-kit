import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async create(@Request() req: any, @Body() createApiKeyDto: CreateApiKeyDto) {
    return this.apiKeysService.create(req.user.id, createApiKeyDto.name);
  }

  @Get()
  async list(@Request() req: any) {
    return this.apiKeysService.list(req.user.id);
  }

  @Delete(':id')
  async revoke(@Request() req: any, @Param('id') id: string) {
    return this.apiKeysService.revoke(req.user.id, id);
  }
}

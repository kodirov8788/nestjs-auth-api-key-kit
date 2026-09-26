import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { FlexibleAuthGuard } from './common/guards/flexible-auth.guard';
import { GetUser } from './common/decorators/get-user.decorator';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('protected/profile')
  @UseGuards(FlexibleAuthGuard)
  async getProtectedProfile(@GetUser() user: any) {
    return {
      message: 'This is a protected route',
      user: {
        id: user.id,
        email: user.email,
        authenticatedAt: new Date().toISOString(),
      },
    };
  }
}

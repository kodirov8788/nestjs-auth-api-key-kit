import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class FlexibleAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private apiKeysService: ApiKeysService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      const userId = await this.apiKeysService.validateApiKey(apiKey);
      if (userId) {
        const user = await this.usersService.findById(userId);
        if (user) {
          request.user = user;
          return true;
        }
      }
    }

    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production';
        const payload = this.jwtService.verify(token, { secret });
        const user = await this.usersService.findById(payload.sub);
        if (user) {
          request.user = user;
          return true;
        }
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }

    throw new UnauthorizedException('Authentication required. Provide JWT Bearer token or X-API-Key header');
  }
}

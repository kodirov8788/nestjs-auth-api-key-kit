import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string) {
    const rawKey = this.generateApiKey();
    const prefix = rawKey.substring(0, 8);
    const keyHash = await bcrypt.hash(rawKey, 10);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name,
        keyPrefix: prefix,
        keyHash,
        userId,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
      },
    });

    return {
      ...apiKey,
      key: rawKey,
    };
  }

  async list(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(userId: string, keyId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId,
      },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.delete({
      where: { id: keyId },
    });

    return { message: 'API key revoked successfully' };
  }

  async validateApiKey(rawKey: string): Promise<string | null> {
    const prefix = rawKey.substring(0, 8);

    const apiKeys = await this.prisma.apiKey.findMany({
      where: { keyPrefix: prefix },
    });

    for (const apiKey of apiKeys) {
      const isValid = await bcrypt.compare(rawKey, apiKey.keyHash);
      if (isValid) {
        await this.prisma.apiKey.update({
          where: { id: apiKey.id },
          data: { lastUsedAt: new Date() },
        });
        return apiKey.userId;
      }
    }

    return null;
  }

  private generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

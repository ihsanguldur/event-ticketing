import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { authConfig } from '../config/auth.config.js';
import { RefreshToken } from './entities/refresh-token.entity.js';

@Injectable()
export class RefreshTokensService {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(authConfig.KEY)
    private readonly auth: ConfigType<typeof authConfig>,
  ) {}

  async issue(
    userId: string,
    familyId: string = randomUUID(),
    manager: EntityManager = this.dataSource.manager,
  ): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    const repo = manager.getRepository(RefreshToken);
    await repo.save(
      repo.create({
        tokenHash: this.hash(token),
        userId,
        familyId,
        expiresAt: new Date(Date.now() + this.auth.refreshTtl * 1000),
      }),
    );
    return token;
  }

  async rotate(
    token: string,
  ): Promise<{ userId: string; refreshToken: string }> {
    // Throwing inside the transaction would roll back the family revocation,
    // so failures return null and the 401 is thrown after commit.
    const result = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RefreshToken);
      const current = await repo.findOne({
        where: { tokenHash: this.hash(token) },
        lock: { mode: 'pessimistic_write' },
      });

      if (!current || current.revokedAt || current.expiresAt <= new Date()) {
        return null;
      }

      if (current.usedAt) {
        await this.revokeFamily(current.familyId, manager);
        return null;
      }

      current.usedAt = new Date();
      await repo.save(current);
      const refreshToken = await this.issue(
        current.userId,
        current.familyId,
        manager,
      );
      return { userId: current.userId, refreshToken };
    });

    if (!result) {
      throw new UnauthorizedException('invalid refresh token');
    }
    return result;
  }

  async revoke(token: string): Promise<void> {
    const current = await this.dataSource
      .getRepository(RefreshToken)
      .findOneBy({ tokenHash: this.hash(token) });
    if (current) {
      await this.revokeFamily(current.familyId);
    }
  }

  private async revokeFamily(
    familyId: string,
    manager: EntityManager = this.dataSource.manager,
  ): Promise<void> {
    await manager
      .getRepository(RefreshToken)
      .update({ familyId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

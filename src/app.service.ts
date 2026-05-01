import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'This is my first NestJS application!';
  }

  async testDatabaseConnection() {
    const result = await this.dataSource.query('SELECT NOW() as now');
    return {
      connected: true,
      serverTime: result[0]?.now ?? null,
    };
  }
}

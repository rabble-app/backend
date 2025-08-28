import path from 'node:path';
import type { PrismaConfig } from 'prisma';
import { config } from 'dotenv';

config({ path: '.env' });

export default {
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: `ts-node --compiler-options {"module":"CommonJS"} ${path.join(
      'prisma',
      'seed.ts',
    )}`,
  },
  views: {
    path: path.join('prisma', 'views'),
  },
  typedSql: {
    path: path.join('prisma', 'queries'),
  },
  experimental: {
    studio: true,
  },
} satisfies PrismaConfig;

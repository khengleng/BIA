import { Prisma } from '@prisma/client';

const MISSING_SCHEMA_PATTERNS = [
  'does not exist in the current database',
  'the table',
  'invalid `prisma.',
  'unknown field',
  'column'
];

export function isMissingSchemaError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2021: table does not exist, P2022: column does not exist
    if (error.code === 'P2021' || error.code === 'P2022') {
      return true;
    }
  }

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return MISSING_SCHEMA_PATTERNS.some((pattern) => message.includes(pattern));
}

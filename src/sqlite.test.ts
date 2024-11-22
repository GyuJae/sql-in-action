import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { describe, expect, test } from 'vitest';

describe('Data Definition Language', () => {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite);

  test('', () => {
    console.log(db);
    expect(2).toBe(2);
  });
});

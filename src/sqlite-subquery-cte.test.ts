import { movies } from 'drizzle/schema';
import { gt, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { describe, expect, test } from 'vitest';

describe('Subqueries and CTEs', () => {
  const db = drizzle('movies.db');

  /**
   * SELECT * FROM movies WHERE rating > (SELECT AVG(rating) FROM movies);
   */
  test('Independent Subqueries: 전체 영화들 중, 평점이 평균보다 높은 영화의 리스트', async () => {
    const result = await db
      .select()
      .from(movies)
      .where(gt(movies.rating, sql<number>`(SELECT AVG(rating) FROM movies)`));

    expect(result.length).toBe(99_501);
  });
});

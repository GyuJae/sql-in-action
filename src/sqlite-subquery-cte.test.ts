import { movies } from 'drizzle/schema';
import { gt, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { describe, expect, test } from 'vitest';

describe('Subqueries and CTEs', () => {
  const db = drizzle('movies.db');

  /**
   * SELECT * FROM movies WHERE rating > (SELECT AVG(rating) FROM movies);
   */
  // https://orm.drizzle.team/docs/select#select-from-subquery
  test('Independent Subqueries: 전체 영화들 중, 평점이 평균보다 높은 영화의 리스트', async () => {
    const result = await db
      .select()
      .from(movies)
      .where(gt(movies.rating, sql<number>`(SELECT AVG(rating) FROM movies)`));

    expect(result.length).toBe(99_501);
  });

  /*
    WITH avg_revenue AS (
        SELECT AVG(revenue) AS value FROM movies
    )
    SELECT 
        movies.title,
        movies.director,
        movies.revenue,
        (SELECT value FROM avg_revenue) AS avgRevenue
    FROM movies
    WHERE movies.revenue > (SELECT value FROM avg_revenue);
   */
  // https://orm.drizzle.team/docs/update#with-update-clause
  test('CTEs(Common Table Expression)', async () => {
    const avgRevenue = db.$with('avg_revenue').as(
      db
        .select({
          value: sql<number>`AVG(revenue)`.as('value'),
        })
        .from(movies),
    );

    const result = await db
      .with(avgRevenue)
      .select({
        title: movies.title,
        director: movies.director,
        revenue: movies.revenue,
        avgRevenue: sql<number>`(SELECT value FROM avg_revenue)`,
      })
      .from(movies)
      .where(gt(movies.revenue, sql<number>`(SELECT value FROM avg_revenue)`));

    expect(result.length).toBe(2761);
  });
});

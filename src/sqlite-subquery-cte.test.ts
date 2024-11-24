import { movies } from 'drizzle/schema';
import { eq, gt, sql } from 'drizzle-orm';
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

  /*
  SELECT 
    main.title,
    main.director,
    main.rating
  FROM movies as main
  WHERE main.rating > (
    SELECT AVG(sub.rating) 
    FROM movies as sub 
    WHERE sub.year = main.year
  );
  --- 엄청 느림;;
   */
  test('Correlated Subqueries: 같은 해에 개봉된 영화의 평균 평점보다 높은 평점을 가진 영화 조회', async () => {
    const avgRatingByYear = db.$with('avg_rating_by_year').as(
      db
        .select({
          year: movies.releaseDate,
          avgRating: sql<number>`AVG(rating)`.as('avg_rating'),
        })
        .from(movies)
        .groupBy(movies.releaseDate),
    );

    const result = await db
      .with(avgRatingByYear)
      .select({
        title: movies.title,
        director: movies.director,
        rating: movies.rating,
        releaseDate: movies.releaseDate,
      })
      .from(movies)
      .innerJoin(avgRatingByYear, eq(movies.releaseDate, avgRatingByYear.year))
      .where(gt(movies.rating, avgRatingByYear.avgRating));

    expect(result.length).toBe(99_575);
  });
});

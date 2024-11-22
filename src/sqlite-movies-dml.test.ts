import { movies } from 'drizzle/schema';
import { and, desc, eq, gt, gte, inArray, isNotNull, isNull, like, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { describe, expect, test } from 'vitest';

// www.sqlite.org/lang_aggfunc.html
// https://www.sqlitetutorial.net/sqlite-case

describe('Data Manipulation Language With SQLite', () => {
  const db = drizzle('movies.db');

  test('준비된 영화데이터와 연결이 가능합니다.', async () => {
    const result = await db.select().from(movies).limit(10);
    expect(result).toHaveLength(10);
  });

  // https://orm.drizzle.team/docs/operators
  test('Where Clause', async () => {
    expect(await db.select().from(movies).where(eq(movies.director, 'Guy Ritchie'))).toHaveLength(10);
    expect(await db.select().from(movies).where(gt(movies.releaseDate, 2023))).toHaveLength(20);
    expect(await db.select().from(movies).where(isNull(movies.releaseDate))).toHaveLength(6666);
    expect(
      await db
        .select()
        .from(movies)
        .where(and(isNotNull(movies.releaseDate), eq(movies.director, 'Guy Ritchie'))),
    ).toHaveLength(10);

    expect(
      await db
        .select()
        .from(movies)
        .where(inArray(movies.genres, ['Documentary'])),
    ).toHaveLength(25_400);
    expect(await db.select().from(movies).where(like(movies.title, 'The%'))).toHaveLength(38_571);
  });

  test('Select case', async () => {
    const result = await db
      .select({
        rating: movies.rating,
        mark: sql`
        CASE
          WHEN rating > 8 THEN 'A'
          WHEN rating > 6 THEN 'B'
          ELSE 'C'
        END
      `,
      })
      .from(movies)
      .limit(10);

    expect(result).toEqual([
      { rating: 7.101, mark: 'B' },
      { rating: 7.302, mark: 'B' },
      { rating: 5.831, mark: 'C' },
      { rating: 6.5, mark: 'B' },
      { rating: 7.3, mark: 'B' },
      { rating: 7.1, mark: 'B' },
      { rating: 8.204, mark: 'A' },
      { rating: 7.823, mark: 'B' },
      { rating: 8.476, mark: 'A' },
      { rating: 8.019, mark: 'A' },
    ]);
  });

  test('ORDER BY Clause', async () => {
    const result = await db
      .select({
        revenue: movies.revenue,
      })
      .from(movies)
      .orderBy(desc(movies.revenue))
      .limit(10);
    expect(result).toEqual([
      { revenue: 2_923_706_026 },
      { revenue: 2_799_439_100 },
      { revenue: 2_320_250_281 },
      { revenue: 2_264_162_353 },
      { revenue: 2_068_223_624 },
      { revenue: 2_052_415_039 },
      { revenue: 1_671_537_444 },
      { revenue: 1_518_815_515 },
      { revenue: 1_515_400_000 },
      { revenue: 1_488_732_821 },
    ]);
  });

  test('LIMIT and OFFSET Clauses', async () => {
    const result = await db.select({ id: movies.movieId, title: movies.title }).from(movies).limit(10).offset(10);
    expect(result).toEqual([
      { id: 11, title: 'Citizen Kane' },
      { id: 12, title: 'Dancer in the Dark' },
      { id: 13, title: 'The Dark' },
      { id: 14, title: 'The Fifth Element' },
      { id: 15, title: 'Metropolis' },
      { id: 16, title: 'My Life Without Me' },
      { id: 17, title: 'The Endless Summer' },
      {
        id: 18,
        title: 'Pirates of the Caribbean: The Curse of the Black Pearl',
      },
      { id: 19, title: 'Kill Bill: Vol. 1' },
      { id: 20, title: 'Jarhead' },
    ]);
  });

  test('GROUP BY Clause', async () => {
    const result = await db
      .select({
        director: movies.director,
        totalRevenue: sql`SUM(${movies.revenue}) as total_revenue`,
      })
      .from(movies)
      .where(and(isNotNull(movies.revenue), isNotNull(movies.director)))
      .groupBy(movies.director)
      .orderBy(desc(sql`total_revenue`))
      .limit(10);

    expect(result).toEqual([
      { director: 'Steven Spielberg', totalRevenue: 10_331_677_356 },
      { director: 'James Cameron', totalRevenue: 8_775_747_284 },
      { director: 'Anthony Russo', totalRevenue: 6_856_698_952 },
      { director: 'Peter Jackson', totalRevenue: 6_540_682_522 },
      { director: 'Michael Bay', totalRevenue: 6_451_761_631 },
      { director: 'David Yates', totalRevenue: 6_396_174_415 },
      { director: 'Christopher Nolan', totalRevenue: 4_777_519_997 },
      { director: 'J.J. Abrams', totalRevenue: 4_655_189_070 },
      { director: 'Ron Howard', totalRevenue: 4_357_934_343 },
      { director: 'Tim Burton', totalRevenue: 4_316_986_853 },
    ]);
  });

  test('GROUP BY Gotchas', async () => {
    const notUsedGroupBy = await db
      .select({
        releaseDate: movies.releaseDate,
        avgRating: sql<number>`AVG(${movies.rating}) as avg_rating`,
      })
      .from(movies)
      .where(and(isNotNull(movies.releaseDate), isNotNull(movies.rating)));

    expect(notUsedGroupBy).toHaveLength(1);

    const existSelectNotInGroupBy = await db
      .select({
        title: movies.title,
        releaseDate: movies.releaseDate,
        avgRating: sql<number>`ROUND(AVG(${movies.rating}), 2) as avg_rating`,
      })
      .from(movies)
      .where(and(isNotNull(movies.releaseDate), isNotNull(movies.rating)))
      .groupBy(movies.releaseDate)
      .orderBy(desc(movies.releaseDate))
      .limit(10);

    expect(existSelectNotInGroupBy).toEqual([
      {
        title: 'The Atrocity Exhibition',
        releaseDate: 2024,
        avgRating: 7.21,
      },
      { title: 'The Laureate', releaseDate: 2023, avgRating: 6.1 },
      {
        title: 'Billy Joel - Live at Yankee Stadium',
        releaseDate: 2022,
        avgRating: 6.15,
      },
      { title: 'Mixtape', releaseDate: 2021, avgRating: 6 },
      { title: 'Grizzly II: Revenge', releaseDate: 2020, avgRating: 5.94 },
      { title: 'The Break-up Artist', releaseDate: 2019, avgRating: 6.11 },
      { title: 'Krystal', releaseDate: 2018, avgRating: 5.97 },
      { title: 'Rings', releaseDate: 2017, avgRating: 6.02 },
      { title: 'Aa Anthastulo', releaseDate: 2016, avgRating: 5.98 },
      { title: 'Our Brand Is Crisis', releaseDate: 2015, avgRating: 6.01 },
    ]);
  });

  test('HAVING Clause', async () => {
    const result = await db
      .select({
        director: movies.director,
        totalRevenue: sql`SUM(${movies.revenue}) as total_revenue`,
      })
      .from(movies)
      .where(isNotNull(movies.revenue))
      .groupBy(movies.director)
      .having(gt(sql`total_revenue`, 10_000_000_000))
      .orderBy(desc(sql`total_revenue`));

    expect(result).toEqual([{ director: 'Steven Spielberg', totalRevenue: 10_331_677_356 }]);
  });

  test('각 감독의 평균 rating은 얼마인가?', async () => {
    const result = await db
      .select({
        director: movies.director,
        avgRating: sql<number>`ROUND(AVG(${movies.rating}), 2) as avg_rating`,
      })
      .from(movies)
      .where(and(isNotNull(movies.director), isNotNull(movies.rating)))
      .groupBy(movies.director)
      .orderBy(desc(sql`avg_rating`))
      .limit(10);

    expect(result).toEqual([
      { director: 'عبدالأمير مطر', avgRating: 10 },
      { director: 'randy williams', avgRating: 10 },
      { director: 'nicolas poucalow', avgRating: 10 },
      { director: 'Zoltán Török', avgRating: 10 },
      { director: 'Zijian Mu', avgRating: 10 },
      { director: 'Zakia Tahiri', avgRating: 10 },
      { director: 'Zac Mayo', avgRating: 10 },
      { director: 'Z. Lokman', avgRating: 10 },
      { director: 'Yuthana Duanjaem', avgRating: 10 },
      { director: 'Yurii Skyrda', avgRating: 10 },
    ]);
  });

  test('5편 초과의 영화를 가진 각 감독의 평균 평점', async () => {
    const result = await db
      .select({
        director: movies.director,
        avgRating: sql<number>`ROUND(AVG(${movies.rating}), 2) as avg_rating`,
      })
      .from(movies)
      .where(and(isNotNull(movies.director), isNotNull(movies.rating)))
      .groupBy(movies.director)
      .having(gt(sql`COUNT(*)`, 5))
      .orderBy(desc(sql`avg_rating`))
      .limit(10);

    expect(result).toEqual([
      { director: 'Craig Leathers', avgRating: 9.86 },
      { director: 'Filip Ghiorghi', avgRating: 9.56 },
      { director: 'Hossein Shahabi', avgRating: 9.48 },
      { director: 'David Mitton', avgRating: 9.47 },
      { director: 'Ivan Monti', avgRating: 9.08 },
      { director: 'Jeff Keen', avgRating: 8.61 },
      { director: 'Peter Rose', avgRating: 8.59 },
      { director: 'Alex Coletti', avgRating: 8.53 },
      { director: 'Ahmed Rachedi', avgRating: 8.53 },
      { director: 'Joana Mazzucchelli', avgRating: 8.48 },
    ]);
  });

  test('각 장르의 몇편의 영화가 있나요?', async () => {
    const result = await db
      .select({
        genres: movies.genres,
        count: sql`COUNT(*) as total_count`,
      })
      .from(movies)
      .where(isNotNull(movies.genres))
      .groupBy(movies.genres)
      .orderBy(desc(sql`total_count`))
      .limit(10);

    expect(result).toEqual([
      { genres: 'Drama', count: 30_286 },
      { genres: 'Documentary', count: 25_400 },
      { genres: 'Comedy', count: 22_231 },
      { genres: 'Music', count: 8161 },
      { genres: 'Animation', count: 7479 },
      { genres: 'Horror', count: 4808 },
      { genres: 'Drama,Romance', count: 4512 },
      { genres: 'Comedy,Drama', count: 3851 },
      { genres: 'Comedy,Romance', count: 2914 },
      { genres: 'Action', count: 2673 },
    ]);
  });

  test('평점이 6점 보다 높은 영화는 몇편인가요? 그리고 가장 흔한 평점은 무엇인가요?', async () => {
    const result = await db
      .select({
        rating: movies.rating,
        totalMovies: sql`COUNT(*) as total_movies`,
      })
      .from(movies)
      .where(gt(movies.rating, 6))
      .groupBy(movies.rating)
      .orderBy(desc(sql`total_movies`))
      .limit(1);

    expect(result).toEqual([{ rating: 7, totalMovies: 8124 }]);
  });

  test('각 년도의 개봉된 영화의 수', async () => {
    const result = await db
      .select({
        releaseDate: movies.releaseDate,
        totalMovies: sql`COUNT(*) as total_movies`,
      })
      .from(movies)
      .where(isNotNull(movies.releaseDate))
      .groupBy(movies.releaseDate)
      .orderBy(desc(sql`total_movies`))
      .limit(10);

    expect(result).toEqual([
      { releaseDate: 2014, totalMovies: 12_495 },
      { releaseDate: 2013, totalMovies: 11_893 },
      { releaseDate: 2012, totalMovies: 10_671 },
      { releaseDate: 2015, totalMovies: 10_571 },
      { releaseDate: 2011, totalMovies: 9878 },
      { releaseDate: 2010, totalMovies: 8957 },
      { releaseDate: 2009, totalMovies: 8703 },
      { releaseDate: 2008, totalMovies: 8193 },
      { releaseDate: 2007, totalMovies: 7720 },
      { releaseDate: 2006, totalMovies: 7431 },
    ]);
  });

  test('평균 영화 상영 시간이 가장 높은 최신 10년', async () => {
    const result = await db
      .select({
        releaseDate: movies.releaseDate,
        avgRuntime: sql`AVG(${movies.runtime}) as avg_runtime`,
      })
      .from(movies)
      .where(and(isNotNull(movies.runtime), isNotNull(movies.releaseDate)))
      .groupBy(movies.releaseDate)
      .orderBy(desc(sql`avg_runtime`))
      .having(gt(movies.releaseDate, 2010))
      .limit(10);

    expect(result).toEqual([
      { releaseDate: 2022, avgRuntime: 106.733_333_333_333_33 },
      { releaseDate: 2019, avgRuntime: 104.927_083_333_333_33 },
      { releaseDate: 2017, avgRuntime: 98.341_924_398_625_42 },
      { releaseDate: 2018, avgRuntime: 97.441_558_441_558_44 },
      { releaseDate: 2023, avgRuntime: 95.275_862_068_965_52 },
      { releaseDate: 2021, avgRuntime: 92.828_571_428_571_42 },
      { releaseDate: 2020, avgRuntime: 89.604_651_162_790_7 },
      { releaseDate: 2024, avgRuntime: 87.090_909_090_909_1 },
      { releaseDate: 2016, avgRuntime: 87.074_175_824_175_82 },
      { releaseDate: 2025, avgRuntime: 86 },
    ]);
  });

  test('21세기에 개봉한 영화의 평균 평점', async () => {
    const result = await db
      .select({
        releaseDate: movies.releaseDate,
        avgRating: sql<number>`ROUND(AVG(${movies.rating}), 2) as avg_rating`,
      })
      .from(movies)
      .where(and(isNotNull(movies.rating), gt(movies.releaseDate, 2000)))
      .groupBy(movies.releaseDate)
      .orderBy(desc(movies.releaseDate));

    expect(result).toEqual([
      { releaseDate: 2024, avgRating: 7.21 },
      { releaseDate: 2023, avgRating: 6.1 },
      { releaseDate: 2022, avgRating: 6.15 },
      { releaseDate: 2021, avgRating: 6 },
      { releaseDate: 2020, avgRating: 5.94 },
      { releaseDate: 2019, avgRating: 6.11 },
      { releaseDate: 2018, avgRating: 5.97 },
      { releaseDate: 2017, avgRating: 6.02 },
      { releaseDate: 2016, avgRating: 5.98 },
      { releaseDate: 2015, avgRating: 6.01 },
      { releaseDate: 2014, avgRating: 5.93 },
      { releaseDate: 2013, avgRating: 5.89 },
      { releaseDate: 2012, avgRating: 5.9 },
      { releaseDate: 2011, avgRating: 5.83 },
      { releaseDate: 2010, avgRating: 5.81 },
      { releaseDate: 2009, avgRating: 5.71 },
      { releaseDate: 2008, avgRating: 5.72 },
      { releaseDate: 2007, avgRating: 5.74 },
      { releaseDate: 2006, avgRating: 5.79 },
      { releaseDate: 2005, avgRating: 5.77 },
      { releaseDate: 2004, avgRating: 5.81 },
      { releaseDate: 2003, avgRating: 5.77 },
      { releaseDate: 2002, avgRating: 5.71 },
      { releaseDate: 2001, avgRating: 5.69 },
    ]);
  });

  test('평균 영화 상영 시간이 가장 긴 감독', async () => {
    const result = await db
      .select({
        avgRuntime: sql`AVG(${movies.runtime}) as avg_runtime`,
        director: movies.director,
      })
      .from(movies)
      .where(isNotNull(movies.runtime))
      .groupBy(movies.director)
      .orderBy(desc(sql`avg_runtime`))
      .limit(1)
      .get();

    expect(result).toEqual({ avgRuntime: 14_400, director: 'Bjornstjerne Reuter Christiansen' });
  });

  test('가장 많은 영화를 작업한 다작 감독 상위 5명', async () => {
    const result = await db
      .select({
        director: movies.director,
        count: sql`COUNT(*) as total_movies`,
      })
      .from(movies)
      .where(isNotNull(movies.director))
      .groupBy(movies.director)
      .orderBy(desc(sql`total_movies`))
      .limit(5);

    expect(result).toEqual([
      { director: 'Dave Fleischer', count: 435 },
      { director: 'Kevin Dunn', count: 308 },
      { director: 'Friz Freleng', count: 289 },
      { director: 'Chuck Jones', count: 272 },
      { director: 'Seymour Kneitel', count: 241 },
    ]);
  });

  test('각 감독의 최고 평점과 최저 평점', async () => {
    const result = await db
      .select({
        director: movies.director,
        maxRating: sql<number>`MAX(${movies.rating}) as max_rating`,
        minRating: sql<number>`MIN(${movies.rating}) as min_rating`,
      })
      .from(movies)
      .where(and(isNotNull(movies.director), isNotNull(movies.rating)))
      .groupBy(movies.director)
      .having(gt(sql`COUNT(*)`, 5))
      .orderBy(desc(sql`max_rating`))
      .limit(10);

    expect(result).toEqual([
      { director: 'Žorž Skrigin', maxRating: 10, minRating: 5 },
      { director: 'Zdeněk Miler', maxRating: 10, minRating: 5 },
      { director: 'Yuri Prytkov', maxRating: 10, minRating: 4 },
      { director: 'Yun-ho Yang', maxRating: 10, minRating: 5 },
      { director: 'Yamina Benguigui', maxRating: 10, minRating: 5 },
      { director: 'Wong Jing', maxRating: 10, minRating: 3 },
      { director: 'Wolfgang Spier', maxRating: 10, minRating: 0.5 },
      { director: 'Wolfgang Schleif', maxRating: 10, minRating: 1 },
      { director: 'William Klein', maxRating: 10, minRating: 4.4 },
      { director: 'William Friedkin', maxRating: 10, minRating: 1 },
    ]);
  });

  test('돈을 가장 많이 번 감독 (수익에서 예산을 뺀 금액 계산)', async () => {
    const result = await db
      .select({
        director: movies.director,
        totalProfit: sql`SUM(${movies.revenue} - ${movies.budget}) as total_profit`,
      })
      .from(movies)
      .where(and(isNotNull(movies.revenue), isNotNull(movies.budget), isNotNull(movies.director)))
      .groupBy(movies.director)
      .orderBy(desc(sql`total_profit`))
      .limit(1)
      .get();

    expect(result).toEqual({ director: 'Steven Spielberg', totalProfit: 8_430_177_356 });
  });

  test('2시간 이상인 영화들의 평균 평점', async () => {
    const result = await db
      .select({
        avgRating: sql<number>`ROUND(AVG(${movies.rating}), 2) as avg_rating`,
      })
      .from(movies)
      .where(gte(movies.runtime, 120))
      .get();

    expect(result).toEqual({ avgRating: 6.32 });
  });

  test('가장 많은 영화가 개봉된 년도', async () => {
    const result = await db
      .select({
        releaseDate: movies.releaseDate,
        totalMovies: sql`COUNT(*) as total_movies`,
      })
      .from(movies)
      .where(isNotNull(movies.releaseDate))
      .groupBy(movies.releaseDate)
      .orderBy(desc(sql`total_movies`))
      .limit(1)
      .get();

    expect(result).toEqual({ releaseDate: 2014, totalMovies: 12_495 });
  });

  test('각 10년동안 평균 영화 상영 시간 (ex: 1990, 1980, ...)', async () => {
    const result = await db
      .select({
        decade: sql`FLOOR(${movies.releaseDate} / 10) * 10 as decade`,
        avgRuntime: sql`AVG(${movies.runtime}) as avg_runtime`,
      })
      .from(movies)
      .where(and(isNotNull(movies.runtime), isNotNull(movies.releaseDate)))
      .groupBy(sql`decade`)
      .orderBy(sql`decade`);

    expect(result).toEqual([
      { decade: 1870, avgRuntime: 1 },
      { decade: 1880, avgRuntime: 1 },
      { decade: 1890, avgRuntime: 1.237_696_335_078_534 },
      { decade: 1900, avgRuntime: 5.073_242_764_323_686 },
      { decade: 1910, avgRuntime: 33.012_142_857_142_855 },
      { decade: 1920, avgRuntime: 55.309_494_826_536_82 },
      { decade: 1930, avgRuntime: 58.398_808_257_075_97 },
      { decade: 1940, avgRuntime: 64.865_258_384_055_38 },
      { decade: 1950, avgRuntime: 75.289_588_884_659_31 },
      { decade: 1960, avgRuntime: 78.316_751_124_116_76 },
      { decade: 1970, avgRuntime: 84.319_211_651_832_16 },
      { decade: 1980, avgRuntime: 88.577_203_818_079_72 },
      { decade: 1990, avgRuntime: 88.728_174_440_527_91 },
      { decade: 2000, avgRuntime: 86.968_783_277_460_06 },
      { decade: 2010, avgRuntime: 80.051_345_429_047_25 },
      { decade: 2020, avgRuntime: 94.704_697_986_577_19 },
    ]);
  });

  test('영화의 최고 평점과 최저 평점 차이가 가장 큰 상위 5개 연도', async () => {
    const result = await db
      .select({
        releaseDate: movies.releaseDate,
        diffRating: sql<number>`MAX(${movies.rating}) - MIN(${movies.rating}) as diff_rating`,
      })
      .from(movies)
      .where(and(isNotNull(movies.rating), isNotNull(movies.releaseDate)))
      .groupBy(movies.releaseDate)
      .orderBy(desc(sql`diff_rating`))
      .limit(5);

    expect(result).toEqual([
      { releaseDate: 2016, diffRating: 9.5 },
      { releaseDate: 2015, diffRating: 9.5 },
      { releaseDate: 2014, diffRating: 9.5 },
      { releaseDate: 2013, diffRating: 9.5 },
      { releaseDate: 2012, diffRating: 9.5 },
    ]);
  });

  test('2시간 미만의 영화를 만들어 본 적이 한 번도 없는 감독', async () => {
    const result = await db
      .select({
        director: movies.director,
      })
      .from(movies)
      .groupBy(movies.director)
      .having(sql`MIN(${movies.runtime}) >= 120`)
      .limit(10);

    expect(result).toEqual([
      { director: 'A K Sajan' },
      { director: 'A S Ravikumar Chowdhary' },
      { director: 'A V Seshagiri Rao' },
      { director: 'A. B. Raj' },
      { director: 'A. Balakrishnan' },
      { director: 'A. Bhimsingh' },
      { director: 'A. C. Tirulokchandar' },
      { director: 'A. G. Amid' },
      { director: 'A. Gokul Krishna' },
      { director: 'A. Harsha' },
    ]);
  });

  test('전체 영화에서 평점이 8.0 이상인 영화의 비율', async () => {
    const result = await db
      .select({
        ratio: sql<number>`COUNT(CASE WHEN ${movies.rating} > 8 THEN 1 END) * 100 / COUNT(*) as ratio`,
      })
      .from(movies)
      .get();

    expect(result).toEqual({ ratio: 3 });
  });

  test('평점이 7.0보다 높은 영화가 차지하는 비율이 가장 높은 감독', async () => {
    const result = await db
      .select({
        director: movies.director,
        ratio: sql<number>`COUNT(CASE WHEN ${movies.rating} > 7 THEN 1 END) * 100 / COUNT(*) as ratio`,
      })
      .from(movies)
      .where(and(isNotNull(movies.director), isNotNull(movies.rating)))
      .groupBy(movies.director)
      .orderBy(desc(sql`ratio`))
      .having(gt(sql`COUNT(*)`, 5))
      .limit(1)
      .get();

    expect(result).toEqual({
      director: 'Vladimir Popov',
      ratio: 100,
    });
  });

  test('길이별로 영화를 분류하고 그룹화하기', async () => {
    const result = await db
      .select({
        runTimeCategory: sql`
          CASE WHEN ${movies.runtime} < 90 THEN 'Short'
          WHEN ${movies.runtime} < 120 THEN 'Medium'
          ELSE 'Long' END as run_time_category
        `,
        totalMovies: sql<number>`COUNT(*) as total_movies`,
      })
      .from(movies)
      .where(isNotNull(movies.runtime))
      .groupBy(sql`run_time_category`);

    expect(result).toEqual([
      { runTimeCategory: 'Long', totalMovies: 22_077 },
      { runTimeCategory: 'Medium', totalMovies: 81_896 },
      { runTimeCategory: 'Short', totalMovies: 118_326 },
    ]);
  });

  test('flop 여부에 따라 영화를 분류 및 그룹화하기', async () => {
    const result = await db
      .select({
        flapOrNot: sql`
        CASE WHEN ${movies.revenue} < ${movies.budget} THEN 'Flop'
        ELSE 'Success' END as flap_or_not
      `,
        totalMovies: sql<number>`COUNT(*) as total_movies`,
      })
      .from(movies)
      .where(and(isNotNull(movies.revenue), isNotNull(movies.budget)))
      .groupBy(sql`flap_or_not`);

    expect(result).toEqual([
      { flapOrNot: 'Flop', totalMovies: 3088 },
      { flapOrNot: 'Success', totalMovies: 7425 },
    ]);
  });
});

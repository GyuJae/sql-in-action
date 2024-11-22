/* eslint-disable @typescript-eslint/ban-ts-comment */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { beforeEach, describe, expect, test } from 'vitest';

describe('Data Definition Language With SQLite', () => {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite, { casing: 'snake_case' });

  beforeEach(() => {
    const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table';").all();

    for (const table of tables) {
      // @ts-ignore
      sqlite.exec(`DROP TABLE IF EXISTS "${table.name}";`);
    }
  });

  test('SQL 테이블 정의에서 제약조건을 설정할 수 있습니다.', async () => {
    // Given
    sqlite.exec(
      `CREATE TABLE movies (
        title TEXT UNIQUE NOT NULL,
        released INTEGER NOT NULL,
        overview TEXT NOT NULL,
        rating REAL NOT NULL,
        director TEXT NOT NULL,
        for_kids INTEGER NOT NULL DEFAULT 0
        ) STRICT;`,
    );

    const movies = sqliteTable('movies', {
      title: t.text().unique().notNull(),
      released: t.integer().notNull(),
      overview: t.text().notNull(),
      rating: t.real().notNull(),
      director: t.text().notNull(),
      for_kids: t.integer().notNull().default(0),
    });

    // When
    // @ts-ignore
    const action = db.insert(movies).values({
      title: 'The Matrix',
      released: 1999,
      overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
      rating: 8.7,
      for_kids: 0,
    });

    // Then
    await expect(action).rejects.toThrow('NOT NULL constraint failed: movies.director');
  });

  test('sqlite에서는 Boolean Type이 없기 때문에 Integer Type으로 대체한다.', async () => {
    // Given
    sqlite.exec(
      `CREATE TABLE movies (
        title TEXT UNIQUE NOT NULL,
        released INTEGER NOT NULL,
        overview TEXT NOT NULL,
        rating REAL NOT NULL,
        director TEXT NOT NULL,
        for_kids INTEGER NOT NULL DEFAULT 0 CHECK(for_kids IN (0, 1))
        ) STRICT;`,
    );

    const movies = sqliteTable('movies', {
      title: t.text().unique().notNull(),
      released: t.integer().notNull(),
      overview: t.text().notNull(),
      rating: t.real().notNull(),
      director: t.text().notNull(),
      for_kids: t.integer().notNull().default(0),
    });

    // When
    const action = db.insert(movies).values({
      title: 'The Matrix',
      released: 1999,
      overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
      rating: 8.7,
      director: 'Lana',
      for_kids: 2,
    });

    // Then
    await expect(action).rejects.toThrow('CHECK constraint failed: for_kids IN (0, 1)');
  });

  test("sqlite에서 Between 연산자는 시작값과 끝값을 포함한다. 'x BETWEEN y AND z'는 'x >= y AND x <= z'와 동일하다.", async () => {
    // Given
    sqlite.exec(
      `CREATE TABLE movies (
        title TEXT UNIQUE NOT NULL,
        released INTEGER NOT NULL,
        overview TEXT NOT NULL,
        rating REAL NOT NULL CHECK(rating BETWEEN 0 AND 10),
        director TEXT NOT NULL,
        for_kids INTEGER NOT NULL DEFAULT 0 CHECK(for_kids IN (0, 1))
        ) STRICT;`,
    );

    const movies = sqliteTable('movies', {
      title: t.text().unique().notNull(),
      released: t.integer().notNull(),
      overview: t.text().notNull(),
      rating: t.real().notNull(),
      director: t.text().notNull(),
      for_kids: t.integer().notNull().default(0),
    });

    // When
    const action = db.insert(movies).values({
      title: 'The Matrix',
      released: 1999,
      overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
      rating: 11,
      director: 'Lana',
      for_kids: 1,
    });

    // Then
    await expect(action).rejects.toThrow('CHECK constraint failed: rating BETWEEN 0 AND 10');
  });

  //sqlite.org/lang_corefunc.html
  test('sqlite 내장 함수를 이용해서 제약 조건을 설정할 수 있습니다.', async () => {
    sqlite.exec(
      `CREATE TABLE movies (
        title TEXT UNIQUE NOT NULL,
        released INTEGER NOT NULL,
        overview TEXT NOT NULL CHECK(length(overview) < 10),
        rating REAL NOT NULL CHECK(rating BETWEEN 0 AND 10),
        director TEXT NOT NULL,
        for_kids INTEGER NOT NULL DEFAULT 0 CHECK(for_kids IN (0, 1))
        ) STRICT;`,
    );

    const movies = sqliteTable('movies', {
      title: t.text().unique().notNull(),
      released: t.integer().notNull(),
      overview: t.text().notNull(),
      rating: t.real().notNull(),
      director: t.text().notNull(),
      for_kids: t.integer().notNull().default(0),
    });

    // When
    const action = db.insert(movies).values({
      title: 'The Matrix',
      released: 1999,
      overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
      rating: 8.7,
      director: 'Lana',
      for_kids: 1,
    });

    // Then
    await expect(action).rejects.toThrow('CHECK constraint failed: length(overview) < 10');
  });

  test('sqlite PRIMARY KEY AUTOINCREMENT', async () => {
    sqlite.exec(
      `CREATE TABLE movies (
        movie_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        released INTEGER NOT NULL,
        overview TEXT NOT NULL,
        rating REAL NOT NULL CHECK(rating BETWEEN 0 AND 10),
        director TEXT NOT NULL,
        for_kids INTEGER NOT NULL DEFAULT 0 CHECK(for_kids IN (0, 1))
        ) STRICT;`,
    );

    const movies = sqliteTable('movies', {
      movie_id: t.integer('movie_id').primaryKey({ autoIncrement: true }),
      title: t.text().unique().notNull(),
      released: t.integer().notNull(),
      overview: t.text().notNull(),
      rating: t.real().notNull(),
      director: t.text().notNull(),
      for_kids: t.integer().notNull().default(0),
    });

    // When
    await db.insert(movies).values({
      title: 'The Matrix',
      released: 1999,
      overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
      rating: 8.7,
      director: 'Lana',
      for_kids: 1,
    });
    await db.insert(movies).values({
      title: 'The Matrix',
      released: 1999,
      overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
      rating: 8.7,
      director: 'Lana',
      for_kids: 1,
    });

    // Then
    const result = db
      .select({
        movie_id: movies.movie_id,
      })
      .from(movies)
      .all();

    expect(result).toEqual([{ movie_id: 1 }, { movie_id: 2 }]);
  });
});

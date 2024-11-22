/* eslint-disable @typescript-eslint/ban-ts-comment */
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import { beforeEach, describe, expect, test } from 'vitest';

describe('Data Manipulation Language With SQLite', () => {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite, { casing: 'snake_case' });

  beforeEach(() => {
    const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';").all();

    for (const table of tables) {
      // @ts-ignore
      sqlite.exec(`DROP TABLE IF EXISTS "${table.name}";`);
    }
  });

  test('Update Comments', async () => {
    // Given
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

    await db.insert(movies).values({
      title: 'The Matrix',
      released: 1999,
      overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
      rating: 8.7,
      director: 'Lana Wachowski',
    });
    await db.insert(movies).values({
      title: 'Lion King',
      released: 1984,
      overview: 'A young lion prince runs away from his family only to learn the true meaning of responsibility and bravery.',
      rating: 9.9,
      director: 'Roger Allers',
    });

    // When
    await db.update(movies).set({ rating: 10.0 }).where(eq(movies.title, 'The Matrix'));

    // Then
    const movie = await db.select({ rating: movies.rating }).from(movies).where(eq(movies.title, 'The Matrix')).get();

    expect(movie).toEqual({ rating: 10.0 });
  });

  test('Select은 table을 리턴하며, Select 명령어보다 From 명령어가 먼저 실행됩니다.', async () => {
    // Given
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

    const moviesTable = sqliteTable('movies', {
      movie_id: t.integer('movie_id').primaryKey({ autoIncrement: true }),
      title: t.text().unique().notNull(),
      released: t.integer().notNull(),
      overview: t.text().notNull(),
      rating: t.real().notNull(),
      director: t.text().notNull(),
      for_kids: t.integer().notNull().default(0),
    });

    await db.insert(moviesTable).values({
      title: 'The Matrix',
      released: 1999,
      overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
      rating: 8.7,
      director: 'Lana Wachowski',
    });
    await db.insert(moviesTable).values({
      title: 'Lion King',
      released: 1984,
      overview: 'A young lion prince runs away from his family only to learn the true meaning of responsibility and bravery.',
      rating: 9.9,
      director: 'Roger Allers',
    });

    // When
    const movies = await db
      .select({ title: moviesTable.title, rating: moviesTable.rating, director: moviesTable.director })
      .from(moviesTable)
      .all();

    // Then
    expect(movies).toEqual([
      { title: 'The Matrix', rating: 8.7, director: 'Lana Wachowski' },
      {
        title: 'Lion King',
        rating: 9.9,
        director: 'Roger Allers',
      },
    ]);
  });
});

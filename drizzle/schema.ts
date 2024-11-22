import { sql } from 'drizzle-orm';
import { sqliteTable, AnySQLiteColumn, integer, text, real } from 'drizzle-orm/sqlite-core';

export const movies = sqliteTable('movies', {
  movieId: integer('movie_id').primaryKey(),
  title: text(),
  originalTitle: text('original_title'),
  originalLanguage: text('original_language'),
  overview: text(),
  releaseDate: integer('release_date'),
  revenue: integer(),
  budget: integer(),
  homepage: text(),
  runtime: integer(),
  rating: real(),
  status: text(),
  country: text(),
  genres: text(),
  director: text(),
  spokenLanguages: text('spoken_languages'),
});

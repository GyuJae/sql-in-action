# Subqueries and CTEs

## Independent Subqueries

```sql
---전체 영화들 중 평점이나 수익이 평균보다 높은 영화의 리스트 조회
SELECT
    COUNT(*)
from
    movies
WHERE
    rating > (
        SELECT
            AVG(rating)
        FROM
            movies
    );
```

## CTEs (Common Table Expressions)

```sql
WITH avg_revenue_cte AS (
    SELECT
        AVG(revenue) as avg_revenue
    FROM
        movies
)
SELECT
    title,
    director,
    revenue,
    (
        SELECT
            *
        FROM
            avg_revenue_cte
    ) as avg_revenue
from
    movies
WHERE
    revenue > (
        SELECT
            *
        FROM
            avg_revenue_cte
    );
```

### Corrlated Subqueries

```sql
-- 같은 해에 개봉된 영화의 평균 평점보다 높은 평점을 가진 영화를 찾는 쿼리
WITH movie_avg_per_year AS(
    SELECT
        AVG(inner_movies.rating)
    FROM
        movies AS inner_movies
    WHERE
        inner_movies.release_date = main_movies.release_date
)
SELECT
    main_movies.title,
    main_movies.director,
    main_movies.rating,
    main_movies.release_date,
    (
        SELECT
            *
        FROM
            movie_avg_per_year
    ) AS year_average
FROM
    movies AS main_movies
WHERE
    main_movies.release_date > 2022
    AND main_movies.rating > (
        SELECT
            *
        FROM
            movie_avg_per_year
    );
```

```sql
--  감독의 career revenue가 평균 보다 높은 감독을 찾는 쿼리
```

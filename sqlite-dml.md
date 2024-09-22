# Sqlite - Data Manipulation Language (DML)

### Inserting Data

```sql
INSERT INTO movies (title, rating, released, overview) VALUES (
    'The Shawshank Redemption',
    9.3,
    '1994-10-14',
    'Two imprisoned'
);
```

### Updating Data

[UPDATE](https://www.sqlite.org/lang_update.html)

```sql
UPDATE movies SET rating = 0.5; ----> all rows will be updated

UPDATE movies SET director = 'Frank Darabont' WHERE title = 'The Shawshank Redemption';

UPDATE movies SET director = 'Unkown' WHERE director IS NULL;
```

### Deleting Data

[DELETE](https://www.sqlite.org/lang_delete.html)

```sql
DELETE FROM movies; ----> all rows will be deleted
```

### SELECT

[SELECT](https://www.sqlite.org/lang_select.html)

````sql

sqlite_sequence

table의 결과물을 제공하는 명령어

```sql
SELECT 1+1, 2+2, UPPER('hello');
````

### FROM

```sql
SELECT * FROM movies;
SELECT title, rating, UPPPER(overview) as overview_upper FROM movies;
SELECT * FROM movies WHERE rating > 8.0;
SELECT * FROM movies WHERE rating > 8.0 AND released > '2000-01-01';
SELECT * FROM movies WHERE rating > 8.0 OR released > '2000-01-01';
SELECT * FROM movies WHERE rating BETWEEN 8.0 AND 9.0;
SELECT * FROM movies WHERE rating IN (8.0, 9.0);
SELECT * FROM movies WHERE rating IS NULL;
SELECT * FROM movies WHERE rating IS NOT NULL;
SELECT * FROM movies WHERE title LIKE 'The%';
SELECT * FROM movies WHERE title LIKE '%Redemption';
SELECT * FROM movies WHERE title LIKE '%Redemption%';
SELECT * FROM movies WHERE title LIKE 'The_Shawshank_Redemption';
SELECT * FROM movies WHERE title LIKE 'The\_Shawshank\_Redemption';
SELECT * FROM movies WHERE title GLOB 'The*';
SELECT * FROM movies WHERE title GLOB '*Redemption';
SELECT * FROM movies WHERE title GLOB '*Redemption*';
SELECT * FROM movies WHERE title GLOB 'The?Shawshank?Redemption';
SELECT * FROM movies WHERE title GLOB 'The[!a-z]Shawshank[!a-z]Redemption';
SELECT * FROM movies WHERE title GLOB 'The[!a-z]%';
```

### WHERE

[AND or OR](https://www.tutorialspoint.com/sqlite/sqlite_and_or_clauses.htm)

```sql
SELECT * FROM movies WHERE rating > 8.0;

SELECT * FROM movies WHERE original_language <> 'en';

SELECT * FROM movies WHERE released = NULL; ------- NULL은 비교 연산자로 사용할 수 없다.
SELECT * FROM movies WHERE released IS NULL; ------ NULL은 IS NULL로 비교해야 한다.
SELECT * FROM movies WHERE released IS NOT NULL;

SELECT * FROM movies WHERE rating BETWEEN 8.0 AND 9.0 AND budget > 10000000;
```

### WHERE Predicate

```sql
SELECT * FROM movies WHERE rating IN (8.0, 9.0);
SELECT * FROM movies WHERE rating IS NULL;
SELECT * FROM movies WHERE rating IS NOT NULL;
SELECT * FROM movies WHERE title LIKE 'The%';
SELECT * FROM movies WHERE title LIKE '%Redemption';
SELECT * FROM movies WHERE title LIKE '%Redemption%';
SELECT * FROM movies WHERE title LIKE 'The_Shawshank_Redemption';
SELECT * FROM movies WHERE title LIKE 'The\_Shawshank\_Redemption';
SELECT * FROM movies WHERE title GLOB 'The*';
SELECT * FROM movies WHERE title GLOB '*Redemption';
SELECT * FROM movies WHERE title GLOB '*Redemption*';
SELECT * FROM movies WHERE title GLOB 'The?Shawshank?Redemption';
SELECT * FROM movies WHERE title GLOB 'The[!a-z]Shawshank[!a-z]Redemption';
SELECT * FROM movies WHERE title GLOB 'The[!a-z]%';
```

### SELECT CASE

[SELECT CASE](https://www.sqlitetutorial.net/sqlite-case)

```sql
SELECT
    title,
    CASE
        WHEN rating > 8.0 THEN 'Good'
        WHEN rating > 6.0 THEN 'Average'
        ELSE 'Bad'
    END AS rating_category
FROM movies;
```

### ORDER BY

[ORDER BY](https://www.tutorialspoint.com/sqlite/sqlite_order_by.htm)

```sql
SELECT * FROM movies ORDER BY title;
SELECT * FROM movies ORDER BY title ASC;
SELECT * FROM movies ORDER BY title DESC;
SELECT * FROM movies ORDER BY rating DESC, title ASC;
```

### LIMIT and OFFSET

[LIMIT and OFFSET](https://www.tutorialspoint.com/sqlite/sqlite_limit_clause.htm)

```sql
SELECT * FROM movies LIMIT 5 OFFSET 0 * 5;
```

### GROUP BY

```sql
SELECT ---- 4
    director,
    SUM(revenue) as total_revenue
FROM ---- 1
    movies
WHERE ---- 2
    director IS NOT NULL
    AND revenue IS NOT NULL
GROUP BY ---- 3
    director
ORDER BY  ---- 5
	total_revenue DESC;
```

### View

```sql
CREATE VIEW v_flop_or_not AS
SELECT
    CASE
        WHEN revenue < budget THEN 'Flop'
        ELSE 'SUCCESS'
    END as flop_or_not,
    COUNT(*) as totlal_count
FROM
    movies
WHERE
    budget IS NOT NULL
    AND revenue IS NOT NULL
GROUP BY
    flop_or_not;
```

```sql
SELECT * FROM v_flop_or_not;
```

```sql
DROP VIEW v_flop_or_not;
```

### HAVING

```sql
SELECT
    director,
    SUM(revenue) as total_revenue
FROM
    movies
WHERE
    director IS NOT NULL
    AND revenue IS NOT NULL
GROUP BY
    director
HAVING
    total_revenue > 100000000
ORDER BY
    total_revenue DESC;
```

### GROUP BY Gothchas

1. SELECT 절에서 GROUP BY되지 않은 열 사용
   GROUP BY 절에서 언급되지 않은 열을 SELECT에 사용하면 예기치 않은 결과가 나올 수 있습니다. MySQL과 같은 일부 데이터베이스는 GROUP BY와 호환되지 않는 열을 선택하는 것을 허용하지만, 이 경우 결과가 모호해지거나 일관성이 없어집니다.

```sql
SELECT name, job_title, AVG(salary)
FROM employees
GROUP BY job_title;
```

위 쿼리에서 name은 GROUP BY에 포함되지 않았습니다. SQL 표준에서는 이는 잘못된 구문으로 간주되며, 특정 DBMS에서는 첫 번째 그룹 내 값이 선택될 뿐, 전체적으로 의미 있는 값이 아닙니다.

해결 방법: GROUP BY에 포함되지 않은 열을 집계 함수로 감싸거나 GROUP BY에 추가해야 합니다.

```sql
SELECT job_title, AVG(salary)
FROM employees
GROUP BY job_title;
```

2. 집계 함수와 GROUP BY의 불일치
   GROUP BY와 집계 함수의 결합이 일관되지 않으면 예상치 못한 결과가 나옵니다. 예를 들어, 특정 열이 GROUP BY에 있지 않으면서 집계 함수가 잘못 적용된 경우입니다.

```sql
SELECT job_title, MAX(salary), MIN(salary), AVG(salary)
FROM employees
GROUP BY job_title;
```

이 쿼리는 직무별 최대, 최소, 평균 급여를 계산할 수 있습니다. 하지만 만약 모든 열에 대해 GROUP BY 없이 집계 함수를 적용하려 한다면 오류가 발생할 수 있습니다.

해결 방법: GROUP BY에 모든 열을 추가하거나 집계 함수를 사용하지 않습니다.

3. HAVING과 WHERE의 혼동
   WHERE 절은 그룹핑 이전에 필터링을 적용하고, HAVING 절은 그룹핑 후에 조건을 적용합니다. 두 절을 혼동하면 논리적인 오류가 발생할 수 있습니다.

```sql
SELECT job_title, AVG(salary)
FROM employees
WHERE AVG(salary) > 4000   -- 오류 발생
GROUP BY job_title;
```

위 쿼리에서 WHERE는 그룹핑 전에 조건을 걸기 때문에, 집계 함수인 AVG(salary)는 사용될 수 없습니다. 이 경우 HAVING 절을 사용해야 합니다.

```sql
SELECT job_title, AVG(salary)
FROM employees
GROUP BY job_title
HAVING AVG(salary) > 4000;
```

4. NULL 값 다루기
   GROUP BY는 NULL 값을 하나의 그룹으로 간주합니다. 만약 여러 NULL 값이 있을 경우, 이를 별도의 그룹으로 처리하게 됩니다.

```sql
SELECT department, COUNT(*)
FROM employees
GROUP BY department;
```

만약 department 열에 NULL 값이 있다면, NULL 값들이 별도의 그룹으로 묶여 카운트됩니다. 필요에 따라 WHERE 절에서 NULL을 제외하는 방법을 사용할 수 있습니다.

```sql
SELECT department, COUNT(*)
FROM employees
WHERE department IS NOT NULL
GROUP BY department;
```

5. ORDER BY와 GROUP BY의 혼동
   GROUP BY는 그룹핑을 위한 기능이고, ORDER BY는 결과를 정렬하는 기능입니다. 둘의 역할이 다르기 때문에 GROUP BY에서 자동으로 정렬이 되는 것으로 오해할 수 있습니다.

```sql
SELECT job_title, COUNT(*)
FROM employees
GROUP BY job_title;
```

위 쿼리는 job_title 기준으로 그룹핑은 하지만, 자동으로 정렬되지 않습니다. 정렬을 원할 경우 ORDER BY를 명시해야 합니다.

```sql
SELECT job_title, COUNT(*)
FROM employees
GROUP BY job_title
ORDER BY job_title;
```

6. 집계 함수에서 DISTINCT 사용 주의
   집계 함수에 DISTINCT를 사용하면 중복을 제거한 후 계산하지만, 이를 과도하게 사용하거나 혼동하면 성능 저하 또는 의도와 다른 결과가 나올 수 있습니다.

```sql
SELECT job_title, COUNT(DISTINCT salary)
FROM employees
GROUP BY job_title;
```

이 쿼리는 각 직무별로 중복을 제거한 급여의 개수를 세지만, DISTINCT의 오용이나 과도한 사용은 불필요한 계산을 초래할 수 있습니다.

7. 성능 문제
   GROUP BY는 많은 데이터를 처리하는 경우 성능 저하를 일으킬 수 있습니다. 데이터 양이 많은 테이블에서는 GROUP BY로 인해 쿼리가 느려질 수 있으므로 인덱스를 적절히 사용하여 최적화가 필요합니다.

   인덱스 활용: GROUP BY에 자주 사용하는 열에 인덱스를 생성하면 성능을 향상시킬 수 있습니다.

### SQL Challenge

[Aggregate Functions](https://www.sqlite.org/lang_aggfunc.html)

1. What is the average rating of each director\*?

```sql
SELECT
    director,
    AVG(rating) as avg_rating
FROM
    movies
WHERE
    director IS NOT NULL
    AND rating IS NOT NULL
GROUP BY
    director
ORDER BY
	avg_rating DESC;
```

2. What is the average rating of each director\*?
   --- \* that has more than 5 movies

```sql
SELECT
    director,
    AVG(rating) as avg_rating
FROM
    movies
WHERE
    director IS NOT NULL
    AND rating IS NOT NULL
GROUP BY
    director
HAVING COUNT(*) > 5;
```

3. How many movies are in each genre?

```sql
SELECT
    genres,
    COUNT(*) as total_movies
FROM
    movies
WHERE
    genres IS NOT NULL
GROUP BY
    genres;
```

4. How many movies have a rating grerater than 6? what is most common rating?

```sql
SELECT
    rating,
    COUNT(*) total_movies
FROM
    movies
WHERE
    rating > 6
GROUP BY
    rating
ORDER BY
    total_movies DESC;
```

5. Find the number of movies released each year.

```sql
SELECT
    release_date,
    COUNT(*) total_movies
FROM
    movies
WHERE
    release_date IS NOT NULL
GROUP BY
    release_date;
```

6. List the top 10 years with the highest average movie rating.

```sql
SELECT
    release_date,
    AVG(runtime) as avg_runtime
FROM
    movies
WHERE
    runtime is not NULL
GROUP BY
    release_date
ORDER BY
	avg_runtime DESC
LIMIT 10;
```

7. Calculate the avaerage rating for movies released is the 21st century.

```sql
SELECT
    release_date,
    AVG(rating) as avg_rating
FROM
    movies
WHERE
    release_date > 2000 AND
    rating IS NOT NULL
GROUP BY
    release_date;
```

8. Find the director with the highest average movie runtine.

```sql
SELECT
    director,
    AVG(runtime) as avg_runtime
FROM
    movies
WHERE
    runtime IS NOT NULL
GROUP BY
    director
ORDER BY
    avg_runtime DESC
LIMIT
    1;
```

9. List the top 5 most prolific directors (those who have directed the most movies).

```sql
SELECT
    director,
    COUNT(*) as total_movies
FROM
    movies
WHERE
    director IS NOT NULL
GROUP BY
    director
ORDER BY
	total_movies DESC
LIMIT 5;
```

10. Find the highest and lowest rated movies for each director.

```sql
SELECT
    director,
    MAX(rating) as max_rating,
    MIN(rating) as min_rating
FROM
    movies
WHERE
    director IS NOT NULL
    AND rating IS NOT NULL
GROUP BY
    director;
```

11. Find the director that has made the most money (revenue - budget).

```sql
SELECT
    director,
    SUM(revenue - budget) as total_profit
FROM
    movies
WHERE
	director IS NOT NULL
	AND revenue IS NOT NULL
	AND budget IS NOT NULL
GROUP BY
	director
ORDER BY
	total_profit DESC;
```

12. Calculate the average rating for movies longer than 2 hours.

```sql
SELECT
    runtime,
    AVG(rating) as avg_rating
FROM
    movies
WHERE
    runtime > 120
    AND rating IS NOT NULL
GROUP BY
    runtime;
```

13. Find the year with the most movies released.

```sql
SELECT
    release_date,
    COUNT(*) as release_count
FROM
    movies
WHERE
	release_date IS NOT NULL
GROUP BY
    release_date
ORDER BY
	release_count DESC;
```

14. Find the average rating of movies for each decade.

```sql
SELECT
    FLOOR(release_date / 10) * 10 AS decade,
    AVG(rating) AS average_rating
FROM
    movies
WHERE
    release_date IS NOT NULL
    AND rating IS NOT NULL
GROUP BY
    FLOOR(release_date / 10) * 10
ORDER BY
    decade;
```

15. List the top 5 years where the difference between the highest and lowest rated movies is the greatest.

```sql
SELECT
    release_date,
    MAX(rating) - MIN(rating) as diff_rating
FROM
    movies
WHERE
    release_date IS NOT NULL
    AND rating IS NOT NULL
	AND rating BETWEEN 2 AND 9.5
GROUP BY
    release_date
ORDER BY
    diff_rating DESC
LIMIT
    5;
```

16. List directors who have never made a movie short 2 hours

```sql
SELECT
    director
FROM
    movies
WHERE
    runtime IS NOT NULL
GROUP BY
    director
HAVING
    MIN(runtime) >= 120;
```

17. Caclulate the percentage of movies with a rating of 8 or higher.

```sql
SELECT
    COUNT(
        CASE
            WHEN rating > 8 THEN 1
        END
    ) * 100.0 / COUNT(*)
FROM
    movies;
```

18. Find the director with the highest ratio of movies rated above 7.0.

```sql
SELECT
    director,
    COUNT(
        CASE
            WHEN rating > 7.0 THEN 1.0
        END
    ) * 100.0 / COUNT(*) as rating
FROM
    movies
WHERE
    director IS NOT NULL
GROUP BY
    director;
```

19. Categorize and group movies by length

```sql
SELECT
    CASE
        WHEN runtime < 90 THEN 'short'
        WHEN runtime >= 90
        AND runtime < 120 THEN 'medium'
        WHEN runtime >= 120 THEN 'long'
    END as runtime_category,
    COUNT(*) as total_movie
FROM
    movies
WHERE
    runtime is not NULL
GROUP BY
    runtime_category;
```

20. Categorize and group movies by flop or not

```sql
SELECT
    CASE
        WHEN revenue < budget THEN 'Flop'
        ELSE 'SUCCESS'
    END as flop_or_not,
    COUNT(*) as totlal_count
FROM
    movies
WHERE
	budget IS NOT NULL
	AND revenue IS NOT NULL
GROUP BY
	flop_or_not;
```

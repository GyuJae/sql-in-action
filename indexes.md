# Indexes

## Query plan

```sql
EXPLAIN query plan
SELECT
    director,
    AVG(revenue) as avg_revenue
FROM
    movies
WHERE
    revenue IS NOT NULL
    AND director IS NOT NULL
GROUP BY
    director
ORDER BY

--- SCAN movies
--- USE TEMP B-TREE FOR GROUP BY
--- SEARCH movies USING COVERING INDEX idx_director (director>?)
--- ...
```

## CREATE AND DROP INDEX

```sql
CREATE INDEX idx_director ON movies (director);

DROP INDEX idx_director;
```

## B+ Tree

## Leaf Node

## rowid

```sql
SELECT
    rowid, --- rowid is a hidden column
    director
FROM
    movies
WHERE
    director = 'Christopher Nolan';
```

## Unique Index

-- SQL create index when creating a table unique column

## Multi-column Index

```sql
CREATE INDEX idx_director_revenue ON movies (director, revenue);
```

SQL에서 Multi-column Index는 두 개 이상의 열(column)을 함께 인덱스하는 것으로, 여러 열을 기준으로 하는 쿼리의 성능을 최적화하기 위해 사용됩니다. 이는 Composite Index라고도 불립니다.

특징 및 동작 방식

1. 선언 순서 중요: Multi-column Index는 인덱스가 생성될 때 지정된 열의 순서에 따라 동작합니다. 예를 들어, (A, B) 순서로 인덱스를 생성했다면, 인덱스는 먼저 A 열을 기준으로 정렬한 다음, 그 안에서 B 열을 기준으로 정렬합니다. 이 순서에 맞지 않게 쿼리할 경우, 인덱스가 효율적으로 사용되지 않을 수 있습니다.

2. 왼쪽 접두사 원칙 (Leftmost Prefix Rule): Multi-column Index는 왼쪽에서부터 차례대로 인덱스가 활용됩니다. 예를 들어 (A, B, C)에 대한 인덱스가 있을 때, 인덱스는 다음과 같은 경우에만 효율적으로 사용됩니다:

- A에 대해서만 조회할 때
- A와 B에 대해서 조회할 때
- A , B, C에 대해서 조회할 때
- 하지만 B와 C만을 사용하는 쿼리에서는 이 인덱스가 효율적으로 사용되지 않으며, 새로운 인덱스가 필요할 수 있습니다.

3. 검색 성능 향상: Multi-column Index는 여러 열을 동시에 조건으로 사용하는 쿼리에서 검색 성능을 크게 향상시킬 수 있습니다. 다만, 인덱스가 지정된 순서대로만 잘 활용되기 때문에, 인덱스의 설계 시 쿼리에서 자주 사용하는 열의 조합을 고려해야 합니다.

4. 범위 조건에서의 한계: Multi-column Index의 활용은 특정 조건에 의해 제한될 수 있습니다. 예를 들어, A에 대한 조건이 범위 조건(예: BETWEEN, LIKE)일 경우, 그 뒤에 오는 열(B나 C)에 대해서는 인덱스가 온전히 사용되지 않을 수 있습니다.

## Covering Index

주요 특징

1. 인덱스만으로 처리: 쿼리가 요청한 모든 컬럼이 인덱스에 포함되어 있으면, SQL 엔진은 테이블 데이터를 조회할 필요가 없습니다. 이 경우 인덱스에서 필요한 데이터를 모두 얻을 수 있기 때문에, 테이블 접근 비용을 줄일 수 있습니다.

2. 디스크 I/O 감소: 테이블 데이터를 읽지 않아도 되므로 디스크 I/O가 줄어들어 성능이 크게 향상됩니다. 특히 데이터 양이 많고 테이블의 행이 클수록 I/O 비용을 줄이는 것이 중요해집니다.

3/ Secondary Index로서의 역할: 기본적으로 Covering Index는 보조 인덱스(Secondary Index)로 작동합니다. 기본 인덱스(Primary Key 인덱스)는 테이블에서 각 행을 고유하게 식별하기 위한 것이지만, Covering Index는 특정 쿼리 성능을 최적화하기 위해 설계됩니다.

```sql
CREATE INDEX idx_director_revenue ON movies (director, revenue);

SELECT
    director,
    revenue
FROM
    movies
WHERE
    director = 'Christopher Nolan';
```

## When to use Index

1. Columns you use often (WHERE, JOIN, ORDER BY)
2. Columns with many unique values
3. Large tables
4. Foriegn keys
5. Don't over-index (Insert, Update, Delete. Storage)
6. Add them after you are done, to speed up queries
7. Multi-Column (Composite Indexes) for queries that filter or sort by multiple columns together
8. Covering Indexes , if you can and it's cheap.
9. Don't index small tables
10. Consider Update frequency
11. Large text column? Use a full-text index than a B-Tree

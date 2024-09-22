# Sqlite - Data Definition Language

### CREATE

```sql
CREATE TABLE movies (
    title,
    released,
    overview,
    rating,
    director
);

CREATE TABLE movies (
    title TEXT,
    released INTEGER,
    overview TEXT,
    rating REAL,
    director TEXT
) STRICT;

```

### INSERT

```sql
INSERT INTO movies VALUES (
    "look back",
    2024,
    "devil",
    5,
    "husino"
);
```

```sql
INSERT INTO movies (title, released, overview, rating, director) VALUES (
    "look back",
    2024,
    "devil",
    5,
    "husino"
);

INSERT INTO movies (title, released) VALUES (
    "look back",
    2024,
    ---- NULL, NULL, NULL
);
```

### DROP

```sql
DROP TABLE movies;
```

### Datatypes In SQLite

[Datatypes In SQLite](https://www.sqlite.org/datatype3.html)

```sql
CREATE TABLE movies (
    title TEXT,
    released INTEGER, ---- 1 , 2 , 3 , 4 , 5
    overview TEXT,
    rating REAL, ---- 1.2, 1.3, 1.4
    director TEXT,
    for_kids BOOLEAN, ---- 0, 1 ---> INTEGER
    poster BLOB
);
```

### CONSTRAINTS

```sql
CREATE TABLE movies (
    title TEXT UNIQUE NOT NULL,
    released INTEGER,
    overview TEXT,
    rating REAL NOT NULL,
    director TEXT NOT NULL,
    for_kids BOOLEAN NOT NULL DEFAULT 0,
    poster BLOB NOT NULL
);
```

### CHECK CONSTRAINT

[Built-In Scalar SQL Functions](https://sqlite.org/lang_corefunc.html)

```sql
CREATE TABLE movies (
    title TEXT UNIQUE NOT NULL,
    released INTEGER NOT NULL CHECK (released >= 1900 AND released <= 2025),
    overview TEXT,
    rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 5), --- (rating BETWEEN 0 AND 5)
    director TEXT NOT NULL,
    for_kids INTEGER NOT NULL DEFAULT 0 CHECK (for_kids IN (0, 1)), ---- (for_kids = 0 OR for_kids = 1), (for_kids BETWEEN 0 AND 1)
    poster BLOB NOT NULL
);
```

### PRIMARY KEY

```sql
CREATE TABLE movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE NOT NULL,
    released INTEGER NOT NULL CHECK (released >= 1900 AND released <= 2025),
    overview TEXT,
    rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 5), --- (rating BETWEEN 0 AND 5)
    director TEXT NOT NULL,
    for_kids INTEGER NOT NULL DEFAULT 0 CHECK (for_kids IN (0, 1)), ---- (for_kids = 0 OR for_kids = 1), (for_kids BETWEEN 0 AND 1)
    poster BLOB NOT NULL
);
```

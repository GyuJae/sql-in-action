# MySQL

## Data Types

### Examples users table

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username CHAR(10) NOT NULL UNIQUE, ----> 'gyujae' = 'gyujae    ' max 255
    email VARCHAR(255), ----> 'wjdrbwo1206@test.com'
    gender ENUM('Male', 'Femail'), ---->
    iterests SET('Music', 'Movies', 'Sports', 'Reading'), --> 'Music, Movies'
    bio TINYTEXT, ----> 'Hello, my name is gyujae' max 255 (256B)
    bio2 TEXT, ----> 'Hello, my name is gyujae' max 65,535 (64KB)
    bio3 MEDIUMTEXT, ----> 'Hello, my name is gyujae' max 16,777,215 (16MB)
    bio4 LONGTEXT, ----> 'Hello, my name is gyujae' max 4,294,967,295 (4GB)
    profile_pic2 TINYBLOB, ----> max 255 (256B)
    profile_pic BLOB, ----> Binary Large Object max 65,535 (64KB)
    profile_pic3 MEDIUMBLOB, ----> max 16,777,215 (16MB)
    profile_pic4 LONGBLOB, ----> max 4,294,967,295 (4GB)
    age TINYINT UNSIGNED, ----> 0 to 255
    is_admin BOOLEAN, ----> 0 or 1 TINYINT(1, 0)
    balance FLOAT ----> -3.402823466E+38 to -1.175494351E-38, 0, 1.175494351E-38 to 3.402823466E+38
    score DECIMAL(3, 1), ----> 0.0 to 999.9
    join_date TIMESTAMP, ----> '2021-01-01 12:00:00'
    join_date2 DATETIME, ----> '2021-01-01 12:00:00' DATETIME > TIMESTAMP
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ----> '2021-01-01 12:00:00'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ----> '2021-01-01 12:00:00'
    birth_date DATE, ----> '2021-01-01'
    birth_time TIME, ----> '12:00:00'
    graduation_year YEAR, ----> '2021'

    CONSTRAINT chk_age CHECK (age >= 18),
    CONSTRAINT uq_username_email UNIQUE (username, email),
);
```

### INSERT

```sql
    INSERT INTO users (
        username,
        email,
        gender,
        interests,
        bio,
        profile_pic,
        age,
        is_admin,
        balance,
        score,
        join_date,
        birth_date,
        birth_time,
        graduation_year
    ) VALUES (
        'gyujae',
        'wjdrbwo1206@test.com',
        'Male',
        'Music, Movies',
        'Hello, my name is gyujae',
        'profile_pic.jpg',
        25,
        TRUE,
        100.00,
        99.9,
        '2021-01-01 12:00:00',
        '1996-12-06', --> 19961206 1996.12.06 1996/12/06
        '12:00:00', --> 120000 12:00
        '2021'
    );
```

### ALERT TANLE

```sql
    ALTER TABLE users
    ADD COLUMN phone_number CHAR(13);
```

```sql
    ALTER TABLE users
    ADD COLUMN phone_number CHAR(13) AFTER email;
```

```sql
--- CHANGE COLUMN TYPE
    ALTER TABLE users
    MODIFY COLUMN phone_number CHAR(13) AFTER email;
```

```sql
    ALTER TABLE users
    DROP COLUMN phone_number;
```

```sql
--- CHANGE COLUMN NAME
    ALTER TABLE users
    CHANGE COLUMN phone_number mobile_number CHAR(13);
```

```sql
--- RENAME TABLE
    ALTER TABLE users
    RENAME TO members;
```

```sql
--- drop constraint
    ALTER TABLE users
    DROP CONSTRAINT chk_age;
```

```sql
--- add constraint
    ALTER TABLE users
    ADD CONSTRAINT chk_age CHECK (age >= 18);
```

```sql
--- remove NOT NULL constraint
    ALTER TABLE users
    MODIFY COLUMN bio TINYTEXT NULL;
```

```sql
-- add NOT NULL constraint
    ALTER TABLE users
    MODIFY COLUMN bio TINYTEXT NOT NULL;
```

### SHOW CREATE TABLE

```sql
    SHOW CREATE TABLE users;
```

### Functions

```sql
UPDATE users SET graduation_date = MAKEDATE(graduation_year, 1);

ALTER TABLE users DROP COLUMN graduation_year;

ALTER TABLE users ADD COLUMN graduation_date DATE NOT NULL DEFAULT MAKEDATE(graduation_year, 1);
```

### Generated Columns

```sql
ALTER TABLE users ADD COLUMN full_name VARCHAR(255) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) VIRTUAL;
```

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    full_name VARCHAR(255) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) VIRTUAL
);
```

VIRTUAL vs STORED

```sql
--- STORED: store the value in the table
ALTER TABLE users ADD COLUMN age_year INT GENERATED ALWAYS AS (YEAR(CURRENT_DATE) - YEAR(birth_date)) STORED;
```

```sql
--- VIRTUAL: calculate the value when the column is selected
ALTER TABLE users ADD COLUMN age_year INT GENERATED ALWAYS AS (YEAR(CURRENT_DATE) - YEAR(birth_date)) VIRTUAL;
```

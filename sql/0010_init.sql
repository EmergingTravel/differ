CREATE TABLE
    IF NOT EXISTS items (
        id BIGSERIAL PRIMARY KEY,
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        title VARCHAR(64),
        data BYTEA NOT NULL
    );
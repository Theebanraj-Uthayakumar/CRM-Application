-- Add generated search vector column and GIN index for fast full-text queries
ALTER TABLE "Customer"
ADD COLUMN IF NOT EXISTS "search_vector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce("firstName", '') || ' ' || coalesce("lastName", '')), 'A') ||
  setweight(to_tsvector('english', coalesce("email", '')), 'B') ||
  setweight(to_tsvector('simple', coalesce("city", '') || ' ' || coalesce("country", '')), 'C')
) STORED;

CREATE INDEX IF NOT EXISTS "Customer_search_vector_idx"
  ON "Customer"
  USING GIN ("search_vector");


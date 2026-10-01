-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the chunks table
create table chunks (
  id bigserial primary key,
  content text not null,
  subject text not null,
  class int not null,
  chapter text not null,
  page int not null,
  embedding vector(768) not null
);

-- Create an HNSW index on the embedding column for fast cosine distance search
create index on chunks using hnsw (embedding vector_cosine_ops);

-- Create the match_chunks function for similarity search
create or replace function match_chunks (
  query_embedding vector(768),
  match_count int,
  filter_subject text
) returns table (
  id bigint,
  content text,
  subject text,
  class int,
  chapter text,
  page int,
  similarity float
)
language sql
as $$
  select
    id,
    content,
    subject,
    class,
    chapter,
    page,
    1 - (embedding <=> query_embedding) as similarity
  from chunks
  where subject = filter_subject
  order by embedding <=> query_embedding
  limit match_count;
$$;

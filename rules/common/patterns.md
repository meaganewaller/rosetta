# Patterns

## Starting a new feature or service

Before building from scratch, look for an existing skeleton or reference implementation that fits. Evaluate options for security, extensibility, and relevance to the current stack. Clone the best match as a foundation and iterate within that structure rather than greenfielding unnecessarily.

## Repository pattern

Encapsulate data access behind a consistent interface. Business logic depends on the abstract interface — not on whether the backing store is a database, an API, a file, or a mock. Standard operations typically include `findById`, `findAll`, `create`, `update`, and `delete`. This makes storage swappable and simplifies testing.

## API response envelope

All API responses use a consistent shape:

- `success` — boolean status indicator
- `data` — the payload; null on error
- `error` — human-readable message; null on success
- `meta` — pagination info (`total`, `page`, `limit`) where applicable

Consistency here means clients can handle responses generically rather than special-casing each endpoint.
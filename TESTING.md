# Testing Guide for PortalEmpleo Server

## Test Infrastructure

This project uses Jest with TypeScript for testing. Tests are located in the `src/__tests__` directory.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Types

### Unit Tests

Unit tests validate entity structure, metadata, and TypeScript types without requiring a database connection. They use TypeORM's metadata storage to verify entity configuration.

**Location:** `src/__tests__/entities/*.unit.test.ts`

**Example:** `Application.unit.test.ts` validates:
- Entity metadata (table name, columns, types)
- Relationships (Many-to-One, One-to-Many)
- Indexes and unique constraints
- Enum values
- Default values
- Timestamp columns

### Integration Tests (PostgreSQL Required)

Integration tests require a running PostgreSQL database and test actual database operations including:
- CRUD operations
- Foreign key constraints
- Unique constraints
- Cascade deletes
- Query optimization
- Transaction integrity

**Setup for Integration Tests:**

1. Ensure PostgreSQL is running
2. Create a test database:
   ```bash
   createdb portalempleo_test
   ```

3. Set environment variables:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_USERNAME=postgres
   export DB_PASSWORD=postgres
   export DB_DATABASE=portalempleo_test
   ```

4. Run migrations on test database:
   ```bash
   npm run migration:run
   ```

**Note:** Integration tests should be run separately from unit tests to avoid conflicts with the in-memory SQLite database used for unit tests.

## Application Entity Tests

The Application entity has comprehensive unit tests covering:

### Entity Structure
- ✅ Correct table name ('applications')
- ✅ All required columns (id, jobId, candidateId, cvId, coverLetter, status, appliedAt, updatedAt)
- ✅ Correct column types and nullable settings
- ✅ Foreign keys with proper naming (job_id, candidate_id, cv_id)

### Constraints & Indexes
- ✅ Unique constraint on (jobId, candidateId) - prevents duplicate applications (FR20)
- ✅ Composite index on (candidateId, status) for efficient queries
- ✅ Composite index on (jobId, status) for efficient queries
- ✅ Individual indexes on jobId, candidateId, cvId, status

### Relationships
- ✅ Many-to-One relationship with Job
- ✅ Many-to-One relationship with User (candidate)
- ✅ Many-to-One relationship with CV

### Status Enum
- ✅ All 5 status values: pending, reviewed, accepted, rejected, withdrawn
- ✅ Default status: 'pending'
- ✅ Status updates work correctly

### Timestamps
- ✅ appliedAt automatically set on creation
- ✅ updatedAt automatically updated on changes

## Test Coverage

Run `npm run test:coverage` to see detailed coverage reports. The goal is to maintain >80% coverage for all entity and business logic code.

## Migration Testing

To verify migrations work correctly:

1. **Run migration:**
   ```bash
   npm run migration:run
   ```

2. **Verify table creation:**
   ```bash
   psql portalempleo -c "\d applications"
   ```

   Should show:
   - All columns with correct types
   - Foreign keys to jobs, users, cvs
   - Unique constraint on (job_id, candidate_id)
   - Indexes on candidate_id, job_id, status, and composite indexes

3. **Revert migration (if needed):**
   ```bash
   npm run migration:revert
   ```

## Writing New Tests

When adding new entities or features:

1. Create unit tests first to validate entity structure
2. Use TypeORM metadata inspection for configuration validation
3. Test all relationships, constraints, and indexes
4. Add integration tests for complex business logic
5. Maintain test isolation - each test should be independent

## Troubleshooting

### SQLite Enum Issues

SQLite doesn't support PostgreSQL enum types. Unit tests work around this by using TypeORM's metadata inspection rather than actual database operations.

### Test Timeouts

If tests timeout, increase the timeout in jest.config.js:
```javascript
testTimeout: 30000 // 30 seconds
```

### Database Connection Issues

Ensure PostgreSQL is running and environment variables are correctly set. Check `src/config/database.ts` for connection configuration.

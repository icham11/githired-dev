# GitHired - Testing Documentation

Dokumentasi lengkap untuk menjalankan test suite pada aplikasi GitHired.

## 📁 Struktur Testing

```
server/
├── __tests__/
│   ├── setup.js              # Test environment setup
│   ├── auth.test.js          # Authentication API tests
│   ├── interview.test.js     # Interview API tests
│   └── resume.test.js        # Resume API tests
└── jest.config.js            # Jest configuration

client/
├── src/__tests__/
│   ├── setup.js              # Vitest setup
│   ├── components/
│   │   ├── Button.test.jsx
│   │   └── Input.test.jsx
│   ├── pages/
│   │   └── LoginPage.test.jsx
│   ├── store/
│   │   └── authSlice.test.js
│   └── integration/
│       └── interview-flow.test.jsx
└── vitest.config.js          # Vitest configuration
```

## 🚀 Setup Testing Environment

### Backend Testing (Server)

1. **Install Dependencies:**
```bash
cd server
npm install --save-dev jest supertest @types/jest
```

2. **Create Test Database:**
```bash
# PostgreSQL
createdb githired_test

# atau via SQL
psql -U postgres
CREATE DATABASE githired_test;
```

3. **Update package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Frontend Testing (Client)

1. **Install Dependencies:**
```bash
cd client
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

2. **Update package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## 🧪 Running Tests

### Backend Tests

```bash
cd server

# Run all tests
npm test

# Run specific test file
npm test auth.test.js

# Run with coverage
npm run test:coverage

# Watch mode (auto-rerun on changes)
npm run test:watch
```

### Frontend Tests

```bash
cd client

# Run all tests
npm test

# Run specific test file
npm test Button.test.jsx

# Run with UI (interactive mode)
npm run test:ui

# Run with coverage report
npm run test:coverage

# Watch mode
npm test -- --watch
```

## 📝 Test Coverage

### Backend Coverage

**Target Coverage:**
- Lines: > 80%
- Functions: > 80%
- Branches: > 75%

**Critical Areas:**
- Authentication & Authorization (auth.test.js)
- Interview Session Management (interview.test.js)
- Resume Analysis (resume.test.js)
- Payment Processing (payment.test.js)

### Frontend Coverage

**Target Coverage:**
- Components: > 85%
- Pages: > 70%
- Redux Store: > 90%

**Critical Areas:**
- User Authentication Flow
- Interview Chat Interface
- Form Validations
- State Management

## 🎯 Test Types

### 1. Unit Tests
Test individual components/functions in isolation:
- Component rendering
- Function logic
- State management
- Props handling

### 2. Integration Tests
Test feature flows and component interactions:
- Complete user flows (login → interview → results)
- API integration
- Navigation between pages
- Form submissions

### 3. End-to-End Tests (E2E)
Test complete user journeys:
- User registration → Login → Interview
- Resume upload → Analysis → Results
- Payment flow

## 📊 Coverage Reports

### View Coverage Reports

**Backend:**
```bash
cd server
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

**Frontend:**
```bash
cd client
npm run test:coverage
# Open coverage/index.html in browser
```

## 🔍 Writing New Tests

### Backend Test Template

```javascript
const request = require('supertest');
const app = require('../app');

describe('Feature Name', () => {
  let authToken;
  
  beforeAll(async () => {
    // Setup: create test data
  });

  afterAll(async () => {
    // Cleanup: remove test data
  });

  describe('POST /endpoint', () => {
    it('should do something successfully', async () => {
      const response = await request(app)
        .post('/endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: 'value' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('expectedField');
    });
  });
});
```

### Frontend Test Template

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<ComponentName />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Assert expected behavior
  });
});
```

## ⚙️ CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: githired_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install Backend Dependencies
        run: cd server && npm install
      
      - name: Run Backend Tests
        run: cd server && npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/githired_test
      
      - name: Install Frontend Dependencies
        run: cd client && npm install
      
      - name: Run Frontend Tests
        run: cd client && npm test
```

## 🐛 Debugging Tests

### Backend Debugging

```javascript
// Add console.log in tests
console.log('Response:', response.body);

// Use --verbose flag
npm test -- --verbose

// Run single test with debug
node --inspect-brk node_modules/.bin/jest auth.test.js
```

### Frontend Debugging

```javascript
// Use debug from @testing-library/react
import { render, screen, debug } from '@testing-library/react';

it('test', () => {
  render(<Component />);
  debug(); // Prints DOM to console
});

// Or use screen.debug()
screen.debug();
```

## 📌 Best Practices

1. **AAA Pattern:** Arrange, Act, Assert
2. **Test Isolation:** Each test should be independent
3. **Meaningful Names:** Describe what the test does
4. **Mock External Dependencies:** APIs, databases, etc.
5. **Avoid Implementation Details:** Test behavior, not implementation
6. **Keep Tests Simple:** One assertion per test (when possible)
7. **Use Test Data Builders:** Create reusable test data functions

## 🔗 Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)

## 📧 Support

Jika ada pertanyaan atau issue terkait testing, silakan hubungi tim development atau buka issue di repository.

---

**Happy Testing! 🎉**

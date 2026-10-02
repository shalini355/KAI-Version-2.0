const request = require('supertest');
const app = require('../src/app');

describe('auth routes', () => {
  it('GET /api/auth/google redirects to Google consent screen', async () => {
    const response = await request(app).get('/api/auth/google');
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toMatch(/accounts\.google\.com/);
  });

  it('protects the current-user route', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.statusCode).toBe(401);
  });
});

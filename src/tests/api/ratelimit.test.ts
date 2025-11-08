import request from 'supertest';
import app from '../../app';

jest.setTimeout(30000);

describe('Security Middlewares', () => {
  describe('Rate Limiting', () => {
    it('should block requests to the API after 250 attempts (generalLimiter)', async () => {
      const requests = [];
      const numRequests = 255;

      for (let i = 0; i < numRequests; i++) {
        requests.push(request(app).get('/api/v1/non-existent-route'));
      }

      const responses = await Promise.all(requests);

      const tooManyRequestsResponse = responses.find(
        (res) => res.status === 429
      );

      expect(tooManyRequestsResponse).toBeDefined();
      expect(tooManyRequestsResponse?.body.message).toContain(
        'Too many requests'
      );
    }, 15000);

    it('should block requests to the login route after 30 attempts (authLimiter)', async () => {
      const requests = [];
      const numRequests = 30;

      for (let i = 0; i < numRequests; i++) {
        requests.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({ email: `test${i}@example.com`, password: 'password' })
        );
      }

      const responses = await Promise.all(requests);

      const tooManyRequestsResponse = responses.find(
        (res) => res.status === 429
      );

      expect(tooManyRequestsResponse).toBeDefined();
      expect(tooManyRequestsResponse?.body.message).toContain(
        'Too many auth requests'
      );
    }, 15000);
  });
});

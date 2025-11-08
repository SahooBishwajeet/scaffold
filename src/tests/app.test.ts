import request from 'supertest';
import app from '../app';

describe('/', () => {
  describe('GET /', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /health', () => {
    it("should return 200 OK with status 'OK', timestamp, and uptime", async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 Not Found for nonexistent route', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.status).toBe(404);
    });
  });
});

jest.mock('../../services/mail.service');

import request from 'supertest';
import app from '../../app';
import UserModel from '../../models/user.model';

describe('/api/v1/users', () => {
  let accessToken: string;
  let testUser: any;

  const baseUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'Test@1234',
  };

  let regularUserToken: string;
  let adminUserToken: string;
  let adminUser: any;

  let deletedUser: any;

  let testNotebook: any;
  let testNote: any;

  const adminBaseUser = {
    name: 'Admin User',
    email: 'adminuser@example.com',
    password: 'Admin@1234',
    role: 'admin', // To be set manually
  };

  const deletedBaseUser = {
    name: 'Deleted User',
    email: 'deleteduser@example.com',
    password: 'Deleted@1234',
  };

  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(baseUser);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: baseUser.email, password: baseUser.password });

    accessToken = loginResponse.body.data.accessToken;
    testUser = loginResponse.body.data.user;
    regularUserToken = accessToken;

    await request(app).post('/api/v1/auth/register').send(adminBaseUser);
    await UserModel.findOneAndUpdate(
      { email: adminBaseUser.email },
      { role: 'admin' }
    );

    const adminLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminBaseUser.email, password: adminBaseUser.password });

    adminUserToken = adminLoginResponse.body.data.accessToken;
    adminUser = adminLoginResponse.body.data.user;

    const deletedUserResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(deletedBaseUser);

    deletedUser = deletedUserResponse.body.data.user;

    const deletedUserLoginResponse = await request(app)
      .post(`/api/v1/auth/login`)
      .send({
        email: deletedBaseUser.email,
        password: deletedBaseUser.password,
      });

    await request(app)
      .delete('/api/v1/users/me')
      .set(
        'Authorization',
        `Bearer ${deletedUserLoginResponse.body.data.accessToken}`
      );

    const notebookResponse = await request(app)
      .post('/api/v1/notebooks')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .send({ name: 'Test Notebook' });

    testNotebook = notebookResponse.body.data;

    const noteResponse = await request(app)
      .post(`/api/v1/notebooks/${testNotebook.id}/notes`)
      .set('Authorization', `Bearer ${regularUserToken}`)
      .send({ title: 'Test Note', content: 'This is a test note.' });

    testNote = noteResponse.body.data;
  });

  describe('/me routes', () => {
    it('GET /me: should get the current user profile', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(baseUser.email);
      expect(response.body.data.id).toBe(testUser.id);
    });

    it('GET /me: should fail with no token', async () => {
      const response = await request(app).get('/api/v1/users/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    it('GET /me: should fail with an invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        'Invalid or expired access token'
      );
    });

    it('PUT /me: should update the user profile (name only)', async () => {
      const newName = 'Updated Test User';
      const response = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: newName });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newName);

      const dbUser = await UserModel.findOne({ id: testUser.id });
      expect(dbUser?.name).toBe(newName);
    });

    it('PUT /me: should ignore attempts to update other fields (like email or role)', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'New Name', email: 'hacker@example.com', role: 'admin' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('New Name');
      expect(response.body.data.email).toBe(baseUser.email);
      expect(response.body.data.role).toBe('user');
    });

    it('DELETE /me: should soft-delete the user account', async () => {
      const response = await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Account deleted');

      const dbUser = await UserModel.findOne({ id: testUser.id });
      expect(dbUser).toBeNull();
    });
  });

  describe('Admin Routes', () => {
    describe('GET /', () => {
      it('should get all users as an admin', async () => {
        const response = await request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0].email).toBe(baseUser.email);
        expect(response.body.data[1].email).toBe(adminBaseUser.email);
      });

      it('should fail to get all users as a regular user', async () => {
        const response = await request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Forbidden');
      });
    });

    describe('GET /deleted', () => {
      it('should get all deleted users as an admin', async () => {
        const response = await request(app)
          .get('/api/v1/users/deleted')
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].email).toBe(deletedBaseUser.email);
      });

      it('should fail to get deleted users as a regular user', async () => {
        const response = await request(app)
          .get('/api/v1/users/deleted')
          .set('Authorization', `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /:id/restore', () => {
      it('should restore a soft-deleted user as an admin', async () => {
        const response = await request(app)
          .put(`/api/v1/users/${deletedUser.id}/restore`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe(deletedBaseUser.email);

        const restoredUser = await UserModel.findOne({ id: deletedUser.id });
        expect(restoredUser).toBeDefined();
        expect((restoredUser as any).deleted).toBe(false);
      });

      it('should fail to restore a user as a regular user', async () => {
        const response = await request(app)
          .put(`/api/v1/users/${deletedUser.id}/restore`)
          .set('Authorization', `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });

      it('should return 404 if trying to restore a non-deleted user', async () => {
        const response = await request(app)
          .put(`/api/v1/users/${adminUser.id}/restore`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('User not found');
      });
    });

    describe('/:id routes', () => {
      it('GET /:id: should get a user by ID as an admin', async () => {
        const response = await request(app)
          .get(`/api/v1/users/${testUser.id}`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe(testUser.email);
      });

      it('GET /:id: should fail to get a user as a regular user', async () => {
        const response = await request(app)
          .get(`/api/v1/users/${testUser.id}`)
          .set('Authorization', `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Forbidden');
      });

      it('GET /:id: should return 404 for a non-existent user ID', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await request(app)
          .get(`/api/v1/users/${fakeId}`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('User not found');
      });

      it('PUT /:id: should update a user by ID as an admin', async () => {
        const updates = {
          name: 'Name Updated By Admin',
          role: 'admin',
        };
        const response = await request(app)
          .put(`/api/v1/users/${testUser.id}`)
          .set('Authorization', `Bearer ${adminUserToken}`)
          .send(updates);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updates.name);
        expect(response.body.data.role).toBe(updates.role);

        const dbUser = await UserModel.findOne({ id: testUser.id });
        expect(dbUser?.role).toBe('admin');
      });

      it('PUT /:id: should return 409 when trying to update to a duplicate email', async () => {
        const updates = {
          email: adminBaseUser.email,
        };
        const response = await request(app)
          .put(`/api/v1/users/${testUser.id}`)
          .set('Authorization', 'Bearer ' + adminUserToken)
          .send(updates);

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Email already in use');
      });

      it('DELETE /:id: should soft-delete a user by ID as an admin', async () => {
        const response = await request(app)
          .delete(`/api/v1/users/${testUser.id}`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('User deleted successfully');

        const dbUser = await UserModel.findOne({ id: testUser.id });
        expect(dbUser).toBeNull();
      });
    });

    describe('Nested Admin Routes', () => {
      it('GET /:userId/notebooks: should get all notebooks for a specific user', async () => {
        const response = await request(app)
          .get(`/api/v1/users/${testUser.id}/notebooks`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe(testNotebook.id);
        expect(response.body.data[0].name).toBe('Test Notebook');
      });

      it('GET /:userId/notebooks: should be forbidden for a regular user', async () => {
        const response = await request(app)
          .get(`/api/v1/users/${testUser.id}/notebooks`)
          .set('Authorization', `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('Forbidden');
      });

      it('GET /:userId/notes: should get all notes for a specific user', async () => {
        const response = await request(app)
          .get(`/api/v1/users/${testUser.id}/notes`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].id).toBe(testNote.id);
        expect(response.body.data[0].title).toBe('Test Note');
      });

      it('GET /:userId/notes: should be forbidden for a regular user', async () => {
        const response = await request(app)
          .get(`/api/v1/users/${testUser.id}/notes`)
          .set('Authorization', `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('Forbidden');
      });
    });
  });
});

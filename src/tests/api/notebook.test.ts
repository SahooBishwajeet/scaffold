jest.mock('../../services/mail.service');

import request from 'supertest';
import app from '../../app';
import NoteModel from '../../models/note.model';
import NotebookModel from '../../models/notebook.model';
import UserModel from '../../models/user.model';

describe('/api/v1/notebooks', () => {
  let regularUserToken: string;
  let testUser: any;
  let adminUserToken: string;

  let notebookA: any;
  let notebookB: any;
  let deletedNotebook: any;
  let adminNotebook: any;

  let noteInNotebookA: any;

  const baseUser = {
    name: 'Test User',
    email: 'testuser-nb@example.com',
    password: 'Password@123',
  };
  const adminBaseUser = {
    name: 'Admin User',
    email: 'admin-nb@example.com',
    password: 'Password@123',
  };

  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(baseUser);
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: baseUser.email, password: baseUser.password });
    regularUserToken = loginResponse.body.data.accessToken;
    testUser = loginResponse.body.data.user;

    await request(app).post('/api/v1/auth/register').send(adminBaseUser);
    await UserModel.findOneAndUpdate(
      { email: adminBaseUser.email },
      { role: 'admin' }
    );
    const adminLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminBaseUser.email, password: adminBaseUser.password });
    adminUserToken = adminLoginResponse.body.data.accessToken;

    const nbARes = await request(app)
      .post('/api/v1/notebooks')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .send({ name: 'Notebook A' });
    notebookA = nbARes.body.data;

    const nbBRes = await request(app)
      .post('/api/v1/notebooks')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .send({ name: 'Notebook B' });
    notebookB = nbBRes.body.data;

    const adminNbRes = await request(app)
      .post('/api/v1/notebooks')
      .set('Authorization', `Bearer ${adminUserToken}`)
      .send({ name: 'Admin Notebook' });
    adminNotebook = adminNbRes.body.data;

    const delNbRes = await request(app)
      .post('/api/v1/notebooks')
      .set('Authorization', `Bearer ${regularUserToken}`)
      .send({ name: 'Deleted Notebook' });
    deletedNotebook = delNbRes.body.data;
    await request(app)
      .delete(`/api/v1/notebooks/${deletedNotebook.id}`)
      .set('Authorization', `Bearer ${regularUserToken}`);

    const noteRes = await request(app)
      .post(`/api/v1/notebooks/${notebookA.id}/notes`)
      .set('Authorization', `Bearer ${regularUserToken}`)
      .send({ title: 'Note in Notebook A' });
    noteInNotebookA = noteRes.body.data;
  });

  describe('User Routes: /', () => {
    it('POST /: should create a new notebook successfully', async () => {
      const newNotebook = {
        name: 'My New Test Notebook',
        description: 'A description.',
      };

      const response = await request(app)
        .post('/api/v1/notebooks')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(newNotebook);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newNotebook.name);
      expect(response.body.data.description).toBe(newNotebook.description);
      expect(response.body.data.user.id).toBe(testUser.id);

      const dbNotebook = await NotebookModel.findOne({
        id: response.body.data.id,
      });
      expect(dbNotebook).toBeDefined();
      expect(dbNotebook?.name).toBe(newNotebook.name);
    });

    it('POST /: should fail to create a notebook with no name', async () => {
      const response = await request(app)
        .post('/api/v1/notebooks')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ description: 'Missing name' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name is required');
    });

    it("GET /: should get all of the current user's notebooks", async () => {
      const response = await request(app)
        .get('/api/v1/notebooks')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Notebook A');
      expect(response.body.data[1].name).toBe('Notebook B');

      expect(
        response.body.data.some((nb: any) => nb.name === 'Admin Notebook')
      ).toBe(false);
    });

    it('GET /: should return an empty array if the user has no notebooks', async () => {
      await request(app)
        .delete(`/api/v1/notebooks/${adminNotebook.id}`)
        .set('Authorization', `Bearer ${adminUserToken}`);

      const response = await request(app)
        .get('/api/v1/notebooks')
        .set('Authorization', `Bearer ${adminUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('GET /: should fail with no token', async () => {
      const response = await request(app).get('/api/v1/notebooks');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('User Routes: /:notebookId/notes', () => {
    it('POST /:notebookId/notes: should create a new note in a notebook', async () => {
      const newNote = {
        title: 'My Second Note',
        content: 'This note is also in Notebook A',
      };

      const response = await request(app)
        .post(`/api/v1/notebooks/${notebookA.id}/notes`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(newNote);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newNote.title);
      expect(response.body.data.notebook.id).toBe(notebookA.id);
      expect(response.body.data.user.id).toBe(testUser.id);

      const dbNote = await NoteModel.findOne({ id: response.body.data.id });
      expect(dbNote).toBeDefined();
      expect(dbNote?.title).toBe(newNote.title);
    });

    it("POST /:notebookId/notes: should fail to create a note in another user's notebook", async () => {
      const response = await request(app)
        .post(`/api/v1/notebooks/${adminNotebook.id}/notes`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ title: 'Hack Attempt' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Notebook not found');
    });

    it('GET /:notebookId/notes: should get all notes for a specific notebook', async () => {
      const response = await request(app)
        .get(`/api/v1/notebooks/${notebookA.id}/notes`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(noteInNotebookA.id);
      expect(response.body.data[0].title).toBe('Note in Notebook A');
    });

    it('GET /:notebookId/notes: should return an empty array for an empty notebook', async () => {
      const response = await request(app)
        .get(`/api/v1/notebooks/${notebookB.id}/notes`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it("GET /:notebookId/notes: should fail to get notes from another user's notebook", async () => {
      const response = await request(app)
        .get(`/api/v1/notebooks/${adminNotebook.id}/notes`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Notebook not found');
    });
  });

  describe('User Routes: /:id', () => {
    it('GET /:id: should get a single notebook by its ID', async () => {
      const response = await request(app)
        .get(`/api/v1/notebooks/${notebookA.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(notebookA.id);
      expect(response.body.data.name).toBe('Notebook A');
    });

    it("GET /:id: should fail to get another user's notebook", async () => {
      const response = await request(app)
        .get(`/api/v1/notebooks/${adminNotebook.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Notebook not found or you don't have access"
      );
    });

    it('GET /:id: should return 404 for a non-existent notebook ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/notebooks/${fakeId}`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(404);
    });

    it("PUT /:id: should update a user's own notebook", async () => {
      const updates = {
        name: 'Notebook A (Updated)',
        description: 'This is the new description.',
        isPinned: true,
      };

      const response = await request(app)
        .put(`/api/v1/notebooks/${notebookA.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.isPinned).toBe(true);

      const dbNotebook = await NotebookModel.findOne({ id: notebookA.id });
      expect(dbNotebook?.name).toBe(updates.name);
    });

    it("PUT /:id: should fail to update another user's notebook", async () => {
      const updates = { name: 'Hack Attempt' };
      const response = await request(app)
        .put(`/api/v1/notebooks/${adminNotebook.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(updates);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain(
        "Notebook not found or you don't have access"
      );
    });

    it("DELETE /:id: should soft-delete a user's own notebook", async () => {
      const response = await request(app)
        .delete(`/api/v1/notebooks/${notebookA.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Notebook deleted successfully');

      const dbNotebook = await NotebookModel.findOne({ id: notebookA.id });
      expect(dbNotebook).toBeNull();
    });

    it("DELETE /:id: should fail to delete another user's notebook", async () => {
      const response = await request(app)
        .delete(`/api/v1/notebooks/${adminNotebook.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain(
        "Notebook not found or you don't have access"
      );
    });
  });

  describe('Admin Routes: Static', () => {
    it('GET /all/notebooks: should get all notebooks from all users as an admin', async () => {
      const response = await request(app)
        .get('/api/v1/notebooks/all/notebooks')
        .set('Authorization', `Bearer ${adminUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveLength(3);
      expect(
        response.body.data.some((nb: any) => nb.name === 'Notebook A')
      ).toBe(true);
      expect(
        response.body.data.some((nb: any) => nb.name === 'Admin Notebook')
      ).toBe(true);
    });

    it('GET /all/notebooks: should be forbidden for a regular user', async () => {
      const response = await request(app)
        .get('/api/v1/notebooks/all/notebooks')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Forbidden');
    });

    it('GET /all/deleted: should get all soft-deleted notebooks as an admin', async () => {
      const response = await request(app)
        .get('/api/v1/notebooks/all/deleted')
        .set('Authorization', `Bearer ${adminUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(deletedNotebook.id);
      expect(response.body.data[0].name).toBe('Deleted Notebook');
    });

    it('GET /all/deleted: should be forbidden for a regular user', async () => {
      const response = await request(app)
        .get('/api/v1/notebooks/all/deleted')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Forbidden');
    });
  });

  describe('Admin Routes: Parameterized', () => {
    describe('PUT /:id/restore', () => {
      it('should restore a soft-deleted notebook as an admin', async () => {
        let dbNotebook = await NotebookModel.findOne({
          id: deletedNotebook.id,
        });
        expect(dbNotebook).toBeNull();

        const response = await request(app)
          .put(`/api/v1/notebooks/${deletedNotebook.id}/restore`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(deletedNotebook.id);

        dbNotebook = await NotebookModel.findOne({ id: deletedNotebook.id });
        expect(dbNotebook).toBeDefined();
        expect((dbNotebook as any).deleted).toBe(false);
      });

      it('should be forbidden for a regular user', async () => {
        const response = await request(app)
          .put(`/api/v1/notebooks/${deletedNotebook.id}/restore`)
          .set('Authorization', `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Forbidden');
      });

      it('should return 404 if the notebook is not deleted', async () => {
        const response = await request(app)
          .put(`/api/v1/notebooks/${notebookA.id}/restore`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('Notebook not found');
      });
    });

    describe('/admin/:id routes', () => {
      it("PUT /admin/:id: should update any user's notebook", async () => {
        const updates = {
          name: 'Updated by Admin',
          isPinned: true,
        };
        const response = await request(app)
          .put(`/api/v1/notebooks/admin/${notebookA.id}`)
          .set('Authorization', `Bearer ${adminUserToken}`)
          .send(updates);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updates.name);
        expect(response.body.data.isPinned).toBe(true);

        const dbNotebook = await NotebookModel.findOne({ id: notebookA.id });
        expect(dbNotebook?.name).toBe(updates.name);
      });

      it('PUT /admin/:id: should be forbidden for a regular user', async () => {
        const response = await request(app)
          .put(`/api/v1/notebooks/admin/${notebookA.id}`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .send({ name: 'Hack attempt' });

        expect(response.status).toBe(403);
      });

      it("DELETE /admin/:id: should delete any user's notebook", async () => {
        const response = await request(app)
          .delete(`/api/v1/notebooks/admin/${notebookA.id}`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain(
          'Notebook deleted successfully'
        );

        const dbNotebook = await NotebookModel.findOne({ id: notebookA.id });
        expect(dbNotebook).toBeNull();
      });

      it('DELETE /admin/:id: should be forbidden for a regular user', async () => {
        const response = await request(app)
          .delete(`/api/v1/notebooks/admin/${notebookA.id}`)
          .set('Authorization', `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
      });

      it('DELETE /admin/:id: should return 404 for a non-existent ID', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await request(app)
          .delete(`/api/v1/notebooks/admin/${fakeId}`)
          .set('Authorization', `Bearer ${adminUserToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain('Notebook not found');
      });
    });
  });
});

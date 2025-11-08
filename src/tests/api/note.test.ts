jest.mock("../../services/mail.service");

import request from "supertest";
import app from "../../app";
import NoteModel from "../../models/note.model";
import NotebookModel from "../../models/notebook.model";
import UserModel from "../../models/user.model";

describe("/api/v1/notes", () => {
  let regularUserToken: string;
  let testUser: any;
  let adminUserToken: string;

  let notebookA: any;
  let notebookB: any;
  let adminNotebook: any;

  let noteA: any;
  let noteB: any;
  let deletedNote: any;
  let adminNote: any;

  const baseUser = {
    name: "Test User",
    email: "testuser-note@example.com",
    password: "Password@123",
  };
  const adminBaseUser = {
    name: "Admin User",
    email: "admin-note@example.com",
    password: "Password@123",
  };

  beforeEach(async () => {
    await request(app).post("/api/v1/auth/register").send(baseUser);
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: baseUser.email, password: baseUser.password });

    regularUserToken = loginResponse.body.data.accessToken;
    testUser = loginResponse.body.data.user;

    await request(app).post("/api/v1/auth/register").send(adminBaseUser);
    await UserModel.findOneAndUpdate(
      { email: adminBaseUser.email },
      { role: "admin" }
    );
    const adminLoginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: adminBaseUser.email, password: adminBaseUser.password });

    adminUserToken = adminLoginResponse.body.data.accessToken;

    const nbARes = await request(app)
      .post("/api/v1/notebooks")
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({ name: "Notebook A" });

    notebookA = nbARes.body.data;

    const nbBRes = await request(app)
      .post("/api/v1/notebooks")
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({ name: "Notebook B" });

    notebookB = nbBRes.body.data;

    const adminNbRes = await request(app)
      .post("/api/v1/notebooks")
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({ name: "Admin Notebook" });

    adminNotebook = adminNbRes.body.data;

    const noteARes = await request(app)
      .post(`/api/v1/notebooks/${notebookA.id}/notes`)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({ title: "Note A" });

    noteA = noteARes.body.data;

    const noteBRes = await request(app)
      .post(`/api/v1/notebooks/${notebookA.id}/notes`)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({ title: "Note B" });

    noteB = noteBRes.body.data;

    const delNoteRes = await request(app)
      .post(`/api/v1/notebooks/${notebookA.id}/notes`)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({ title: "Deleted Note" });

    deletedNote = delNoteRes.body.data;

    await request(app)
      .delete(`/api/v1/notes/${deletedNote.id}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    const adminNoteRes = await request(app)
      .post(`/api/v1/notebooks/${adminNotebook.id}/notes`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({ title: "Admin Note" });

    adminNote = adminNoteRes.body.data;
  });

  describe("User Routes: GET /", () => {
    it("should get all of the current user's notes", async () => {
      const response = await request(app)
        .get("/api/v1/notes")
        .set("Authorization", `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveLength(2);
      expect(
        response.body.data.some((note: any) => note.title === "Note A")
      ).toBe(true);
      expect(
        response.body.data.some((note: any) => note.title === "Note B")
      ).toBe(true);
    });

    it("should not include notes from other users", async () => {
      const response = await request(app)
        .get("/api/v1/notes")
        .set("Authorization", `Bearer ${regularUserToken}`);

      expect(
        response.body.data.some((note: any) => note.title === "Admin Note")
      ).toBe(false);
    });

    it("should return an empty array if a user has no notes", async () => {
      const newUser = {
        name: "New User",
        email: "new@example.com",
        password: "Password@123",
      };
      await request(app).post("/api/v1/auth/register").send(newUser);
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: newUser.email, password: newUser.password });
      const newUserToken = loginRes.body.data.accessToken;

      const response = await request(app)
        .get("/api/v1/notes")
        .set("Authorization", `Bearer ${newUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe("User Routes: PUT /:noteId/move", () => {
    it("should move a note to another notebook", async () => {
      expect(noteA.notebook.id).toBe(notebookA.id);

      const response = await request(app)
        .put(`/api/v1/notes/${noteA.id}/move`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send({ newNotebookId: notebookB.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(noteA.id);
      expect(response.body.data.notebook.id).toBe(notebookB.id);

      const dbNotebookB = await NotebookModel.findOne({ id: notebookB.id });

      const dbNote = await NoteModel.findOne({ id: noteA.id });
      expect((dbNote?.notebook as any).toString()).toBe(
        (dbNotebookB?._id as any).toString()
      );
    });

    it("should fail to move a note to a non-existent notebook", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const response = await request(app)
        .put(`/api/v1/notes/${noteA.id}/move`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send({ newNotebookId: fakeId });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Target notebook not found");
    });

    it("should fail to move a note to another user's notebook", async () => {
      const response = await request(app)
        .put(`/api/v1/notes/${noteA.id}/move`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send({ newNotebookId: adminNotebook.id });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Target notebook not found");
    });

    it("should fail to move another user's note", async () => {
      const response = await request(app)
        .put(`/api/v1/notes/${adminNote.id}/move`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send({ newNotebookId: notebookB.id });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Note not found or you don't have access"
      );
    });

    it("should fail with a 400 if newNotebookId is missing", async () => {
      const response = await request(app)
        .put(`/api/v1/notes/${noteA.id}/move`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("New notebook ID is required");
    });
  });

  describe("User Routes: /:noteId", () => {
    it("GET /:noteId: should get a single note by its ID", async () => {
      const response = await request(app)
        .get(`/api/v1/notes/${noteA.id}`)
        .set("Authorization", `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(noteA.id);
      expect(response.body.data.title).toBe("Note A");
    });

    it("GET /:noteId: should fail to get another user's note", async () => {
      const response = await request(app)
        .get(`/api/v1/notes/${adminNote.id}`)
        .set("Authorization", `Bearer ${regularUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Note not found or you don't have access"
      );
    });

    it("GET /:noteId: should return 404 for a non-existent note ID", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const response = await request(app)
        .get(`/api/v1/notes/${fakeId}`)
        .set("Authorization", `Bearer ${regularUserToken}`);

      expect(response.status).toBe(404);
    });

    it("PUT /:noteId: should update a user's own note", async () => {
      const updates = {
        title: "Note A (Updated)",
        content: "This is the new content.",
        isPinned: true,
      };

      const response = await request(app)
        .put(`/api/v1/notes/${noteA.id}`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.content).toBe(updates.content);
      expect(response.body.data.isPinned).toBe(true);

      const dbNote = await NoteModel.findOne({ id: noteA.id });
      expect(dbNote?.title).toBe(updates.title);
      expect(dbNote?.isPinned).toBe(true);
    });

    it("PUT /:noteId: should fail to update another user's note", async () => {
      const updates = { title: "Hack Attempt" };
      const response = await request(app)
        .put(`/api/v1/notes/${adminNote.id}`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send(updates);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain(
        "Note not found or you don't have access"
      );
    });

    it("DELETE /:noteId: should soft-delete a user's own note", async () => {
      const response = await request(app)
        .delete(`/api/v1/notes/${noteA.id}`)
        .set("Authorization", `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Note deleted successfully");

      const dbNote = await NoteModel.findOne({ id: noteA.id });
      expect(dbNote).toBeNull();
    });

    it("DELETE /:noteId: should fail to delete another user's note", async () => {
      const response = await request(app)
        .delete(`/api/v1/notes/${adminNote.id}`)
        .set("Authorization", `Bearer ${regularUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain(
        "Note not found or you don't have access"
      );
    });
  });

  describe("Admin Routes: Static", () => {
    it("GET /all/notes: should get all notes from all users as an admin", async () => {
      const response = await request(app)
        .get("/api/v1/notes/all/notes")
        .set("Authorization", `Bearer ${adminUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveLength(3);
      expect(
        response.body.data.some((note: any) => note.title === "Note A")
      ).toBe(true);
      expect(
        response.body.data.some((note: any) => note.title === "Admin Note")
      ).toBe(true);
    });

    it("GET /all/notes: should be forbidden for a regular user", async () => {
      const response = await request(app)
        .get("/api/v1/notes/all/notes")
        .set("Authorization", `Bearer ${regularUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Forbidden");
    });

    it("GET /all/deleted: should get all soft-deleted notes as an admin", async () => {
      const response = await request(app)
        .get("/api/v1/notes/all/deleted")
        .set("Authorization", `Bearer ${adminUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(deletedNote.id);
      expect(response.body.data[0].title).toBe("Deleted Note");
    });

    it("GET /all/deleted: should be forbidden for a regular user", async () => {
      const response = await request(app)
        .get("/api/v1/notes/all/deleted")
        .set("Authorization", `Bearer ${regularUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Forbidden");
    });
  });

  describe("Admin Routes: Parameterized", () => {
    describe("PUT /:noteId/restore", () => {
      it("should restore a soft-deleted note as an admin", async () => {
        let dbNote = await NoteModel.findOne({ id: deletedNote.id });
        expect(dbNote).toBeNull();

        const response = await request(app)
          .put(`/api/v1/notes/${deletedNote.id}/restore`)
          .set("Authorization", `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(deletedNote.id);

        dbNote = await NoteModel.findOne({ id: deletedNote.id });
        expect(dbNote).toBeDefined();
        expect((dbNote as any).deleted).toBe(false);
      });

      it("should be forbidden for a regular user", async () => {
        const response = await request(app)
          .put(`/api/v1/notes/${deletedNote.id}/restore`)
          .set("Authorization", `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("Forbidden");
      });

      it("should return 404 if the note is not deleted", async () => {
        const response = await request(app)
          .put(`/api/v1/notes/${noteA.id}/restore`)
          .set("Authorization", `Bearer ${adminUserToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain(
          "Note not found in deleted items"
        );
      });
    });

    describe("/admin/:noteId routes", () => {
      it("GET /admin/:noteId: should get any user's note", async () => {
        const response = await request(app)
          .get(`/api/v1/notes/admin/${noteA.id}`)
          .set("Authorization", `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(noteA.id);
      });

      it("GET /admin/:noteId: should be forbidden for a regular user", async () => {
        const response = await request(app)
          .get(`/api/v1/notes/admin/${noteA.id}`)
          .set("Authorization", `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
      });

      it("GET /admin/:noteId: should return 404 for a non-existent note", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";
        const response = await request(app)
          .get(`/api/v1/notes/admin/${fakeId}`)
          .set("Authorization", `Bearer ${adminUserToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toContain("Note not found");
      });

      it("PUT /admin/:noteId: should update any user's note", async () => {
        const updates = {
          title: "Note A (Updated by Admin)",
          isPinned: true,
        };
        const response = await request(app)
          .put(`/api/v1/notes/admin/${noteA.id}`)
          .set("Authorization", `Bearer ${adminUserToken}`)
          .send(updates);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(updates.title);

        const dbNote = await NoteModel.findOne({ id: noteA.id });
        expect(dbNote?.title).toBe(updates.title);
      });

      it("PUT /admin/:noteId: should be forbidden for a regular user", async () => {
        const response = await request(app)
          .put(`/api/v1/notes/admin/${noteA.id}`)
          .set("Authorization", `Bearer ${regularUserToken}`)
          .send({ title: "Hack Attempt" });

        expect(response.status).toBe(403);
      });

      it("DELETE /admin/:noteId: should delete any user's note", async () => {
        const response = await request(app)
          .delete(`/api/v1/notes/admin/${noteA.id}`)
          .set("Authorization", `Bearer ${adminUserToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain("Note deleted successfully");

        const dbNote = await NoteModel.findOne({ id: noteA.id });
        expect(dbNote).toBeNull();
      });

      it("DELETE /admin/:noteId: should be forbidden for a regular user", async () => {
        const response = await request(app)
          .delete(`/api/v1/notes/admin/${noteA.id}`)
          .set("Authorization", `Bearer ${regularUserToken}`);

        expect(response.status).toBe(403);
      });
    });
  });
});

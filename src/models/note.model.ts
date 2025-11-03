import { model, Schema } from "mongoose";
import MongooseDelete, {
  SoftDeleteDocument,
  SoftDeleteModel,
} from "mongoose-delete";
import { INotebook } from "./notebook.model";
import { IUser } from "./user.model";

export interface INote extends SoftDeleteDocument {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  user: IUser["_id"];
  notebook: INotebook["_id"];
}

const noteSchema = new Schema<INote>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    notebook: {
      type: Schema.Types.ObjectId,
      ref: "Notebook",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;

        delete (ret as any).deleted;
        delete (ret as any).deletedAt;
        delete (ret as any).createdAt;
        delete (ret as any).updatedAt;
      },
    },
  }
);

// -- Plugin for Soft Delete --
noteSchema.plugin(MongooseDelete, {
  overrideMethods: "all",
  deletedAt: true,
  deletedBy: false,
});

const NoteModel = model<INote, SoftDeleteModel<INote>>("Note", noteSchema);

export default NoteModel;

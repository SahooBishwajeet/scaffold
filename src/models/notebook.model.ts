import { model, Schema } from "mongoose";
import MongooseDelete, {
  SoftDeleteDocument,
  SoftDeleteModel,
} from "mongoose-delete";
import { IUser } from "./user.model";

export interface INotebook extends SoftDeleteDocument {
  id: string;
  name: string;
  description?: string;
  isPinned: boolean;
  user: IUser["_id"];
}

const notebookSchema = new Schema<INotebook>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    name: {
      type: String,
      required: [true, "Notebook name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
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
  },
  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;

        delete (ret as any).deleted;
        delete (ret as any).deletedAt;
      },
    },
  }
);

// -- Plugin for Soft Delete --
notebookSchema.plugin(MongooseDelete, {
  overrideMethods: "all",
  deletedAt: true,
  deletedBy: false,
});

const NotebookModel = model<INotebook, SoftDeleteModel<INotebook>>(
  "Notebook",
  notebookSchema
);

export default NotebookModel;

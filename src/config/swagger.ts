import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import { Config } from ".";
import {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResetPasswordBody,
} from "../docs/auth.schema";
import { FilterConditionSchema } from "../docs/filterCondtition.schema";
import { NoteSchema } from "../docs/note.schema";
import { NotebookSchema } from "../docs/notebook.schema";
import { parameters } from "../docs/parameters";
import { responses } from "../docs/responses";
import { UserSchema } from "../docs/user.schema";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend Template API",
      version: "1.0.0",
      description: "API documentation for the Backend Template project",
    },
    servers: [
      {
        url: `http://localhost:${Config.PORT}`,
        description: "Local Development Server (Root)",
      },
      {
        url: `http://localhost:${Config.PORT}${Config.API_PREFIX}`,
        description: "Local Development Server (API)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT Access Token",
        },
      },
      schemas: {
        ApiError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Something went wrong",
            },
          },
        },
        NotFound: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Route Not Found",
            },
          },
        },
        User: UserSchema,
        Notebook: NotebookSchema,
        Note: NoteSchema,
        FilterCondition: FilterConditionSchema,
        RegisterBody: RegisterBody,
        LoginBody: LoginBody,
        ForgotPasswordBody: ForgotPasswordBody,
        ResetPasswordBody: ResetPasswordBody,
      },
      parameters: parameters,
      responses: responses,
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.resolve(__dirname, "../routes/**/*.{ts,js}"),
    path.resolve(__dirname, "../app.{ts,js}"),
  ],
};

export const swaggerSpecs = swaggerJSDoc(options);

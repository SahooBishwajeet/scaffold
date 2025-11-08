import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { Config } from '.';
import {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResetPasswordBody,
} from '../docs/auth.schema';
import { FilterConditionSchema } from '../docs/filterCondtition.schema';
import {
  CreateNoteBody,
  MoveNoteBody,
  NoteSchema,
  UpdateNoteBody,
} from '../docs/note.schema';
import {
  CreateNotebookBody,
  NotebookSchema,
  UpdateNotebookBody,
} from '../docs/notebook.schema';
import { parameters } from '../docs/parameters';
import { responses } from '../docs/responses';
import {
  AdminUpdateUserBody,
  ChangePasswordBody,
  UpdateProfileBody,
  UserSchema,
} from '../docs/user.schema';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend Template API',
      version: '1.0.0',
      description: 'API documentation for the Backend Template project',
    },
    servers: [
      {
        url: `http://localhost:${Config.PORT}${Config.API_PREFIX}`,
        description: 'Local Development Server (API)',
      },
      {
        url: `http://localhost:${Config.PORT}`,
        description: 'Local Development Server (Root)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT Access Token',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Something went wrong',
            },
          },
        },
        NotFound: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Route Not Found',
            },
          },
        },
        User: UserSchema,
        Notebook: NotebookSchema,
        Note: NoteSchema,
        FilterCondition: FilterConditionSchema,
        SearchBody: {
          type: 'object',
          properties: {
            filters: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/FilterCondition',
              },
            },
          },
        },
        RegisterBody: RegisterBody,
        LoginBody: LoginBody,
        ForgotPasswordBody: ForgotPasswordBody,
        ResetPasswordBody: ResetPasswordBody,
        UpdateProfileBody: UpdateProfileBody,
        ChangePasswordBody: ChangePasswordBody,
        AdminUpdateUserBody: AdminUpdateUserBody,
        CreateNotebookBody: CreateNotebookBody,
        UpdateNotebookBody: UpdateNotebookBody,
        CreateNoteBody: CreateNoteBody,
        UpdateNoteBody: UpdateNoteBody,
        MoveNoteBody: MoveNoteBody,
      },
      parameters: {
        ...parameters,
      },
      responses: responses,
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.resolve(__dirname, '../routes/**/*.{ts,js}'),
    path.resolve(__dirname, '../app.{ts,js}'),
  ],
};

export const swaggerSpecs = swaggerJSDoc(options);

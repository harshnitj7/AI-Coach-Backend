# AI Interview Coach — Backend (TypeScript)

Same feature set as the JavaScript version — **AI Mock Interviews**, **Resume
Analyzer**, **AI Roadmap Generator**, JWT auth — rewritten in strict TypeScript
with typed Sequelize models, typed AI responses, and a typed `req.user`.

## What changed vs. the JS version

- All files are `.ts`, compiled with `tsc` (strict mode on).
- Sequelize models use `Model<InferAttributes<T>, InferCreationAttributes<T>>` —
  every field, association, and query result is typed, no `any`.
- `src/types/index.ts` defines shared types: `AIResumeAnalysis`, `AIRoadmapResponse`,
  `AIAnswerEvaluation`, etc. The AI service returns these types directly, so a
  typo in a controller (e.g. `analysis.atScore`) is caught at compile time.
- `src/types/express.d.ts` augments Express's `Request` with `user?: User`,
  so `req.user` is typed everywhere instead of cast with `any`.
- Dev loop uses `ts-node-dev` for fast reloads; production runs compiled JS from `dist/`.

## Folder Structure

```
ai-interview-coach-backend-ts/
├── server.ts                     # Entry point
├── tsconfig.json
├── package.json
├── .env.example
├── uploads/resumes/
├── src/
│   ├── app.ts
│   ├── config/
│   │   ├── db.ts
│   │   └── syncDb.ts
│   ├── types/
│   │   ├── index.ts               # Shared domain + AI response interfaces
│   │   └── express.d.ts           # req.user typing
│   ├── models/                    # Typed Sequelize models
│   │   ├── User.ts
│   │   ├── RefreshToken.ts
│   │   ├── Interview.ts
│   │   ├── InterviewQuestion.ts
│   │   ├── Resume.ts
│   │   ├── Roadmap.ts
│   │   └── index.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── interviewController.ts
│   │   ├── resumeController.ts
│   │   └── roadmapController.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── interviewRoutes.ts
│   │   ├── resumeRoutes.ts
│   │   └── roadmapRoutes.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── errorMiddleware.ts
│   │   ├── uploadMiddleware.ts
│   │   └── validateMiddleware.ts
│   ├── validators/
│   │   ├── authValidator.ts
│   │   └── interviewValidator.ts
│   ├── services/
│   │   ├── aiService.ts           # Typed OpenAI wrapper
│   │   └── resumeParserService.ts
│   └── utils/
│       ├── generateToken.ts
│       ├── apiResponse.ts
│       └── logger.ts
```

## Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Create your local Postgres database
psql -U postgres -c "CREATE DATABASE interview_coach;"

# 3. Copy env template and fill in real values
cp .env.example .env
# edit .env: DB credentials, JWT secrets, OPENAI_API_KEY

# 4. Create/sync all tables from the Sequelize models
npm run db:migrate

# 5. Development (ts-node-dev, auto-reload, no build step needed)
npm run dev

# 6. Production
npm run build      # compiles src/ + server.ts -> dist/
npm start           # runs dist/server.js
```

Generate strong JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Verifying types

```bash
npx tsc -p tsconfig.json --noEmit   # type-check without emitting files
```
This project was verified to compile cleanly under `strict: true` with no `any`
leaks in the public API surface.

## API Reference

Identical routes and request/response shapes to the JS version — see the table
below (all responses follow `{ success, message, data }`).

### Auth — `/api/auth`
| Method | Endpoint    | Access  | Description                     |
|--------|-------------|---------|-----------------------------------|
| POST   | `/register` | Public  | Create account, returns tokens    |
| POST   | `/login`    | Public  | Login, returns tokens             |
| POST   | `/refresh`  | Public* | Rotate access token via cookie    |
| POST   | `/logout`   | Private | Revoke refresh token              |
| GET    | `/me`       | Private | Get current user                  |

### Users — `/api/users`
| Method | Endpoint   | Access  | Description             |
|--------|------------|---------|---------------------------|
| PUT    | `/profile` | Private | Update name/targetRole  |

### Mock Interviews — `/api/interviews`
| Method | Endpoint        | Access  | Description                              |
|--------|-----------------|---------|--------------------------------------------|
| POST   | `/start`        | Private | Create session, AI-generate questions      |
| POST   | `/:id/answer`   | Private | Submit answer, get AI score + feedback     |
| POST   | `/:id/complete` | Private | Finalize, get overall AI feedback          |
| GET    | `/`             | Private | List my interviews                         |
| GET    | `/:id`          | Private | Get one interview with all Q&A             |

### Resume Analyzer — `/api/resumes`
| Method | Endpoint   | Access  | Description                                            |
|--------|------------|---------|-----------------------------------------------------------|
| POST   | `/analyze` | Private | Upload PDF (`multipart/form-data`, field `resume`)        |
| GET    | `/`        | Private | List my analyzed resumes                                  |
| GET    | `/:id`     | Private | Get one resume analysis                                   |

### AI Roadmap — `/api/roadmaps`
| Method | Endpoint | Access  | Description                    |
|--------|----------|---------|-----------------------------------|
| POST   | `/`      | Private | Generate a personalized roadmap  |
| GET    | `/`      | Private | List my roadmaps                  |
| GET    | `/:id`   | Private | Get one roadmap                   |

## Next Steps

- Add DOCX parsing (`mammoth`) — currently PDF only.
- Swap `sequelize.sync({ alter: true })` for `sequelize-cli` migrations in prod.
- Add Jest + Supertest + `ts-jest` for typed tests.
- Consider `zod` to validate `req.body` shapes at runtime and infer types from
  the same schema (currently validation is via `express-validator`, and body
  types are asserted manually in controllers).

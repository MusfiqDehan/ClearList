# Clearlist

Clearlist is a full-stack todo application built as two independently deployable
applications:

- `backend`: Laravel 13 API with Sanctum cookie authentication and MySQL.
- `frontend`: Next.js 16 App Router application with TypeScript and Tailwind CSS.

The application supports registration, login, logout, per-user todo ownership,
create/edit/delete, completion toggling, search, status filters, and a Gemini
assistant that can manage tasks using natural language. Administrators also have
a protected overview for user and task metrics and account activation controls.
Admins can also send expiring email invitations, and users can update their
name, phone, timezone, bio, and avatar URL from their account settings.

## Requirements

- Node.js 22 or newer
- Docker and Docker Compose
- PHP 8.3+ and Composer are optional when using the included Docker workflow

Laravel 13.26.1 and Next.js 16.3.2 were installed when this project was created.
The lock files make the installed dependency tree reproducible.

## Run locally with Docker Compose

From the project root:

```bash
docker compose -f docker-compose.local.yml up --build -d
```

The local stack starts MySQL, PHP-FPM, Nginx, and the standalone Next.js
server. The backend waits for MySQL, runs migrations, and then starts PHP-FPM.
Open <http://localhost:3000>; the API is available at <http://localhost:8000>.
MySQL uses the development-only credentials in `backend/.env.local`.

The database seeder creates these local demo accounts:

- Admin: `admin@example.com` / `password123`
- User: `user@example.com` / `password123`

Use `localhost` consistently for both services; do not switch one URL to
`127.0.0.1`, because browser cookie rules treat those as different hosts.

To stop the stack:

```bash
docker compose -f docker-compose.local.yml down
```

The ignored `backend/.env.local` contains the local Gemini key used for
verification. It is never sent to Next.js. Rotate that key before sharing the
repository or deploying it.

For host-based development instead, copy the examples and run the backend
with PHP 8.3+ and Composer, then run `npm run dev` inside `frontend`:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

## API

All API endpoints are prefixed with `/api`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/sanctum/csrf-cookie` | No | Initialize the CSRF cookie |
| POST | `/api/register` | No | Create a user session |
| POST | `/api/login` | No | Start a user session |
| POST | `/api/logout` | Yes | End the current session |
| GET | `/api/user` | Yes | Return the signed-in user |
| GET | `/api/todos` | Yes | List todos; accepts `status`, `search`, `per_page` |
| POST | `/api/todos` | Yes | Create a todo |
| GET | `/api/todos/{id}` | Yes | Read one owned todo |
| PATCH | `/api/todos/{id}` | Yes | Update an owned todo |
| DELETE | `/api/todos/{id}` | Yes | Delete an owned todo |
| POST | `/api/assistant` | Yes | Prompt the Gemini task assistant |
| POST | `/api/assistant/{conversation}/approve` | Yes | Approve or reject a pending tool call |
| GET | `/api/admin/metrics` | Admin | Return global user and task counts |
| GET | `/api/admin/users` | Admin | List users with task counts; accepts `status=all|active|inactive|invited`, `search`, and pagination (maximum 10 per page) |
| PATCH | `/api/admin/users/{id}/status` | Admin | Activate or deactivate a user |
| DELETE | `/api/admin/users/{id}` | Admin | Permanently delete a user and their todos |
| POST | `/api/admin/invitations` | Admin | Send a one-time registration invitation |
| POST | `/api/admin/invitations/{id}/resend` | Admin | Resend a pending invitation with a refreshed token |
| DELETE | `/api/admin/invitations/{id}` | Admin | Delete a pending invitation |
| GET | `/api/invitations/{token}` | No | Validate an invitation token |
| POST | `/api/invitations/{token}/accept` | No | Accept an invitation and create a session |
| PATCH | `/api/profile` | Yes | Update the signed-in user's profile |

Sanctum uses an encrypted/session cookie rather than putting an access token in
browser JavaScript. The frontend first calls `/sanctum/csrf-cookie`, then sends
the login or registration request with credentials enabled. Laravel's stateful
middleware authenticates subsequent requests and the policy ensures that a user
can only access their own todos.

## Gemini task assistant

The workspace assistant is available at `/app`. It supports prompts such as:

- `Create a task called Prepare the release notes with due date 2026-08-25`
- `Show my active tasks`
- `Mark task ID 12 as completed`
- `How many total tasks do I have?`
- `How many tasks are due today or tomorrow?`
- `Delete task ID 12`

The assistant is implemented as a separate domain layer:

- `app/Ai/Agents/TodoAgent.php` contains provider selection and behavioral
  instructions.
- `app/Ai/Tools` contains list, create, update, delete, and statistics tools.
- `app/Services/TodoService.php` is shared by the HTTP controller and tools, so
  validation and ownership behavior do not diverge.
- `User` conversations are persisted in `agent_conversations` and
  `agent_conversation_messages`.
- `DeleteTodo` implements Laravel AI SDK approval handling. The assistant
  cannot permanently delete a task until the user approves it in the panel.

The frontend stores only the conversation ID. The Gemini credential remains in
Laravel's `GEMINI_API_KEY` environment variable. Configure
`AI_DEFAULT_PROVIDER=gemini` and optionally `GEMINI_MODEL` in the backend
environment.

## Admin panel

Sign in with the seeded admin account and open <http://localhost:3000/admin>.
The panel shows total, active, and inactive users plus total, completed, and
pending tasks. The directory includes per-user task counts, search and status
filters, pagination, and confirmation-protected activation/deactivation and
permanent deletion. The Invited filter shows pending email invitations with
Reinvite and Delete actions. Permanent deletion also removes the user's todos
through the database relationship cascade and cannot be used on the current
admin account.

Admin access is enforced by Laravel middleware, not just by the frontend route.
New registrations are regular active users by default. Deactivation blocks new
logins, invalidates database-backed sessions, and preserves the user's todos.
The last active administrator and the current administrator cannot be
deactivated.

Invitations expire after 7 days and are stored as hashes, so the raw token is
only present in the email link. The recipient completes their name and
password at `/invite/{token}`; after joining, they can finish their profile at
`/account`. The profile email is intentionally fixed to avoid changing the
login identity without a verification workflow.

For local SMTP, Laravel maps the usual Django settings as follows:
`EMAIL_HOST` to `MAIL_HOST`, `EMAIL_USE_SSL=True` to `MAIL_SCHEME=smtps`,
`EMAIL_HOST_USER` to `MAIL_USERNAME`, `EMAIL_HOST_PASSWORD` to
`MAIL_PASSWORD`, and `DEFAULT_FROM_EMAIL` to `MAIL_FROM_ADDRESS`. The actual
local SMTP values belong in the ignored `backend/.env.local`; never copy them
into `.env.example` or production source control.

## Project structure

### Laravel backend

- `routes/api.php`: HTTP endpoints and middleware boundaries.
- `app/Http/Controllers`: thin request coordinators for auth and todos.
- `app/Http/Requests`: input validation and authorization of request types.
- `app/Http/Resources`: the public JSON shape returned to the frontend.
- `app/Services/AdminService.php`: aggregate metrics and safe account status changes.
- `app/Services/InvitationService.php`: expiring invitation tokens and account creation.
- `app/Http/Middleware`: active-account and admin authorization boundaries.
- `app/Models`: Eloquent models and relationships.
- `app/Policies/TodoPolicy.php`: ownership rules for individual todos.
- `database/migrations`: versioned database schema.
- `database/factories` and `database/seeders`: repeatable test/demo data.
- `tests/Feature`: request-level behavior tests.

### How Laravel handles a request

1. A browser request matches a route in `routes/api.php`.
2. Middleware runs first. `web` provides sessions for auth endpoints and
   `auth:sanctum` rejects unauthenticated todo requests.
3. A Form Request validates input before the controller executes.
4. The controller delegates business work to a service, which uses Eloquent to
   query or change MySQL records.
5. A Policy checks ownership for a specific todo.
6. An API Resource converts the model into a deliberate JSON response.
7. For assistant requests, the agent selects a tool; the tool calls the same
   service and returns structured JSON for the model to explain.

Migrations are Laravel's version-controlled schema changes. Eloquent is the
ORM: `User::todos()` describes the relationship and `$user->todos()` scopes
queries to the current user. Artisan is Laravel's command-line helper; use it
for migrations, tests, route inspection, and cache management.

### Next.js frontend

- `src/lib/api.ts`: one Axios client with CSRF and cookie configuration.
- `src/lib/types.ts`: shared TypeScript API shapes.
- `src/components/providers/AuthProvider.tsx`: browser auth session state.
- `src/components/auth/AuthForm.tsx`: login and registration UI.
- `src/components/todos`: task form, list item, and dashboard modules.
- `src/components/admin`: responsive admin metrics and user directory.
- `src/components/profile`: signed-in profile editing.
- `src/components/invitations`: invitation acceptance and account creation.
- `src/components/assistant/AssistantPanel.tsx`: prompt history and approval UI.
- `src/app/login` and `src/app/register`: auth routes.
- `src/app/page.tsx`: public Clearlist landing page with product overview and CTAs.
- `src/app/app/page.tsx`: authenticated dashboard entry point.
- `e2e/todo.spec.ts`: browser workflow coverage.
- `e2e/assistant.spec.ts`: optional real Gemini workflow coverage.
- `e2e/admin.spec.ts`: admin access, metrics, account status, and invitation coverage.

The landing page introduces the product and links visitors to registration or
login. The workspace provider checks `/api/user` when `/app` loads. A successful
response shows the dashboard; a 401 redirects to login. Todo mutations call the
Laravel API and refresh the current filtered list so the UI remains consistent
with the database.

## Test and quality checks

Backend tests use an in-memory SQLite database so they do not modify local
MySQL:

```bash
docker run --rm -u "$(id -u):$(id -g)" \
  -v "$PWD/backend":/app -w /app composer:latest \
  php artisan test

docker run --rm -u "$(id -u):$(id -g)" \
  -v "$PWD/backend":/app -w /app composer:latest \
  vendor/bin/pint --test
```

Frontend checks:

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

For the browser test, keep MySQL, Laravel, and Next.js running, install a
Playwright browser once, and run:

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

The normal E2E test creates an isolated user and exercises registration,
creation, completion, filtering, editing, and deletion. The assistant E2E test
is opt-in because it consumes Gemini quota:

```bash
cd frontend
RUN_GEMINI_E2E=true npx playwright test e2e/assistant.spec.ts
```

## Production deployment with Traefik

The production Compose file assumes Traefik already exists. It does not
install another proxy. Nginx translates Traefik HTTP requests to PHP-FPM, and
the Next.js container serves the standalone frontend.

Build and publish immutable image references (prefer digest references):

```bash
docker build -t registry.example.com/clearlist-backend:release ./backend
docker build -t registry.example.com/clearlist-nginx:release -f docker/nginx/Dockerfile .
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  -t registry.example.com/clearlist-frontend:release ./frontend
```

Set the resulting image digests, domains, database credentials, and Traefik
network values in the ignored root `.env.prod`. Inject a newly generated
`APP_KEY` and a rotated `GEMINI_API_KEY` into `backend/.env.prod`, then run:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
```

`docker-compose.prod.yml` keeps MySQL private and persistent, runs migrations
before PHP-FPM, adds restart policies, and attaches only Nginx and Next.js to
the external Traefik network. The default certificate resolver is
`letsencrypt`; change it in `.env.prod` if your VPS uses another name.

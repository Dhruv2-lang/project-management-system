# Project Management System – Android app (Expo / React Native)

Mobile client for the same Express + PostgreSQL API used by the web app.
All project / task / dashboard data comes from the REST API – nothing is stored locally except the JWT (Expo SecureStore).

## Run it

```bash
cd mobile
npm install
cp .env.example .env      # then adjust EXPO_PUBLIC_API_URL if needed
npx expo start            # press "a" for the Android emulator, or scan the QR in Expo Go
```

Start the backend first (`cd backend && npm run dev` → `http://localhost:5000/api`).

### API URL (`EXPO_PUBLIC_API_URL`)

| Where the app runs | Value |
| --- | --- |
| Android emulator | `http://localhost:5000/api` (the app maps `localhost` → `10.0.2.2` automatically, in `src/config.ts` only) |
| Physical phone, same Wi-Fi | `http://<your-computer-LAN-IP>:5000/api` |
| Production | `https://<deployed-backend>/api` |

Restart `npx expo start` after editing `.env`. The backend's CORS setting does not affect native apps.

## Structure

```
src/
  config.ts          API base URL (single source)
  theme.ts           colours, spacing, typography
  types/             User, Project, Task, DashboardStats, API envelopes, enums
  services/          api.ts (Axios client), tokenStorage.ts, auth/project/task/dashboard services
  context/           AuthContext (session lifecycle), ToastContext
  hooks/             useApiQuery (loading / refresh / error), useDebouncedValue
  navigation/        auth stack, bottom tabs, nested stacks for forms
  screens/           Login, Register, Dashboard, Projects(+Form), Tasks(+Form), ConnectionError
  components/        Button, TextField, DateField, FilterBar, SelectSheet, cards, state views …
  utils/             constants (enum ⇄ label maps), validation, formatting
```

## Behaviour notes

- **Auth**: JWT kept only in SecureStore. On launch the token is validated with `GET /auth/me`.
  Invalid/expired → token removed, Login shown with "Your session has expired. Please log in again."
  If the server can't be reached at launch the token is *kept* and a retry screen is shown.
- **401 anywhere** → central Axios interceptor clears the token, resets auth state and returns to Login.
- **Errors**: UI only ever sees `ApiError` with a friendly message (network, validation, 409, 429, 5xx).
- **Enums**: the API always receives `NOT_STARTED` / `IN_PROGRESS` / `COMPLETED`, `PENDING` / …, `LOW` / `MEDIUM` / `HIGH`; labels are display-only.
- **Task shortcuts**: tap the checkbox to complete/reopen; tap the priority or status badge to change it from a bottom sheet.
- Search and filters are executed by the API (`search`, `status`, `priority`, `projectId` query params).
- Deleting a project also deletes its tasks (backend cascade) – the confirmation says so.

## Manual cross-platform check (same account on both clients)

1. Create a task in the web app → pull-to-refresh the Tasks tab in the app → it appears.
2. Create a task in the app → refresh the web app → it appears.

## Scripts

`npm start` · `npm run android` · `npm run typecheck`

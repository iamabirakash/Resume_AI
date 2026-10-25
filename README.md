# Resume AI

An interview-ready resume analysis and practice app with a Node/Express backend and a Vite + React frontend.

## Highlights
- Upload and parse resumes (PDF) on the backend.
- AI-powered analysis and interview prep workflows.
- Modern React frontend with Tailwind CSS.

## Repo Structure
- `Backend` Node/Express API
- `Frontend` Vite + React client

## Tech Stack
- Backend: Express, MongoDB/Mongoose, Google GenAI, JWT, Multer, Puppeteer
- Frontend: React, React Router, Vite, Tailwind CSS, Axios

## Getting Started

### Prerequisites
- Node.js 18+ recommended
- npm 9+ recommended

### Install Dependencies
```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### Configure Environment
Create a `Backend/.env` file with the required keys. Typical values include:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_genai_key
GEMINI_MODEL=gemini-3.8-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

If you have additional keys in your local setup, include them here as needed.

`GEMINI_MODEL` defaults to `gemini-3.8-flash`. `GEMINI_FALLBACK_MODEL` defaults to `gemini-3.5-flash-lite`; set it to an empty value to disable fallback. Both model IDs must be available to your API key. Existing Render variables override these defaults, so update any old `GEMINI_MODEL` setting and redeploy the backend. The startup and request logs show the actual model being used.

Reports and resume generation use low thinking effort on Gemini 3 models and a 120-second deadline per attempt. On temporary capacity or timeout errors, generation switches to the fallback model rather than repeatedly requesting the overloaded primary. Rate limits retry the same model. The entire operation is limited to four attempts across both models, with exponential backoff and jitter. If they remain unavailable, the API returns HTTP 503 with a retry message and `Retry-After: 30`; permanent errors such as invalid API keys are not retried.

Run `npm run check:gemini` from `Backend` to make one small structured-output request to each configured model using the backend API key. It does not upload resumes or access MongoDB. Run it in Render's shell to check the deployed key and model access; local `.env` settings may differ from Render. Failed checks report HTTP status without printing credentials.

### Run Locally
```bash
# Backend
cd Backend
npm run dev

# Frontend (new terminal)
cd Frontend
npm run dev
```

### Build Frontend
```bash
cd Frontend
npm run build
```

## Notes
- The backend uses `puppeteer` and `pdf-parse` for PDF processing.
- If you see install warnings, they are usually safe to ignore, but `npm audit fix` can resolve most issues.

## Scripts
### Backend
- `npm run dev` Start the API with nodemon

### Frontend
- `npm run dev` Start Vite dev server
- `npm run build` Production build
- `npm run preview` Preview production build
- `npm run lint` Lint codebase

## License
ISC

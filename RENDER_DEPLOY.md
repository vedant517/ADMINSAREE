# Render Deploy

This repo is configured for a single Render Web Service. Express serves the built React admin panel in production, so the frontend and backend share one domain and cookies work normally.

## Steps

1. Push this repo to GitHub.
2. In Render, choose **New > Blueprint** and select this repo.
3. Render will read `render.yaml`.
4. Add the prompted environment values:
   - `MONGODB_URI`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. Deploy.

Render build command:

```bash
npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
```

Render start command:

```bash
npm start --prefix backend
```

After deployment, open the service URL. API routes remain under `/api`, and React routes are served by `frontend/dist/index.html`.

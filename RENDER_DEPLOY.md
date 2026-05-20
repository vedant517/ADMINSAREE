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
cd backend && npm install && cd ../frontend && npm install && npm run build
```

Render start command:

```bash
cd backend && node server.js
```

After deployment, open the service URL. API routes remain under `/api`, and React routes are served by `frontend/dist/index.html`.

## Troubleshooting

- If you see `ENOENT: no such file or directory ... index.html`, the frontend build failed. Check the Render build logs for errors.
- Make sure `NODE_VERSION` is set to `20.18.0` in Render environment variables.
- The `VITE_API_URL` env var is set to `/api` in `render.yaml` so the frontend uses relative API paths in production.

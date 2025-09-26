# AI Chat UI

A minimal AI-powered chat application featuring a FastAPI backend and a Tailwind-powered frontend. Users can send text prompts, upload files, and receive Markdown-formatted responses from OpenAI's GPT models.

## Project structure

```
.
├── backend
│   ├── main.py            # FastAPI application exposing /chat
│   └── requirements.txt   # Backend dependencies
└── frontend
    ├── index.html         # Chat interface (Tailwind + marked.js)
    └── app.js             # Frontend logic for chat interactions
```

## Getting started

1. **Install backend dependencies**

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```

2. **Set your OpenAI API key**

   ```bash
   export OPENAI_API_KEY="your-key"
   ```

3. **Run the FastAPI server**

   ```bash
   uvicorn backend.main:app --reload
   ```

4. **Serve the frontend** (for example using Python's HTTP server):

   ```bash
   python -m http.server 8001 --directory frontend
   ```

5. **Open the app**

   Visit [http://localhost:8001](http://localhost:8001) in your browser. Ensure the backend is running on `http://localhost:8000`.

## Notes

- The `/chat` endpoint accepts text and optional file uploads. Files are currently logged server-side for future processing.
- Responses from the OpenAI API are returned as Markdown and rendered in the frontend using `marked.js`.
- CORS is enabled on the backend so the frontend and backend can run on different ports during development.

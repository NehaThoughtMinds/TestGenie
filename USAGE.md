# TestGenie — Usage

Backend (FastAPI):

- Install dependencies:

```bash
python -m pip install -r backend/requirements.txt
```

- Run the API server:

```bash
uvicorn backend.app:app --reload --port 8000
```

Frontend (development):

- Open `frontend/index.html` in a browser. For CORS-free local testing, run a static server from the `frontend` folder:

```bash
cd frontend
python -m http.server 5173
# then open http://localhost:5173 in your browser
```

How it works:

- Paste a Python module into the textarea and click **Generate**.
- The backend analyzes top-level functions and returns a pytest-compatible file (`test_generated.py`) that embeds the module and provides simple placeholder tests.

Notes & next steps:

- This is a minimal PoC. The generator provides starter tests and placeholders — you should refine inputs and assertions for production usage.
- If you want me to add CORS handling, richer value heuristics, or a file download button, tell me and I'll implement it.

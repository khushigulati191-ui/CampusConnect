# Smart Campus Helpdesk & Complaint Management System (Frontend)

A responsive React frontend where students submit campus complaints, track them by ID, browse their history and see every complaint in a First-In-First-Out queue. It runs entirely on mock data, so no backend is needed, and it is structured so you can plug in a Python API later.

**Stack:** React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · Lucide React · JavaScript (no TypeScript)

## Quick start

Requires **Node.js 18+** (check with `node -v`).

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally http://localhost:5173).

Other commands:

```bash
npm run build     # production build into /dist
npm run preview   # serve the production build locally
```

## Pages

| Route      | Page              | What it does                                                                                              |
| ---------- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| `/`        | Dashboard         | Welcome banner with quick ID lookup, 4 overview cards, quick actions, recent activity, next in queue, category chart |
| `/submit`  | Submit Complaint  | Validated form → generates a complaint ID → success toast + confirmation panel → added to history         |
| `/track`   | Track Complaint   | Search by ID (`?id=CMP-2026-0005`), shows status stepper, details and activity timeline                   |
| `/history` | Complaint History | Search, status tabs, category filter, sort; click a row for full details in a side drawer                 |
| `/queue`   | FIFO Queue        | Oldest first, queue positions (#1, #2…), Waiting / Processing / Served, "Process next in queue" demo action |

Loading skeletons, empty states and error states (with retry) are included wherever data is fetched.

Try these sample IDs on the Track page: `CMP-2026-0005`, `CMP-2026-0010`, `CMP-2026-0014`.

## Folder structure

```
smart-campus-helpdesk/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js        # design tokens: ink, brand indigo, coral, teal, mustard
├── postcss.config.js
├── .env.example              # API base URL + mock switch
└── src/
    ├── main.jsx              # providers + router
    ├── App.jsx               # route table
    ├── index.css             # Tailwind + shared classes (.card, .btn-*, .input)
    ├── constants/index.js    # nav items, categories, departments, status metadata, CURRENT_USER
    ├── data/mockComplaints.js# 14 realistic seed complaints
    ├── services/
    │   ├── api.js            # fetch wrapper, ApiError, USE_MOCK flag
    │   └── complaintService.js  # mock backend AND real backend calls (switch via .env)
    ├── context/
    │   ├── ComplaintsContext.jsx # complaints state, stats, FIFO ordering, add / change status
    │   └── ToastContext.jsx      # success / error notifications
    ├── utils/format.js       # date, "time ago" and waiting-time helpers
    ├── components/
    │   ├── layout/           # AppLayout, Sidebar (responsive drawer), Topbar
    │   ├── ui/               # PageHeader, StatCard, StatusBadge, CategoryBadge, Drawer, States
    │   └── complaints/       # ComplaintTable, ComplaintDetails, StatusStepper, ComplaintTimeline,
    │                         #   RecentActivity, CategoryBreakdown
    └── pages/                # Dashboard, SubmitComplaint, TrackComplaint, ComplaintHistory,
                              #   FifoQueue, NotFound
```

## Connecting your Python backend later

All data access goes through **`src/services/complaintService.js`**. No component calls `fetch` directly.

1. Copy `.env.example` to `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_USE_MOCK=false
   ```
2. Make your backend expose these endpoints (JSON):

   | Method | Path                          | Body                  | Returns       |
   | ------ | ----------------------------- | --------------------- | ------------- |
   | GET    | `/complaints`                 | –                     | `Complaint[]` |
   | GET    | `/complaints/{id}`            | –                     | `Complaint` (404 if unknown) |
   | POST   | `/complaints`                 | new complaint fields  | `Complaint`   |
   | PATCH  | `/complaints/{id}/status`     | `{ "status": "..." }` | `Complaint`   |

   ```json
   {
     "id": "CMP-2026-0015",
     "studentName": "Riya Sharma",
     "rollNo": "22CS1042",
     "department": "Computer Science",
     "category": "Wi-Fi",
     "title": "…",
     "description": "…",
     "location": "…",
     "status": "Pending",
     "createdAt": "2026-11-22T09:30:00Z",
     "updatedAt": "2026-11-22T09:30:00Z",
     "timeline": [{ "status": "Pending", "at": "2026-11-22T09:30:00Z", "note": "…" }]
   }
   ```
   `status` is one of `Pending`, `In Progress`, `Resolved`. If your API uses `snake_case`, convert in the `fromApi` / `toApi` functions at the top of `complaintService.js`.
3. Remember to enable CORS for `http://localhost:5173` on your backend.

Authentication: `CURRENT_USER` in `src/constants/index.js` is a placeholder that pre-fills the submit form and the top bar. Replace it with your logged-in user, and add a token header in `src/services/api.js`.

## Mock mode notes

- Mock data is saved to your browser's `localStorage` (key `smart-campus-helpdesk:complaints:v1`) so complaints you submit survive a refresh.
- To reset to the original sample data, clear that key in DevTools → Application → Local Storage (or run `localStorage.clear()` in the console) and reload.
- The "Process next in queue" button and the "Move to …" button in the queue drawer are **demo staff actions** to show how FIFO works. In a real system they would be admin-only.

## Design notes

The look combines your reference screens: the dark sidebar and bold coloured cards from the support-requests design, the clean stat cards and status pills from the ticket dashboards, the hero-style search and item cards from CampusFind, and the rounded form card from the report form, all tied together with one indigo primary colour. Design tokens live in `tailwind.config.js`.

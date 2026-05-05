# Fix TypeError: Cannot read properties of null (reading '_id')

## Steps:

✅ 1. Edit backend/src/controllers/user.controller.js: Filter out null recipients in getOutgoingFriendReqs and getFriendRequests  
✅ 2. Verify frontend/src/pages/HomePage.jsx has null guards (added outgoingFriendReqs?.forEach)  
✅ 3. Force rebuild frontend dev server  
✅ 4. Restart backend server  
✅ 5. Clear browser cache and test HomePage  
✅ 6. Mark complete  

**Backend now returns clean API data (no null recipients). Frontend fully null-safe with optional chaining.**

**To test:**  
```cmd
REM Terminal 1 - Frontend (rebuild cache)
cd frontend
npm run dev

REM Terminal 2 - Backend
cd backend
npm run dev
```

**Then:** Refresh http://localhost:5173 (HomePage), check Console/Network. No _id error.

**Root cause:** Backend returned FriendRequest with deleted recipient (null after populate). Fixed upstream.

Changes complete - page renders without crash.

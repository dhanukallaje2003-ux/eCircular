# Debug: Fix Compose.js "Failed to create circular"

## Status: 
- [x] Step 1: Made file field optional in Circular model (backend/models/Circular.js)
- [ ] Step 2: Restart backend: cd backend && npm start 
- [ ] Step 3: Test Compose form (with/without file)
- [ ] Step 4: Verify Dashboard shows new circulars (10s auto-refresh)
- [ ] Step 5: Task complete

## Root Cause Fixed:
Model `file: required: true` failed validation when no file uploaded.
Now `file: default: null` allows optional files.

Frontend FormData, endpoint `/api/circular/create`, multer all correct ✅

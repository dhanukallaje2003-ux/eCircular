# Dashboard Cleanup - Remove Recent Circulars Section

**Status:**
- [x] Step 1: Created TODO-dashboard.md  
- [ ] Step 2: Remove recent-section + unused functions from Dashboard.js
- [ ] Step 3: Test dashboard loads (stats + quick actions preserved)
- [ ] Step 4: Task complete

**Removals:**
- `formatDate()`, `getPriorityClass()` functions  
- Entire `.recent-section` div + table
- Update stats `recentCount` to reuse total

**Keep:**
- Stats cards, header, "New Circular" button, quick actions
- `circulars` state + fetch (needed for stats)


# Screenshots Guide

## Required Screenshots for README

Take these screenshots after running `pnpm dev`:

### 1. Homepage (`/`)
- Hero section with "Săn deal thông minh"
- Featured/hot deals section
- Category grid
- Footer

### 2. Deals Listing (`/deals`)
- Filter bar (platform, category, sort)
- Deal card grid
- Responsive on mobile viewport

### 3. Deal Detail (`/deals/[slug]`)
- Price comparison section
- Coupon strip
- Countdown timer
- Related deals

### 4. Search (`/search`)
- Search input with results
- Filter sidebar
- Empty state

### 5. Admin Dashboard (`/admin`)
- Pending deals moderation list
- Approval/rejection actions

### 6. Analytics (`/admin/analytics`)
- Stat cards (views, upvotes, bookmarks)
- Daily submissions chart

### 7. Notifications (`/notifications`)
- Notification list with type icons
- Unread highlighting

## Screenshot Settings

- Browser: Chrome 1200px wide (desktop), 390px wide (mobile)
- Theme: Light mode (default)
- Language: Vietnamese
- Data: Seeded test data should be visible
- Hide credentials from any visible auth forms

## How to Take

```bash
# Start dev servers
cd apps/api && pnpm start:dev
cd apps/web && pnpm dev

# Then use browser automation or manual screenshot
```

For best results: use Playwright screenshot API or browser DevTools.

git add apps/api/src/auth/auth.controller.ts apps/api/src/auth/dto/auth.dto.ts apps/api/prisma/seed.ts docs/testing.md apps/web/src/app/\(site\)/auth/login/page.tsx
git commit -m "fix(auth): replace dto: any with typed LoginBody interface

- Replace LoginDto class with LoginBody interface to avoid @typescript-eslint/no-explicit-any
- Align seed admin email with working credentials (admin@dealxin.com)
- Fix testing.md test users table with correct passwords
- Fix demo credentials box in login page

Co-Authored-By: Claude <noreply@anthropic.com>"

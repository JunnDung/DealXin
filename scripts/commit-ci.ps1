git commit -m "ci: add API lint step and enforce strict test blocking

- Add pnpm --filter api lint to lint-and-typecheck job
- Remove continue-on-error: true from test job
- CI now fails on lint errors, type errors, or test failures

Co-Authored-By: Claude <noreply@anthropic.com>"

# Security guidelines

- Never commit secrets or API keys; use environment variables.
- Validate and sanitize all user inputs at boundaries (e.g. Zod).
- Use prepared statements / parameterized queries for all DB access.
- Implement proper CORS and CSRF handling where applicable.
- Do not log sensitive data; handle auth errors without leaking details.

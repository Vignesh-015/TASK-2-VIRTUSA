/*
 * core/
 * ─────
 * This folder will hold singleton services, HTTP interceptors, and route
 * guards that must exist for the entire app lifetime.
 *
 * Planned contents (to be added in later tasks):
 *   - auth.service.ts       — token storage, login/logout calls
 *   - auth.guard.ts         — CanActivate: redirect to /auth/login if not logged in
 *   - auth.interceptor.ts   — attaches Authorization header to every API request
 *   - core.module.ts        — imports the above and is imported once in AppModule
 *
 * Do NOT add components here. Components belong in features/ or layout/.
 */

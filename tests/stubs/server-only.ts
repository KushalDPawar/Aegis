// Test-only stub: the real "server-only" package throws when imported
// outside Next.js's react-server bundling condition, which includes plain
// Vitest/Node runs. Business-logic modules under test are safe to import
// here since nothing in this test suite renders them as client components.
export {};

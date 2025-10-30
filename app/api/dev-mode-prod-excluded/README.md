# Development API Endpoints

This folder contains API endpoints that are **excluded from production builds**.

## How it works

The `next.config.js` webpack configuration uses `ignore-loader` to exclude any files in `dev-mode-prod-excluded/` folders when building for production:

```javascript
if (!options.dev && options.isServer) {
  config.module.rules.push({
    test: /\/dev-mode-prod-excluded\/.*$/i,
    loader: 'ignore-loader',
  })
}
```

## Adding new dev endpoints

1. Create your route in `app/api/dev-mode-prod-excluded/your-endpoint/route.ts`
2. The endpoint will be available at `/api/dev-mode-prod-excluded/your-endpoint` in development
3. It will be automatically excluded from production builds

## Best practices

- Always add a `NODE_ENV` check as a safety measure
- Document the endpoint's purpose and usage
- Keep dev-only dependencies isolated

## Available endpoints

- `/api/dev-mode-prod-excluded/capture-test-data` - Capture test data snapshots from real API calls

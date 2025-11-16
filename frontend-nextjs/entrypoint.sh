#!/bin/sh
# Entrypoint script to inject runtime environment variables

# Create env-config.js with actual runtime environment variables
cat > /app/public/env-config.js << EOF
window.__ENV__ = {
  NEXT_PUBLIC_API_URL: '${NEXT_PUBLIC_API_URL:-http://localhost:8080}',
  BETTER_AUTH_URL: '${BETTER_AUTH_URL:-http://localhost:3000}',
};
EOF

echo "Environment variables injected into env-config.js:"
cat /app/public/env-config.js

# Start the Next.js server
exec node server.js

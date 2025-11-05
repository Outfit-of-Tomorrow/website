#!/bin/bash
# Script to generate config.js from environment variables
# Used for local development and CI/CD

cat > scripts/config.js << EOF
// Configuration file - Generated from environment variables
// DO NOT COMMIT THIS FILE

export const CONFIG = {
  // Sanity.io API token
  sanityToken: "${SANITY_TOKEN}",
  
  // Firebase configuration
  firebase: {
    apiKey: "${FIREBASE_API_KEY}",
    authDomain: "${FIREBASE_AUTH_DOMAIN}",
    projectId: "${FIREBASE_PROJECT_ID}",
    storageBucket: "${FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${FIREBASE_APP_ID}",
    measurementId: "${FIREBASE_MEASUREMENT_ID}"
  }
};
EOF

echo "✓ config.js generated successfully"


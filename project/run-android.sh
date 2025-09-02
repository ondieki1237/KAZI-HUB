#!/bin/bash
echo "🚀 Building web assets..."
npm run build || exit 1

echo "📦 Copying to Android..."
npx cap copy android || exit 1

echo "🔄 Syncing Capacitor..."
npx cap sync android || exit 1

echo "📂 Opening Android Studio..."
npx cap open android

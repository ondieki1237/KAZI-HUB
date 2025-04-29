#!/bin/bash

echo "⚡ Setting up Android SDK location..."

# Create local.properties with correct SDK path
echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties

echo "⚡ Deleting old android folder (if exists)..."
rm -rf android

echo "⚡ Adding Android platform..."
npx cap add android

echo "⚡ Building the app (npm run build)..."
npm run build

echo "⚡ Copying web assets to native project (npx cap copy)..."
npx cap copy

echo "⚡ Moving into Android directory..."
cd android

echo "⚡ Building APK (Gradle assembleDebug)..."
./gradlew assembleDebug

echo "✅ Done! Your APK is located at:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"

echo "⚡ If you want, you can install it on your phone with:"
echo "   adb install -r app/build/outputs/apk/debug/app-debug.apk"

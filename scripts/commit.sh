#!/bin/bash

set -e

echo "🧹 Running format..."
npm run format

echo ""
echo "🔍 Running lint..."
npm run lint

echo ""
echo "🏗️  Running build..."
npm run build

echo ""
echo "🧪 Running tests..."
npm run test -- --run

echo ""
echo "✅ All checks passed!"
echo ""

git add .

echo "📝 Enter commit message:"
read -r commit_message

if [ -z "$commit_message" ]; then
  echo "❌ Commit message cannot be empty"
  exit 1
fi

git commit -m "$commit_message"
git push

echo ""
echo "🚀 Committed and pushed successfully!"

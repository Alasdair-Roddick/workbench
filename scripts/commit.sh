#!/bin/bash

all_passed=true

echo "🧹 Running format..."
if npm run format; then
  echo "✓ Format passed"
else
  echo "✗ Format failed"
  all_passed=false
fi

echo ""
echo "🔍 Running lint..."
if npm run lint; then
  echo "✓ Lint passed"
else
  echo "✗ Lint failed"
  all_passed=false
fi

echo ""
echo "🏗️  Running build..."
if npm run build; then
  echo "✓ Build passed"
else
  echo "✗ Build failed"
  all_passed=false
fi

echo ""
echo "🧪 Running tests..."
if npm run test -- --run; then
  echo "✓ Tests passed"
else
  echo "✗ Tests failed"
  all_passed=false
fi

echo ""

# test e2e
echo "🧪 Running end-to-end tests..."
if npm run test:e2e; then
  echo "✓ End-to-end tests passed"
else
  echo "✗ End-to-end tests failed"
  all_passed=false
fi
echo ""


if [ "$all_passed" = false ]; then
  echo "❌ Some checks failed. Skipping commit."
  exit 1
fi

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

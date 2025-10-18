#!/bin/bash
echo "🚀 Building static frontend..."
echo "📁 Copying files..."
cp ./test-frontend.html ./index.html
echo "✅ Frontend ready for deployment!"
echo "📊 Files:"
ls -la ./*.html

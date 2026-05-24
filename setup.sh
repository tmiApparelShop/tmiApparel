# Initialize Vite project
npm create vite@latest tmiapparel -- --template react

# Move into directory
cd tmiapparel

# Install dependencies
npm install @supabase/supabase-js lucide-react

# Create initial folder structure
mkdir -p src/components

# Create a template .env file
echo "VITE_SUPABASE_URL=https://omwsbbpypjgcxpxznkvd.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9td3NiYnB5cGpnY3hweHpua3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDg0OTAsImV4cCI6MjA5MjUyNDQ5MH0.KupZAIYilz8fYl4hzLdvROqkBU-XavJFx95tsw6WISY" >> .env

echo "Setup complete. Open the tmiapparel folder in your editor."

# Use bash

set shell := ["bash", "-cu"]

# Pull Vercel project settings (rarely needed)
pull:
    npx vercel pull --yes

# Build for preview
build:
    npx vercel build

# Build for production
build-prod:
    npx vercel build --prod

# Deploy preview build
deploy-preview:
    npx vercel deploy --prebuilt

# Deploy production
deploy:
    npx vercel build --prod
    npx vercel deploy --prebuilt --prod

# Clean local artifacts
clean:
    rm -rf .vercel/output

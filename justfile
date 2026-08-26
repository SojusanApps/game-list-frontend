# Show the list of available commands
help:
    just --list

# Install all dependencies and generate the API client
install:
    pnpm install --frozen-lockfile
    pnpm openapi-ts

# Start the development server (regenerates the API client first)
dev:
    pnpm dev

# Build the production bundle
build:
    pnpm build

# Lint the code
lint:
    pnpm lint

# Type-check the code
typecheck:
    pnpm typecheck

# Check that the code is formatted
format_check:
    pnpm oxfmt --check .

# Format the code
format:
    pnpm format

# Run all tests
test:
    pnpm test

# Run tests with a coverage report
coverage:
    pnpm coverage

# Install the prek git hooks
hooks_install:
    pnpm exec prek install --hook-type pre-commit --hook-type pre-push

# Build the production Docker image. VITE_* build args are read from the environment.
docker_build tag='latest':
    docker build \
        --build-arg VITE_API_URL={{ env('VITE_API_URL') }} \
        --build-arg VITE_KEYCLOAK_URL={{ env('VITE_KEYCLOAK_URL') }} \
        --build-arg VITE_KEYCLOAK_REALM={{ env('VITE_KEYCLOAK_REALM') }} \
        --build-arg VITE_KEYCLOAK_CLIENT_ID={{ env('VITE_KEYCLOAK_CLIENT_ID') }} \
        -t ghcr.io/sojusanapps/game-list-frontend:{{ tag }} .

# Push the production Docker image to ghcr.io
docker_push tag='latest':
    docker push ghcr.io/sojusanapps/game-list-frontend:{{ tag }}

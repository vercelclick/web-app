# ==============================================================================
# Packaging make file
# ==============================================================================

.SILENT:

# Default target when running `make`
all: install build-local build-cloud


install:
	@echo "==> Install npm packages"
	bun install

build:
	@echo "==> Build local UI"
	NODE_ENV=production \
	VITE_CLOUD_API_BASE_URL=https://api.secretpass.cloud \
	VITE_LOCAL_API_BASE_URL=https://localhost:20206 \
	bun run build

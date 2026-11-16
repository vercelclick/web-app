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
	@echo "==> Build vault UI"
	NODE_ENV=production \
	VITE_CLOUD_API_BASE_URL=https://api.vercel.click \
	bun run build

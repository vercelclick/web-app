# ==============================================================================
# Packaging make file
# ==============================================================================

.SILENT:

# Default target when running `make`
all: install build-local build-cloud


install:
	@echo "==> Install npm packages"
	bun install

build-prod:
	@echo "==> Build vault UI"
	NODE_ENV=production \
	VITE_LOCAL_SERVICE_PORT=20206 \
	VITE_LOCAL_API_ORIGIN=click.localhost \
	VITE_CLOUD_API_BASE_URL=https://api.vercel.click \
	bun run build

bundle-vercel:
	@echo "==> Bundle UI for deployment on Vercel"
	rm -rf .vercel
	mkdir -p .vercel/output/static
	cp -R dist/. .vercel/output/static/
	printf '{"version":3,"routes":[{"handle":"filesystem"},{"src":"/.*","dest":"/index.html"}]}\n' > .vercel/output/config.json
	mkdir -p .vercel
	printf '{"orgId":"%s","projectId":"%s"}\n' "$$VERCEL_ORG_ID" "$$VERCEL_PROJECT_ID" > .vercel/project.json
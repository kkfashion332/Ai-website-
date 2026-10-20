# KK Fashion — complete source export

Every original file in this export is byte-for-byte unchanged. The frontend, styling, images, storefront, hidden admin panel, Firebase configuration, bulk upload, and AI logic have not been rewritten or changed. SOURCE-MANIFEST.json lists the original files and their SHA-256 checksums.

## Main files

- `src/router.tsx`: router bootstrap.
- `src/routes/__root.tsx`: document shell, fonts, shared page setup.
- `src/routes/index.tsx`: customer storefront and hidden admin access.
- `src/components/shop/AdminPanel.tsx`: multiple-photo upload, AI staging, publishing.
- `src/components/shop/ProductCard.tsx`: product cards.
- `src/lib/firebase.ts`: supplied Firebase configuration, product reads and writes.
- `src/lib/ai.functions.ts`: server-side AI image analysis.
- `src/styles.css`: complete Tailwind v4 styles and design tokens.
- `src/start.ts` and `src/server.ts`: server middleware and entry.
- `src/assets/`: all four original banner images.

This project uses React 19, TypeScript and TanStack Start, not App.jsx or a static HTML app. Tailwind v4 is configured in src/styles.css; there is no separate tailwind.config.js.

## Run locally

Install a current Node.js version supported by Vite and Bun. From this folder:

```sh
bun install --frozen-lockfile
bun run dev
```

The development URL is printed by the command. Run tests with `bun run test`.

## Hosting

Official self-hosting guide: https://docs.lovable.dev/tips-tricks/self-hosting

The current Vite configuration uses Lovable's TanStack configuration and a Cloudflare-targeted server build. It is not a ready-made generic Node server or static-only cPanel upload. Follow the hosting guide and your host's TanStack Start deployment instructions; adapting the deployment configuration for another server can be necessary. No deployment configuration was altered in this exact-source export. Self-hosted installation and deployment have not been tested.

AI image analysis currently depends on the Lovable AI Gateway and a private server-side LOVABLE_API_KEY supplied by Lovable. No private keys are included in this ZIP. AI will not work automatically on a different server: arrange a supported external-hosting configuration with Lovable, or separately adapt the AI server function to your own provider. Never put private AI credentials in frontend code. A Gemini API key is not a drop-in replacement for the current gateway key.

The Firebase web configuration is intentionally public and is included exactly as supplied. Firebase database contents and Firebase Console access rules are external services, not source files. They are not exported in this ZIP. The last verification reported that the project's Cloud Firestore API was disabled; enable Firestore and create its database if that remains unresolved. Firestore rules control access; the three-logo-tap gesture is not authentication. Do not make database writes public merely to bypass a permission error.

## Optional GitHub sync

In Lovable, open Project settings → Git, choose GitHub, and follow the account authorization and repository connection prompts. Connecting creates a new private repository. After connection, GitHub's Code → Download ZIP also downloads the repository.

## Intentionally excluded

Git metadata, editor/workspace metadata, dependency folders, installed packages, generated build output, environment secrets, and server credentials. Dependencies are restored from package.json and bun.lock. Original application logic, styling, images, tests, and configuration are included.

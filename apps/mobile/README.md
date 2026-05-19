# PublicProof mobile companion (stub)

Hermes roadmap calls for an Expo/React Native shell. This workspace keeps the scaffolding minimal so installs stay optional:

```bash
cd apps/mobile
bun create expo .   # or: bunx create-expo-app@latest . --yes
bun run start
```

Then wire authenticated calls to `/api/public-proof/mobile/*` once the Next.js route handlers graduate past their `501` stubs.

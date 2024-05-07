# gucci

quickstart:

```bash
bun create spirobel/gucci yournewproject
```

barebones quickstart:

```bash
bun create spirobel/aldi yournewproject
```

if you don't have bun installed, run first:

```bash
curl -fsSL https://bun.sh/install | bash # for macOS, Linux, and WSL
```

To install dependencies:

```bash
bun install
```

dev:

```bash
bun run dev
```

production:

```bash
bun run start
```

build:

```bash
bun run build
```

migrations:

```bash
bun run db:mm # to make migrations, after editing the schema.ts file
bun run db:migrate
```

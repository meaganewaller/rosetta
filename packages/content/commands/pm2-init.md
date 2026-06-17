# PM2 Init

Scan the project, detect services, and generate PM2 configuration and command files.

## Usage

```
/pm2-init
```

## Service detection

| Type | Detection | Default port |
|------|-----------|--------------|
| Vite | `vite.config.*` | 5173 |
| Next.js | `next.config.*` | 3000 |
| Nuxt | `nuxt.config.*` | 3000 |
| CRA | `react-scripts` in package.json | 3000 |
| Express/Node | server/backend/api dir + package.json | 3000 |
| FastAPI/Flask | `requirements.txt` / `pyproject.toml` | 8000 |
| Go | `go.mod` / `main.go` | 8080 |

Port resolution priority: argument > `.env` > config file > script args > default.

## What gets generated

```
project/
├── ecosystem.config.cjs
├── {backend}/start.cjs           # Python wrapper, if needed
└── .claude/commands/
    ├── pm2-all.md
    ├── pm2-all-stop.md
    ├── pm2-all-restart.md
    ├── pm2-{port}.md
    ├── pm2-{port}-stop.md
    ├── pm2-{port}-restart.md
    ├── pm2-logs.md
    └── pm2-status.md
```

## ecosystem.config.cjs

Use `.cjs` extension. Node.js services specify the bin path directly; Python services use a Node.js wrapper.

```javascript
module.exports = {
  apps: [
    // Node.js (Vite example)
    {
      name: 'project-5173',
      cwd: './packages/web',
      script: 'node_modules/vite/bin/vite.js',
      args: '--port 5173',
      interpreter: 'C:/Program Files/nodejs/node.exe',
      env: { NODE_ENV: 'development' }
    },
    // Python
    {
      name: 'project-8000',
      cwd: './backend',
      script: 'start.cjs',
      interpreter: 'C:/Program Files/nodejs/node.exe',
      env: { PYTHONUNBUFFERED: '1' }
    }
  ]
}
```

Framework script paths:

| Framework | `script` | `args` |
|-----------|----------|--------|
| Vite | `node_modules/vite/bin/vite.js` | `--port {port}` |
| Next.js | `node_modules/next/dist/bin/next` | `dev -p {port}` |
| Nuxt | `node_modules/nuxt/bin/nuxt.mjs` | `dev --port {port}` |
| Express | `src/index.js` or `server.js` | — |

## Python wrapper (start.cjs)

```javascript
const { spawn } = require('child_process');
const proc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
  cwd: __dirname, stdio: 'inherit', windowsHide: true
});
proc.on('close', (code) => process.exit(code));
```

## Command file format

Each `.claude/commands/pm2-*.md` file contains a one-line description and a single bash block. Example:

````markdown
Start all services and open PM2 monitor.
```bash
cd "{PROJECT_ROOT}" && pm2 start ecosystem.config.cjs && start wt.exe -d "{PROJECT_ROOT}" pwsh -NoExit -c "pm2 monit"
```
````

## After generating files

Append a PM2 section to the project's `CLAUDE.md` (create if missing, replace if section exists) listing services and common commands. Then display a completion summary showing detected services, generated commands, and first-run instructions.
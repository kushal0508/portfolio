# MCP Server Installation & Configuration Report

## Summary
All 13 MCP servers have been **installed, configured, and verified** as connected in OpenCode.

---

## MCP Server Status Table

| MCP Name | Purpose | Status | Trigger Keywords | Installation Method | Version |
|----------|---------|--------|------------------|---------------------|---------|
| **codebase-memory-mcp** | Codebase knowledge graph, search, navigation | ✅ Connected | `search`, `find`, `code`, `function`, `class`, `import` | Binary: `/home/kushal/.local/bin/codebase-memory-mcp` | 1.0.0 |
| **@21st-dev/magic** | UI component generation, design | ✅ Connected | `ui`, `design`, `component`, `landing page`, `shadcn`, `tailwind`, `hero`, `dashboard` | Binary: `/home/kushal/node_modules/.bin/magic` | 0.1.0 |
| **playwright** | Browser automation, E2E testing | ✅ Connected | `playwright`, `browser`, `e2e`, `test`, `automation`, `screenshot`, `click` | Binary: `/home/kushal/node_modules/.bin/playwright-mcp` | 0.0.78 |
| **serena** | Codebase analysis, refactoring, navigation | ✅ Connected | `serena`, `refactor`, `rename`, `architecture`, `codebase`, `references`, `go to definition` | Binary: `/home/kushal/.local/bin/serena` | 0.9.1 |
| **context7** | Library documentation lookup | ✅ Connected | `docs`, `documentation`, `library`, `api`, `how to`, `example` | Remote: `https://mcp.context7.com/mcp` | 3.2.4 |
| **shadcn-ui-mcp** | shadcn/ui component generation | ✅ Connected | `shadcn`, `ui`, `component`, `button`, `card`, `modal`, `form` | Binary: `/home/kushal/node_modules/.bin/shadcn-mcp` | 0.0.1 |
| **shadcn-studio-mcp** | shadcn studio component generation | ✅ Connected | `shadcn studio`, `studio`, `component`, `ui` | Binary: `/home/kushal/node_modules/.bin/shadcn-mcp` | 1.0.0 |
| **chrome-devtools** | Browser debugging, performance, network | ✅ Connected | `css`, `html`, `inspect`, `devtools`, `lighthouse`, `network`, `console`, `performance`, `layout` | Binary: `/home/kushal/node_modules/.bin/chrome-devtools-mcp` | 1.6.0 |
| **filesystem** | File system operations (read/write/list) | ✅ Connected | `file`, `directory`, `folder`, `read file`, `write file`, `list files`, `find file` | Binary: `/home/kushal/node_modules/.bin/mcp-server-filesystem` | 2026.7.10 |
| **github** | GitHub repository operations | ✅ Connected | `github`, `repo`, `commit`, `push`, `pull`, `pr`, `issue`, `branch`, `release` | Binary: `/home/kushal/node_modules/.bin/mcp-server-github` | 2025.4.8 |
| **memory** | Persistent knowledge storage | ✅ Connected | `remember`, `recall`, `memory`, `store`, `retrieve`, `knowledge`, `note` | Binary: `/home/kushal/node_modules/.bin/mcp-server-memory` | 2026.7.4 |
| **puppeteer** | Browser automation with Puppeteer | ✅ Connected | `puppeteer`, `headless`, `chrome`, `automation`, `screenshot`, `pdf` | Binary: `/home/kushal/node_modules/.bin/mcp-server-puppeteer` | 2025.5.12 |
| **everything** | Comprehensive tool access | ✅ Connected | `everything`, `all tools`, `full access`, `comprehensive` | Binary: `/home/kushal/node_modules/.bin/mcp-server-everything` | 2026.7.4 |

---

## Lazy Loader Keyword Routing

The MCP lazy loader (`/home/kushal/.config/opencode/plugins/mcp-lazy-loader.ts`) is configured with intelligent keyword routing:

| Category | MCPs Activated | Sample Keywords |
|----------|---------------|-----------------|
| **GitHub Operations** | `github` | `github`, `repo`, `commit`, `push`, `pull`, `pr`, `issue`, `branch` |
| **Browser Testing** | `playwright` | `playwright`, `e2e`, `test`, `automation`, `screenshot` |
| **Browser Debugging** | `chrome-devtools`, `puppeteer` | `css`, `html`, `devtools`, `lighthouse`, `network`, `performance` |
| **Code Analysis** | `serena` | `serena`, `refactor`, `rename`, `architecture`, `references`, `go to definition` |
| **UI Generation** | `@21st-dev/magic`, `shadcn-ui-mcp`, `shadcn-studio-mcp` | `ui`, `design`, `component`, `landing page`, `shadcn`, `tailwind`, `hero` |
| **File Operations** | `filesystem` | `file`, `directory`, `read file`, `write file`, `list files` |
| **Memory/Knowledge** | `memory`, `everything` | `remember`, `recall`, `memory`, `store`, `retrieve` |
| **Full Access** | `everything` | `everything`, `all tools`, `full access` |

**Always-on MCPs:** `codebase-memory-mcp`, `context7` (always available without keyword matching)

---

## Installation Methods Used

| Method | MCPs Installed |
|--------|----------------|
| **Local binary** | `codebase-memory-mcp`, `serena` (installed in `/home/kushal/.local/bin/`) |
| **npm local install** | All `@modelcontextprotocol/*` servers, `@playwright/mcp`, `@21st-dev/magic`, `@jpisnice/shadcn-ui-mcp-server`, `shadcn-studio-mcp`, `chrome-devtools-mcp`, `@upstash/context7-mcp` |
| **pip install --user --break-system-packages** | `serena` (Python) |
| **Remote** | `context7` (https://mcp.context7.com/mcp) |

---

## Lazy Loader Configuration

The lazy loader at `/home/kushal/.config/opencode/plugins/mcp-lazy-loader.ts` is active and configured with:

- **Auto-connect** on keyword match
- **Auto-disconnect** after 5 minutes of inactivity
- **Smart keyword matching** with lowercase normalization
- **Default MCPs**: `codebase-memory-mcp`, `context7` (always on)
- **Logging**: Console output when MCPs auto-connect

---

## Verification

All 13 MCP servers show **✅ Connected** status in `opencode mcp list`.

**Ready for automatic activation based on user intent.**
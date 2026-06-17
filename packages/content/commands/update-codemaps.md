# Update Codemaps

Scan the codebase and update architecture documentation.

1. Analyze source files — imports, exports, dependencies, structure
2. Update or create codemaps in `docs/CODEMAPS/` based on what the project actually contains — typical files include:
   - `architecture.md` — overall system structure
   - `modules.md` — module/package breakdown
   - `data.md` — data models and schemas
   - Others as appropriate for the project's shape
3. If changes exceed 30% from the previous version, show a diff summary and request approval before writing
4. Add a `Last Updated` timestamp to each file
5. Save a diff summary to `.reports/codemap-diff.txt`

Focus on high-level structure, not implementation details. Keep each codemap under 500 lines.
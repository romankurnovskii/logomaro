---
description: Rule for maintaining LLM context files when main features change
globs:
  - 'src/**/*.tsx'
  - 'src/**/*.ts'
  - 'src/App.tsx'
alwaysApply: true
---

# LLM Context Files Maintenance Rule

## Critical Requirement: Update LLM Context Files on Feature Changes

When making changes to **main features** of the application, you **MUST** update the following files to keep AI context documentation in sync:

- `public/llms.txt` - Concise summary file
- `public/llms-full.txt` - Full authoritative context file

## What Constitutes a "Main Feature Change"

Update the LLM context files when you modify:

1. **Core Application Features:**
   - New major features or functionality
   - Significant changes to existing features
   - Changes to user-facing functionality
   - New components that represent key features
   - Changes to data models or data structures
   - New integrations or third-party services

2. **User Experience Changes:**
   - New user workflows
   - Changes to main UI/UX patterns
   - New user interactions or capabilities
   - Changes to how users accomplish primary tasks

3. **Technical Stack Changes:**
   - New major dependencies or frameworks
   - Changes to core architecture
   - New platform support (iOS, Android, Web)
   - Changes to deployment or hosting

## What Does NOT Require Updates

- Bug fixes (unless they change feature behavior)
- Code refactoring without feature changes
- Performance optimizations
- Test updates
- Documentation updates (other than these LLM files)
- Configuration changes
- Dependency updates (unless they add new capabilities)

## Update Process

When a main feature change is detected:

1. **Review the changes** to understand what features were added/modified/removed
2. **Update `public/llms-full.txt`:**
   - Update Section 4 (Feature Set & Semantic Keywords) with new features
   - Update Section 1 (Project Overview) if positioning changed
   - Update Section 2 (Job to Be Done) if user problems/solutions changed
   - Update Section 6 (Concise Summary) if the core value proposition changed

3. **Update `public/llms.txt`:**
   - Create a concise summary that reflects current main features
   - Include key features, tech stack, and value proposition
   - Keep it brief but comprehensive

4. **Commit the LLM context files** along with the feature changes in the same commit

## Current Project Features (Reference)

Based on the current codebase:

- **Core Features:**
  - Firestore data management (CRUD operations)
  - Real-time data fetching and display
  - Mock data seeding functionality
  - Item list management with timestamps
  - Loading and error states handling

- **Tech Stack:**
  - React 19 with TypeScript
  - Vite for build tooling
  - Firebase Firestore for backend
  - Tailwind CSS for styling
  - Vitest + React Testing Library for testing

- **Platforms:**
  - Web (primary)
  - Responsive design for mobile/desktop

## Example Update Scenario

**If you add a new feature like "User Authentication":**

1. Update `llms-full.txt` Section 4:

   ```
   * **Core Features:** Firestore data management, User Authentication, Real-time data sync, Mock data seeding, Item list management
   ```

2. Update `llms.txt`:

   ```
   React + Vite + Firebase Firestore application with user authentication, real-time data management, and item CRUD operations.
   ```

3. Commit both feature code and updated LLM files together

## Enforcement

- **Pre-commit reminder:** The AI assistant should check if main features changed and prompt to update LLM files
- **Code review:** Verify LLM context files are updated when reviewing feature PRs
- **Documentation sync:** Keep LLM files as the single source of truth for AI agents about project features

---

**Remember:** These files help AI assistants understand your project. Keeping them updated ensures accurate AI assistance and better project documentation.

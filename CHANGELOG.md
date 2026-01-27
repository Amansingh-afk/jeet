# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-20

### Added
- Initial frontend MVP with React, TypeScript, and Vite
- Backend API setup with Node.js, Hono, and PostgreSQL
- Content pipeline for managing patterns and questions
- Database migration system
- Embedding generation scripts for semantic search
- Variations question support for pattern matching
- Jeet/Studio content pipeline integration
- New patterns and questions for SSC exam preparation
- Documentation and roadmap
- Gitignore configuration

### Changed
- UI theme revamp for improved user experience
- Dependency updates and version bumps

### Fixed
- UI theme issues and improvements
- Documentation updates to reflect content pipeline
- Gitignore configuration

---

## [Unreleased]

### Added
- Versioned prompt management system (`backend/src/config/prompts.ts`)
  - Semantic versioning for all LLM prompts
  - Historical versions preserved for rollback
  - Changelog tracking per prompt
- New frontend pages for enhanced user experience
  - Practice page with multiple practice modes
  - QuickPractice page for rapid question solving
  - History page to track user progress and past sessions
  - Topics page for subject selection
  - SubjectTopics page for topic browsing within subjects
  - TopicDetail page for pattern exploration within topics
- New reusable UI components
  - Bottom navigation bar for mobile navigation
  - Pattern card component for displaying pattern information
  - Progress bar component for tracking completion
  - Subject card component for subject selection
  - Topic card component for topic browsing
- New percentage patterns (pc-013 through pc-021) with corresponding questions
- Content pipeline documentation updates

### Changed
- **Content Generator Pipeline** - Improved JSON generation accuracy
  - Pattern generation prompt (v1.1.0) now includes exact JSON schema template
  - Question generation prompt (v1.1.0) includes schemas for both full questions and variations
  - Added cleanup/sanitization functions to enforce schema compliance
  - Null values are now omitted instead of included in output
  - Extra/invalid fields are automatically stripped
  - TypeScript interfaces updated to match actual schema
- **Jeetu Bhaiya Persona (v1.1.0)** - Improved natural Hinglish tone
  - Prompt now written IN Hinglish, not ABOUT Hinglish
  - Added concrete response examples for each teaching level (instant/shortcut/deep)
  - Natural filler words: "dekh", "matlab", "basically", "toh"
  - Exam-focused context: "CGL mein ye pattern aaya tha"
  - Removed forced phrases like "Samjha?" at every response end
  - User prompt builder simplified with level-specific instructions
- Frontend UI improvements
  - Enhanced chat hero component with better UX
  - Improved site header with better navigation
  - Updated focus mode toggle functionality
  - Refined sidebar configuration
  - Enhanced AskJeet page interface
  - Updated Dashboard layout and styling
  - Improved global CSS styling
- Content updates for existing patterns (pc-009 through pc-012) and their questions
- Updated question variations for pc-005-q-006

### Removed
- Ratio-proportion pattern pc-010 and its associated question (moved to percentage topic)

### Fixed
- Studio pipeline generating invalid JSON with wrong/extra fields
- Pattern JSON missing required fields or having null values
- Question JSON including source with all null values instead of omitting

---

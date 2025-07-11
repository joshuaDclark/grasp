# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Grasp is a Chrome browser extension for saving web pages with contextual notes and tags. It captures enhanced metadata including featured images, descriptions, and article metadata for rich previews.

## Architecture

This is a Manifest V3 Chrome extension with a simple architecture:

- **manifest.json**: Extension configuration with permissions for activeTab, storage, and scripting
- **popup.html/popup.js**: Main UI - tabbed interface for saving pages and viewing bookmarks list
- **styles.css**: CSS styling for 350px popup with card-based bookmark display
- **Storage**: Uses chrome.storage.local for bookmark persistence

### Key Components

**popup.js** contains the main functionality:
- Tab management system (`getCurrentTab()` at popup.js:42)
- Enhanced metadata extraction (`extractFeaturedImage()` at popup.js:295) - captures Open Graph data, images, author, publish dates
- Bookmark storage with rich metadata (popup.js:122-137)
- Link preview system for hover previews (popup.js:373-425)
- Event handling for keyboard shortcuts (Ctrl/Cmd+Enter to save)

**Data Structure**: Bookmarks include title, url, reason, tag, timestamp, favicon, plus enhanced metadata (featuredImage, description, siteName, publishedTime, author, contentType).

## Development

### Loading the Extension
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory
4. Extension appears in browser toolbar

### Testing Changes
- Make code changes
- Click refresh button on extension card in `chrome://extensions/`
- Test functionality in popup

### No Build Process
This extension uses vanilla JavaScript with no build tools, package.json, or dependencies. Changes are immediately testable after refresh.

## Key Files

- **popup.js:258-331**: Enhanced metadata extraction logic
- **popup.js:110-125**: Bookmark data structure definition
- **popup.js:218-265**: Bookmark list rendering with rich cards
- **styles.css**: Contains all styling including hover effects and card layouts
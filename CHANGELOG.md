# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Quote authors in `<cite>` are prefixed with an en-dash, no space

## [0.0.2] - 2026-08-19

### Added

- Quiet footer with links to dergigi.com and the thoughts feed

### Changed

- Index is a date-and-title log; each line is a real URL for that piece
- Opening a line loads the full post from the live RSS feed
- Post date links to the original on dergigi.com

### Removed

- GSD runtime, skills, and planning files
- The extra "On dergigi.com" line at the end of a piece

## [0.0.1] - 2026-08-19

### Added

- Local Vite reading site that loads https://dergigi.com/thoughts.xml at runtime
- Newest-first river of title, UTC date, and sanitized HTML
- Root-relative feed URLs rewritten to https://dergigi.com
- Quiet empty state when the feed fails or has no items
- Light paper reading surface

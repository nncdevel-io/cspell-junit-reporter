# Claude Code Configuration

This directory contains Claude Code integration files for the cspell-junit-reporter project.

## Structure

- `hooks/SessionStart.sh` - Runs at the start of each Claude Code session to:
  - Install dependencies if needed
  - Build the TypeScript project
  - Run tests to verify the project is ready

- `commands/` - Custom slash commands available in Claude Code:
  - `/test-coverage` - Run tests with coverage analysis
  - `/build-and-test` - Clean build and run all tests
  - `/format-code` - Format code with Prettier

## Usage

When starting a Claude Code session, the SessionStart hook will automatically:
1. Check and install npm dependencies
2. Compile TypeScript files
3. Verify tests pass

This ensures the development environment is always ready to work.

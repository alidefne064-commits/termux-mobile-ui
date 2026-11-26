# Terminal Pocket

A free Expo/React Native terminal-style mobile UI prototype, inspired by the welcome screen shown in the project conversation.

## Run it

1. Install Node.js (LTS).
2. In this repository, run `npm install`.
3. Run `npx expo start` and open the project with Expo Go, or press `a` to launch an Android emulator.

## Included

- Dark, monospace terminal interface with a familiar welcome screen.
- Editable command prompt and command history (Arrow Up/Down where supported).
- Safe demonstration commands: `help`, `clear`, `date`, `pwd`, `ls`, `whoami`, `echo`, and simulated `pkg` commands.
- Android and iOS app configuration; Android preview builds can be created with EAS Build.

## Important safety note

This is a UI prototype with a deliberately simulated command handler. It does **not** execute shell commands, access the device shell, download packages, or modify the phone. Unknown commands return a safe-mode message. This keeps the prototype from pretending to provide Termux's real capabilities.

## Android build

Install and configure EAS CLI, then run `npm run build:android`. A free Expo account is sufficient to get started; store publishing may require a separate developer account and applicable store fees.

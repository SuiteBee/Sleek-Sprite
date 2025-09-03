> [!IMPORTANT]
> This is being actively developeed and will evolve over time

# Sleek-Sprite (WIP)

This project was inspired by the dissatisfaction with existing software and tools to modify sprite sheets, many locked behind paywalls or expensive subscriptions. It started as a personal project with a specific use case in mind, however once it was in progress the ideas for features just kept coming.

> [!Caution]
> Only tested with very small pixel graphic spritesheets
>
> Attempting to use high definition images may be slow or crash your browser

## Sources

This project started as a fork of [spritesheet-cutter](https://github.com/yeoji/spritesheet-cutter)
which was based on [Sprite Cow](https://github.com/jakearchibald/sprite-cow)

The project diverged so far from both, that I decided to remove the fork and have this as a standalone repo

- [spritesheet-cutter](https://github.com/yeoji/spritesheet-cutter)
  - streamlined the build process
  - sped up development significantly with yarn and github page deployment support

- [Sprite Cow](https://github.com/jakearchibald/sprite-cow)
  - supplied some essential logic for automatically detecting image slices on a background
  - had an elegant UI to use as a base

## Build Instructions

```
yarn install
yarn dev
```

Go to `http://localhost:1234`

## Status

### Sort of Done

- Many additional tools
  * Selection(Unselect all, Background status, Erase Color, Dispose Rect, Undo)
  * Editor(Anchor all, Grid dimensions, Nudge within cell, Anchor individual, Flip within cell)
  * Persistent dark mode between tabs
  * Animation Preview Started (need to migrate to its own tab after editor)

- History
  * Undo destructive operations like erasing colors or deleting slices
  * Undo image selection

- Workflow
   * Tab structure to separate the steps and tools
   * Events for hover tips/info, passing data between tabs, updating tools on image load/reload, detect background on load
   * Remove a few existing events like unselecting all when clicking background

### Todo
- Export Built Atlas with JSON data
- Export Tab (naming)
- Animation Preview Tab (potential)
- Zoom in/out
- Find All (selection tab)

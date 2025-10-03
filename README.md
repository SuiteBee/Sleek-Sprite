# Sleek-Sprite

A simple sprite packer to streamline the process of building an atlas from malformed sprite sheets

Includes animation previews and JSON map support

Operates locally within the browser and can be used at the pages URL here [Try Sleek-Sprite](https://suitebee.github.io/Sleek-Sprite/)

> [!Note]
> If you find the workflow/functionality useful but need a different export format or options leave a comment in discussions

<details>

<summary><h2>Purpose</h2></summary>

This project was inspired by the dissatisfaction with existing software and tools to modify sprite-sheets, many locked behind paywalls or expensive subscriptions

Started as a personal project with a specific use case in mind, however once it was in development, I decided to add some polish and additional features to make it feel more complete

</details>

<details>

<summary><h2>Feature List</h2></summary>

### Global

* Persistent display mode between tabs (dark mode)
* Shared zoom between editor and animator
* Zoom does not alter image directly to maintain export integrity

### Selector

* Drag and drop image files
* Reload
* Search (find and select sprites)
* Unselect all
* Select single (with drag)
* Set background (with hover preview)
* Erase background
* Delete selection
* Undo

### Editor

All Sprites
* Click to edit
* Anchor dropdown (center or bottom)
* Rows and columns textboxes (defaults to square)

Selected Sprites
* Nudge (within cell)
* Anchor radio (center/bottom/previous)
  * previous will take into account the y-position of the last selected sprite to maintain height difference
* Flip (x/y axis)
* Zoom

### Animator

* Click to add frame to preview
* Unselect all
* Save (FPS + Name)
* Animation dropdown (to load/modify/delete saved)
* Zoom (separate scrollbars for frames and preview)

### Exporter

* Preview panel
* Name individual sprites/frames
* Download individual sprites/frames
* Download all sprites as zip
* Export all sprites in atlas
* Options to build JSON map w/ animations

</details>

<details>

<summary><h2>Sources</h2></summary>

This project started as a fork of [spritesheet-cutter](https://github.com/yeoji/spritesheet-cutter)
which was based on [Sprite Cow](https://github.com/jakearchibald/sprite-cow)

The project diverged so far from both, that I decided to remove the fork and have this as a standalone repo

- [spritesheet-cutter](https://github.com/yeoji/spritesheet-cutter)
  - streamlined the build process
  - sped up development with yarn and Github Pages deployment support

- [Sprite Cow](https://github.com/jakearchibald/sprite-cow)
  - supplied some essential logic for detecting image slices on a background
  - had an elegant UI to use as a base
 
Icons 

* [Plump Flat - Free](https://www.streamlinehq.com/icons/plump-flat-free) (Streamline)

Fonts 

* [Oswald](https://fonts.google.com/specimen/Oswald) (Google)
* [Lobster](https://fonts.google.com/specimen/Lobster) (Google)

Sprites (example)

* [Retro Character](https://openclipart.org/detail/248259/retro-character-sprite-sheet) (Open Clip Art)
   * [isaiah658](https://openclipart.org/artist/isaiah658) (Open Clip Art Author)

</details>

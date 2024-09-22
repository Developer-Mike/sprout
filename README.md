<h3 align="center">
    <img alt="Logo" src="./public/sprout.svg" width="100">
    <br/>
    <font color="#b4d8bb" size="6em">Sprout</font>
</h3>

<p align="center">
    <u>The</u> low-code platform for learning game development.
    <br/><br/>
    <a href="#"><img src="https://img.shields.io/endpoint?url=https://wakapi.dev/api/compat/shields/v1/Developer-Mike/interval:all_time/project:sprout&label=Time%20Spent&style=for-the-badge&colorA=191f19&colorB=b4d8bb" alt="Time Spent"></a>
    <a href="./LICENSE"><img src="https://img.shields.io/static/v1.svg?label=License&message=MPL-2.0&style=for-the-badge&colorA=191f19&colorB=b4d8bb" alt="MPL-2.0 license"/></a>
</p>

## 🚀 Running the project
1. Clone the repository
```bash
git clone https://github.com/Developer-Mike/sprout.git
```
2. Install the dependencies
```bash
npm i
```
3. Run the application
```bash
npm run dev
```

## ✨ Roadmap
- [x] Create the project
- [x] Decide the style and design of the project
- [x] Implement the basic UI using Next.js and SCSS
- [x] Design the basic structure of the project data
- [x] Make it work with fixed data and JavaScript
- [x] Add support for sprites
- [x] Implement game objects pane
  - [x] Add game object settings
  - [x] Don't allow adding objects with the same id
  - [x] Allow reordering of the objects
  - [x] Confirm deletion of objects
- [x] Add keyboard shortcuts
- [x] Make the code editor work with JavaScript
- [x] Load and save the project data
  - [x] Detect unsaved project and prevent closing the tab if the data is not saved
  - [x] Automatically save the project data
    - [x] Add save history
    - [x] Make the history less detailed
  - [x] Add loading progress bar
- [x] Add projects overview (list of projects)
- [x] Sprites Tab
  - [x] Add the ability to reorder sprites
  - [x] Add the ability to change the active sprite
  - [x] Add the ability to delete sprites
- [x] Add sprites library dialog
  - [x] Add the ability to upload sprites
  - [x] Add the ability to delete sprites
  - [x] Add the ability to rename sprites
  - [x] Add the ability to assign sprites to game objects
  - [x] Add sprite information
- [x] Only add LabeledNumberInput change to history after the user stops dragging
- [x] Add undo/redo to the navbar
- [x] Always save project before rerouting
- [-] Create the programming language for Sprout
  - [x] Remove the usage of large strings and eval in the SproutEngine
  - [x] Create programming language concepts
    - [x] Variables
    - [x] Functions
    - [x] Loops (for, while)
    - [x] Conditions (if, else)
    - [x] Comments
  - [x] Create Lexer (Code -> Tokens)
  - [-] Create Parser (Tokens -> AST)
    - [x] Add support for mutable variables
    - [x] Add support for if, while, for and on statements
    - [ ] Add support for await statements
    - [ ] Add support for lists
    - [ ] (If time allows) Add support for objects
    - [x] (If time allows) Add support for +=, -=, *=, /= operators
    - [ ] (If time allows) Add support for unary operators (-var, +var, ++, --)
  - [x] Create AST compiler function (AST -> JavaScript)
  - [x] Create error handling (Compilation & Runtime)
  - [ ] Show errors in the code editor
  - [ ] Fix the syntax highlighting and linting (Only basic syntax highlighting)
  - [ ] Fix execution of the code
  - [ ] Add implemented functions to the engine
    - [ ] move, rotate (Handle frame_time)
    - [ ] rotate_to
    - [ ] collides_with, collides_with_box
    - [ ] sleep
  - [ ] (If time allows) Add autocomplete for some objects (e.g. game_objects, sprites)
  - [ ] (If time allows) Add advanced explanations to error messages
- [-] Miscellaneous
  - [x] Add a clean way to handle debug information
  - [x] Rework game object scaling (width and factor for height) -> Fix different scaling for different sprites
    - [x] Add width and height info to the sprites in the sprites library
  - [ ] Solve all TODOs
  - [ ] Remove all DEBUGs
- [ ] Create some example games
  - [ ] Add the ability to add information text to the documentation sidebar
- [x] Add warning if not using Chrome
- [x] Bugfixes
  - [x] Add absolute identifiers to project paths -> Fix project with same filename not visible in the projects overview
  - [x] Fix rotation of game objects causing other game objects to move
  - [x] Fix deletion of all game objects causing null value of selected object key
- [ ] (If time allows) Add the ability to add plugins (keep in mind: security risk)
- [ ] (Out of scope) Add the ability to duplicate game objects
- [ ] (Out of scope) Add the ability to export and import game objects individually
- [ ] (Out of scope) Add export of the games to standalone websites
- [ ] (Out of scope) Add the ability to add sounds and music
- [ ] (Out of scope) Create tool for simple image editing of sprites
- [ ] (Out of scope) Add tooltips
  - [ ] Unsaved changes
  - [ ] Game object properties
  - [ ] Add game object button
  - [ ] Vertical tab buttons
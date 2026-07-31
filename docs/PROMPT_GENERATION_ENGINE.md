# Vyrelix Prompt Generation Engine

Prompts are an implementation detail of the Universal Creative Engine. Describe and Build workflows update a Creative Specification; that specification updates the generated prompt behind the scenes.

Beginners never need to manage prompt syntax. Advanced users can open Prompt Inspector to:

- view and edit the prompt;
- copy or export it;
- reset edits to the generated direction;
- lock creative sections;
- compare prompt-bearing snapshots.

The existing prompt pipeline remains available as an advanced route. `GeneratorManager` validates the project, applies visual compatibility, composes semantic sections, optimizes the result, and stores a versioned prompt record. Prompt history, favorites, duplicate actions, preview metrics, negative direction, and TXT, Markdown, and JSON export remain supported.

Prompt generation is deterministic and device-local. Records are provider-independent, and the browser does not accept API credentials.

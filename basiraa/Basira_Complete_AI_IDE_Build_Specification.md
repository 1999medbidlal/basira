# BASIRA — Original-Image Reading Assistant
## Complete AI IDE Agent Build Specification
### Specification Version: 2.0.0
### Document Type: Product + Architecture + Engineering + UX + QA Specification
### Intended Builder: AI IDE / Vibe-Coding Agent
### Primary Goal: Build a working product, not a demo

---

# 0. IMPORTANT INSTRUCTIONS FOR THE IDE AGENT

You are the implementation agent for **Basira**, an original-image reading assistant.

This document is the source of truth for the implementation.

You must behave as a senior product engineer and autonomous coding agent.

## 0.1 Do not misunderstand the product

Basira is NOT primarily an OCR application.

Basira is NOT a document editor.

Basira is NOT an application that replaces a photograph with extracted HTML text.

Basira is a **visual reading layer over the original photograph**.

The original photograph remains the visual document at all times.

OCR is metadata.

Speech is an assistance layer.

Highlights are a transparent rendering layer.

The central user experience is:

```text
PHOTO OF REAL PAGE
       ↓
Basira understands where the text is
       ↓
User presses Read
       ↓
Voice reads the content
       ↓
The corresponding region is highlighted
       ↓
Next region becomes highlighted
       ↓
The original photograph remains unchanged
```

## 0.2 Build the real architecture

Do not create a fake implementation that only simulates OCR with hard-coded coordinates.

Do not use a fake reading sequence for the final MVP.

Do not permanently modify the uploaded image.

Do not render OCR text over the image as the primary document view.

Do not make a cloud API mandatory.

Do not hard-code the application to one OCR provider or one speech provider.

## 0.3 Autonomous implementation rule

If a minor implementation decision is not explicitly specified, choose the simplest robust solution that preserves the architecture and principles in this document.

Do not stop the project because of minor ambiguity.

Do not repeatedly ask the user to choose between equivalent technical implementations.

Document significant decisions in `docs/decisions/`.

## 0.4 Priority order

When requirements conflict, use this priority:

1. Original-image preservation
2. Correct OCR coordinates
3. Correct reading order
4. Reliable reading/highlighting synchronization
5. Arabic correctness
6. Privacy/local processing
7. Performance
8. UX polish
9. Optional/future features

---

# 1. PRODUCT IDENTITY

## 1.1 Product name

**Basira**

The internal project identifier may be:

```text
basira
```

Use lowercase `basira` for package/project identifiers unless a platform requires another format.

## 1.2 Product concept

Basira allows a user to:

- capture a page with a camera;
- upload an existing photograph;
- preserve the photograph exactly;
- detect text locally;
- identify blocks, lines and words;
- determine reading order;
- read the detected content aloud;
- highlight the exact current word/line on top of the original image;
- support English and Arabic from the beginning;
- prepare the architecture for Moroccan Darija;
- work locally as much as reasonably possible;
- avoid mandatory cloud APIs;
- protect the user's image privacy.

The original project definition explicitly requires the original image to remain the visual source and the highlight to exist in a separate transparent layer. 

---

# 2. PRODUCT PRINCIPLE

## 2.1 Immutable visual source

The uploaded/captured image is the source of truth.

Never:

- overwrite it;
- draw highlights into it;
- replace it with OCR HTML;
- create a reconstructed page as the main visual representation.

The application may create temporary derivatives for processing, but those derivatives must never replace the source.

## 2.2 Processing layers

The product consists of these conceptual layers:

```text
SOURCE IMAGE
    │
    ├── IMAGE VIEWER
    │
    └── OCR PROCESSING
           │
           ▼
     DOCUMENT MODEL
           │
     ┌─────┴─────┐
     ▼           ▼
READING ORDER   LANGUAGE
     │
     ▼
TOKEN SEQUENCE
     │
 ┌───┴──────────────┐
 ▼                  ▼
SPEECH ENGINE    HIGHLIGHT ENGINE
 │                  │
 └────────┬─────────┘
          ▼
   SYNCHRONIZATION
          │
          ▼
 ORIGINAL IMAGE
      +
 LIVE OVERLAY
```

---

# 3. V1 SCOPE

## 3.1 Mandatory MVP

The MVP must support:

- image upload;
- camera capture where supported;
- original image display;
- local OCR;
- English OCR;
- Arabic OCR;
- OCR word coordinates;
- normalized internal token model;
- reading order;
- transparent overlay;
- word highlighting;
- browser speech;
- play;
- pause;
- resume;
- stop;
- reading speed;
- voice selection where available;
- language selection;
- image resizing without losing alignment;
- basic Arabic RTL support;
- no mandatory cloud API.

## 3.2 Explicitly NOT required for MVP

Do not block MVP completion on:

- perfect Moroccan Darija;
- custom neural TTS;
- perfect OCR;
- PDF editing;
- accounts;
- social features;
- cloud synchronization;
- AI chat;
- translation;
- dictionary;
- multi-page books;
- app-store packaging;
- advanced design systems.

These are later features.

---

# 4. RECOMMENDED IMPLEMENTATION STACK

Start simple.

## 4.1 Initial stack

Use:

- HTML
- CSS
- modern JavaScript
- ES modules

Do not introduce React or another UI framework before the core visual/OCR/synchronization architecture is proven.

## 4.2 Later migration

If complexity justifies it, the application may migrate to:

- TypeScript
- React
- Vite
- PWA tooling

The migration must preserve the same domain model and interfaces.

## 4.3 OCR

Initial OCR architecture:

```text
OCRProvider
    └── LocalTesseractProvider
```

Tesseract is the initial local OCR choice because the original specification requires an open-source, local OCR path supporting English and Arabic and structured bounding-box output.

The application must never expose Tesseract-specific raw data to the rest of the application.

## 4.4 Speech

Initial architecture:

```text
SpeechProvider
    ├── BrowserSpeechProvider
    ├── LocalSpeechProvider
    └── FutureDarijaSpeechProvider
```

V1 uses browser Web Speech API where available.

This is a prototype speech implementation, not a promise of final Darija quality.

---

# 5. PROJECT STRUCTURE

Create the following structure:

```text
basira/
├── index.html
├── package.json
├── README.md
├── LICENSE
├── .gitignore
│
├── public/
│   ├── icons/
│   └── assets/
│
├── src/
│   ├── app.js
│   │
│   ├── camera/
│   │   ├── camera.js
│   │   └── image-capture.js
│   │
│   ├── image/
│   │   ├── image-manager.js
│   │   ├── image-preprocess.js
│   │   ├── image-metadata.js
│   │   └── coordinate-transform.js
│   │
│   ├── ocr/
│   │   ├── ocr-engine.js
│   │   ├── tesseract-provider.js
│   │   ├── ocr-normalizer.js
│   │   ├── language-detector.js
│   │   └── reading-order.js
│   │
│   ├── document/
│   │   ├── document-model.js
│   │   ├── token-model.js
│   │   └── validation.js
│   │
│   ├── reader/
│   │   ├── reader-controller.js
│   │   ├── token-manager.js
│   │   ├── synchronization.js
│   │   └── reader-state.js
│   │
│   ├── speech/
│   │   ├── speech-engine.js
│   │   ├── browser-speech.js
│   │   └── speech-capabilities.js
│   │
│   ├── highlight/
│   │   ├── highlight-engine.js
│   │   ├── overlay.js
│   │   └── highlight-style.js
│   │
│   ├── ui/
│   │   ├── app-view.js
│   │   ├── controls.js
│   │   ├── settings.js
│   │   ├── status.js
│   │   └── notifications.js
│   │
│   ├── storage/
│   │   ├── session-store.js
│   │   └── cache-store.js
│   │
│   └── utils/
│       ├── ids.js
│       ├── logger.js
│       ├── errors.js
│       └── text.js
│
├── models/
│   ├── ocr/
│   └── tts/
│
├── tests/
│   ├── coordinates/
│   ├── ocr/
│   ├── reading-order/
│   ├── arabic/
│   ├── speech/
│   ├── synchronization/
│   └── integration/
│
└── docs/
    ├── architecture.md
    ├── decisions/
    └── testing.md
```

The exact build tooling may change, but the domain boundaries must remain.

---

# 6. CORE DOMAIN MODEL

The most important internal object is the normalized document.

## 6.1 Document

Use a structure conceptually equivalent to:

```js
{
  id: "document-uuid",
  source: {
    type: "upload",
    originalFile: File,
    width: 1920,
    height: 1080,
    mimeType: "image/jpeg",
    name: "page.jpg"
  },

  ocr: {
    provider: "tesseract",
    status: "complete",
    language: "eng",
    confidence: 94,
    blocks: [],
    lines: [],
    tokens: []
  },

  reading: {
    direction: "ltr",
    tokens: [],
    currentIndex: 0
  }
}
```

Do not persist a `File` object directly in long-term IndexedDB records unless the storage implementation intentionally supports blobs.

## 6.2 Token

Every OCR word should normalize to:

```js
{
  id: "token-42",

  text: "reading",

  normalizedText: "reading",

  speechText: "reading",

  language: "en",

  bbox: {
    x: 100,
    y: 300,
    width: 140,
    height: 45
  },

  lineId: "line-7",

  blockId: "block-2",

  readingOrder: 42,

  confidence: 94,

  direction: "ltr",

  status: "pending"
}
```

Allowed status:

```text
pending
current
spoken
skipped
error
```

## 6.3 Coordinate invariant

All OCR coordinates MUST be stored in **original image coordinate space**.

Never store display-space coordinates as the canonical position.

---

# 7. IMAGE MANAGEMENT

## 7.1 Original image lifecycle

When a user uploads an image:

```text
File
 ↓
ImageManager
 ↓
validate
 ↓
read dimensions
 ↓
create object URL
 ↓
display original
```

Do not mutate the file.

## 7.2 Temporary preprocessing

OCR preprocessing may use:

- resize;
- contrast adjustment;
- deskew;
- noise reduction;
- grayscale;
- thresholding.

But preprocessing must create a temporary processing image.

Never overwrite the source image.

## 7.3 Image viewer

Use this architecture:

```html
<div class="reader">
    <img id="originalImage" />
    <div id="overlay"></div>
</div>
```

CSS concept:

```css
.reader {
    position: relative;
}

#originalImage {
    display: block;
    width: 100%;
    height: auto;
}

#overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.highlight {
    position: absolute;
}
```

The overlay must be geometrically coupled to the displayed image.

---

# 8. COORDINATE TRANSFORMATION

This is a critical subsystem.

Suppose:

```text
Original:
1920 × 1080

OCR token:
x = 500
y = 300
width = 150
height = 50

Displayed image:
960 × 540
```

Calculate:

```js
scaleX = displayedWidth / originalWidth
scaleY = displayedHeight / originalHeight
```

Then:

```js
displayX = x * scaleX
displayY = y * scaleY
displayWidth = width * scaleX
displayHeight = height * scaleY
```

Do not assume a single scale value unless the rendered image is guaranteed to preserve aspect ratio.

## 8.1 Coordinate API

Create:

```js
transformBboxToDisplay(
  bbox,
  originalSize,
  displayedRect
)
```

Return:

```js
{
  x,
  y,
  width,
  height
}
```

## 8.2 Recalculation events

Recalculate overlay coordinates after:

- image load;
- window resize;
- orientation change;
- responsive layout change;
- zoom;
- container resize.

Use `ResizeObserver` where appropriate.

---

# 9. OCR ABSTRACTION

## 9.1 Interface

Create a provider-independent API:

```js
class OcrEngine {
  async initialize(options) {}
  async recognize(image, options) {}
  async terminate() {}
}
```

Provider result must be normalized immediately.

## 9.2 Normalized result

```js
{
  width: 1920,
  height: 1080,
  language: "eng",
  blocks: [],
  lines: [],
  tokens: []
}
```

The rest of Basira must not care whether the provider is Tesseract or another future engine.

## 9.3 OCR worker

OCR must not freeze the UI.

Use a Web Worker or the worker mechanism supplied by the OCR library.

The main thread should remain responsible for:

- UI;
- image rendering;
- controls;
- user interaction.

OCR worker handles:

- model initialization;
- OCR;
- progress;
- result serialization.

## 9.4 OCR states

Use:

```text
idle
initializing
processing
complete
error
cancelled
```

Expose progress when available.

---

# 10. OCR PIPELINE

The processing pipeline is:

```text
Original Image
    ↓
Temporary Preprocessing
    ↓
OCR
    ↓
Raw Result
    ↓
Normalization
    ↓
Blocks
    ↓
Lines
    ↓
Words
    ↓
Tokens
    ↓
Language / Direction
    ↓
Reading Order
```

Never run OCR again merely because the user presses Play.

OCR is an expensive operation and should happen once per image/language/preprocessing configuration.

---

# 11. READING ORDER ENGINE

OCR output is not guaranteed to be human reading order.

Create an independent reading-order engine.

## 11.1 English default

```text
left → right
top → bottom
```

## 11.2 Arabic default

```text
right → left
top → bottom
```

## 11.3 Important rule

Do NOT globally sort all words by x-coordinate.

Use:

```text
blocks
 ↓
lines
 ↓
language/direction
 ↓
tokens
```

The reading-order engine should work from structural relationships.

## 11.4 Mixed-language documents

Mixed Arabic/English pages must be treated as mixed-direction documents.

A line may contain:

```text
Arabic + English + number
```

Do not destroy the original token text merely to impose a direction.

Store direction metadata independently.

---

# 12. ARABIC REQUIREMENTS

Arabic is a first-class language.

The system must account for:

- RTL;
- Arabic shaping;
- connected letters;
- diacritics;
- punctuation;
- OCR confidence;
- mixed Arabic/English;
- numbers;
- reading order.

## 12.1 Text normalization

Store both:

```js
text
normalizedText
```

Normalization must be conservative.

Do not remove information needed for speech.

Example:

```js
{
  text: "الكتاب",
  normalizedText: "الكتاب"
}
```

## 12.2 Arabic UI

When Arabic is selected, relevant UI sections may switch to RTL.

The document image itself must never be mirrored merely because Arabic is selected.

The photograph remains exactly as captured.

---

# 13. SPEECH ARCHITECTURE

Create an abstraction:

```js
class SpeechProvider {
  async speak(text, options) {}
  pause() {}
  resume() {}
  stop() {}
  getVoices() {}
  supports(language) {}
}
```

Initial implementation:

```text
BrowserSpeechProvider
```

Future:

```text
LocalSpeechProvider
DarijaSpeechProvider
```

The UI must not know which provider is active.

---

# 14. BROWSER SPEECH

Use Web Speech API where available.

Capabilities include:

- speak;
- pause;
- resume;
- cancel;
- rate;
- voice;
- language.

But do not assume:

- every device has the same voices;
- every browser behaves identically;
- word-level timing is precise;
- Darija is available.

The application must detect capabilities and degrade gracefully.

---

# 15. READING ENGINE

The reading engine owns the reading sequence.

State:

```js
{
  status: "idle",
  currentIndex: 0,
  speed: 1,
  direction: "ltr"
}
```

Statuses:

```text
idle
playing
paused
stopped
completed
error
```

## 15.1 Basic flow

```text
PLAY
 ↓
currentIndex = selected/start index
 ↓
get token
 ↓
set token = current
 ↓
highlight token
 ↓
speak token
 ↓
speech completion
 ↓
set token = spoken
 ↓
increment index
 ↓
repeat
 ↓
completed
```

## 15.2 Important limitation

Token-by-token speech is primarily for the first synchronization prototype.

It may sound unnatural.

The architecture must therefore allow later replacement with:

```text
sentence/phrase speech
        +
token alignment
        +
approximate timing
```

---

# 16. SYNCHRONIZATION ENGINE

Do not bury synchronization logic inside UI callbacks.

Create a dedicated subsystem.

Concept:

```text
Speech event
    ↓
Synchronization controller
    ↓
Current token
    ↓
Highlight engine
```

## 16.1 Responsibilities

Synchronization must:

- know the current token;
- start highlight before speech;
- advance after speech completion;
- stop cleanly;
- handle pause;
- handle resume;
- recover from speech errors;
- prevent duplicate callbacks;
- prevent race conditions.

## 16.2 Race-condition protection

Every reading session should have a session ID.

Example:

```js
readingSessionId = crypto.randomUUID();
```

When an asynchronous speech callback fires, verify it belongs to the current session.

This prevents an old speech callback from advancing a new reading session.

---

# 17. HIGHLIGHT ENGINE

The highlight engine only knows:

```text
token
+
display geometry
+
style
```

It does not know OCR internals.

## 17.1 Modes

MVP:

```text
word
```

Future:

```text
line
paragraph
reading-bar
custom
```

## 17.2 Default style

```text
yellow
semi-transparent
rounded rectangle
```

User-configurable:

- color;
- opacity;
- border radius;
- mode.

## 17.3 Multiple highlights

At minimum support:

```text
current token
```

Future:

```text
spoken history
current token
next token
```

---

# 18. USER INTERFACE

The UI should be simple.

Main screen:

```text
┌──────────────────────────────────────────────┐
│ Basira                                       │
├──────────────────────────────────────────────┤
│                                              │
│              ORIGINAL IMAGE                 │
│                                              │
│          [current highlight]                 │
│                                              │
├──────────────────────────────────────────────┤
│ 📷 Camera       📁 Upload                    │
│                                              │
│ ▶ Play   ⏸ Pause   ⏹ Stop                   │
│                                              │
│ Language: [English ▼]                        │
│ Voice:    [Default ▼]                        │
│ Speed:    [────●────]                        │
└──────────────────────────────────────────────┘
```

Advanced settings:

```text
Highlight color
Highlight opacity
Highlight mode
Auto-scroll
```

## 18.1 UX principle

The user should never need to understand:

- OCR;
- bounding boxes;
- token models;
- coordinate systems;
- workers;
- synchronization.

The mental model should be:

```text
Take photo
   ↓
Press Read
   ↓
Listen
   ↓
See where Basira is reading
```

---

# 19. IMAGE INTERACTION

Support:

- responsive scaling;
- mobile orientation;
- zoom later;
- pinch-to-zoom later;
- overlay alignment during zoom.

Do not implement complicated zoom behavior before basic coordinate alignment is stable.

---

# 20. CAMERA

Camera is secondary to upload.

Implement after the image viewer and OCR/highlight pipeline work.

Use:

```text
<input type="file" accept="image/*" capture="environment">
```

where suitable.

A more advanced camera preview may use `getUserMedia`.

The captured image must enter exactly the same `ImageManager` pipeline as an uploaded file.

There must be one image-processing path.

---

# 21. PRIVACY

Default philosophy:

```text
Camera
 ↓
Device
 ↓
Local OCR
 ↓
Local reading
 ↓
No upload
```

Do not send images to external services.

If cloud providers are added in the future:

- they must be optional;
- they must require explicit user action;
- UI must disclose that processing is remote;
- local processing remains the default.

A future status indicator may say:

```text
🔒 Processing locally
```

---

# 22. OFFLINE/PWA STRATEGY

V1 target:

```text
Online installation
+
local processing
```

V2:

```text
PWA
+
service worker
+
cached application
+
cached OCR assets/models
+
local speech where available
```

Do not make huge model downloads mandatory on first page load.

Use lazy loading.

---

# 23. CACHING

Do not run OCR every time the user presses Play.

Cache OCR results using a key based on:

```text
image hash
+
OCR language
+
preprocessing configuration
+
OCR engine version
```

Example:

```js
cacheKey = sha256(
  imageHash +
  language +
  preprocessingVersion +
  ocrEngineVersion
)
```

Potential storage:

```text
IndexedDB
```

Cache data:

```text
document metadata
OCR normalized result
tokens
reading order
```

Do not unnecessarily duplicate large image blobs.

---

# 24. APPLICATION STATE

Central state should conceptually contain:

```js
{
  image: {
    source: null,
    width: 0,
    height: 0,
    loaded: false
  },

  ocr: {
    status: "idle",
    language: null,
    progress: 0,
    tokens: []
  },

  reader: {
    status: "idle",
    currentToken: 0,
    speed: 1,
    direction: "ltr"
  },

  speech: {
    provider: "browser",
    voice: null,
    voices: []
  },

  highlight: {
    color: "yellow",
    opacity: 0.4,
    mode: "word"
  },

  ui: {
    error: null,
    message: null
  }
}
```

Keep domain state separate from DOM state.

---

# 25. ERROR HANDLING

Every subsystem must fail gracefully.

## 25.1 OCR errors

Show:

```text
We couldn't read this image.
Try a clearer photo or better lighting.
```

Do not expose stack traces to users.

## 25.2 Speech errors

Possible causes:

- no voice;
- unsupported language;
- browser limitation;
- speech interruption.

Show a useful message and keep the image usable.

## 25.3 Camera errors

Handle:

- permission denied;
- unavailable camera;
- unsupported browser.

Always preserve upload as fallback.

## 25.4 OCR partial result

If some tokens have low confidence:

- do not discard the whole page;
- preserve tokens;
- optionally mark low-confidence tokens;
- allow the user to continue.

---

# 26. ACCESSIBILITY

The reader controls must be keyboard accessible.

Requirements:

- visible focus;
- semantic buttons;
- labels for controls;
- keyboard Play/Pause/Stop;
- accessible status messages;
- sufficient contrast;
- screen-reader labels.

The image should have useful alternative text such as:

```text
Original page being read
```

Do not replace the image with OCR text as the accessibility strategy; the OCR text may be exposed separately when a future accessibility mode is implemented.

---

# 27. PERFORMANCE

Performance goals:

## Startup

Do not initialize OCR models until needed.

## OCR

Load OCR resources lazily.

## UI

OCR must not block the main thread.

## Rendering

Do not recreate hundreds of DOM elements every animation frame.

Only update the current highlight geometry when needed.

## Speech

Do not rerun OCR during playback.

## Resize

Debounce or use observer-driven recalculation rather than excessive resize handlers.

---

# 28. SECURITY

Treat uploaded images as untrusted input.

Do not:

- execute image metadata;
- insert OCR output with unsafe `innerHTML`;
- trust filenames;
- create arbitrary URLs from OCR content.

Use text-safe DOM APIs.

Revoke object URLs when no longer needed.

---

# 29. TEST DATASET

Create a test plan containing:

## English

- printed book;
- newspaper;
- small text;
- large text;
- multiple columns;
- tilted photo;
- low light.

## Arabic

- printed book;
- newspaper;
- diacritics;
- mixed Arabic/English;
- Arabic numbers;
- multiple columns.

## Darija

Use representative Moroccan text later.

## Physical conditions

- straight photo;
- rotated photo;
- perspective distortion;
- low resolution;
- shadows;
- uneven lighting.

---

# 30. QUALITY METRICS

Track:

```text
OCR accuracy
Word position accuracy
Reading-order accuracy
Speech correctness
Highlight accuracy
Synchronization accuracy
Processing time
Memory usage
```

## 30.1 Highlight accuracy

For every test token:

```text
Expected bbox
vs
Rendered bbox
```

The system should define a tolerance appropriate to display scaling.

Do not accept a visually drifting overlay.

---

# 31. UNIT TESTS

At minimum create tests for:

## Coordinate transformation

```text
original 1920x1080
display 960x540
```

Verify exact scaling.

## Non-uniform test

Test different display dimensions.

## Reading order

Test:

```text
English LTR
Arabic RTL
multiple lines
multiple blocks
mixed direction
```

## Token normalization

Test punctuation and Arabic text.

## State machine

Test:

```text
idle → playing
playing → paused
paused → playing
playing → stopped
playing → completed
```

## Session race conditions

Start session A.

Start session B before A callback.

Verify A cannot modify B.

---

# 32. INTEGRATION TEST

The most important end-to-end test:

```text
Upload real image
 ↓
Image appears unchanged
 ↓
OCR executes locally
 ↓
Tokens generated
 ↓
Select token
 ↓
Token highlight appears in correct location
 ↓
Press Play
 ↓
Speech begins
 ↓
Highlight changes
 ↓
Pause
 ↓
Highlight remains stable
 ↓
Resume
 ↓
Reading continues
 ↓
Stop
 ↓
Highlight resets
```

---

# 33. MVP ACCEPTANCE CRITERIA

The MVP is complete only when:

- user can upload a photo;
- original photo remains unchanged;
- OCR works locally;
- English is detected;
- Arabic is detected;
- words have coordinates;
- overlay highlights words;
- resizing does not break highlighting;
- Play works;
- speech starts;
- highlight follows reading;
- Pause works;
- Resume works;
- Stop works;
- no mandatory cloud API exists.

---

# 34. DEVELOPMENT PHASES

## Phase 0 — Feasibility

Test:

- local OCR;
- English OCR;
- Arabic OCR;
- bounding boxes;
- browser speech;
- Arabic voices;
- coordinate transformation;
- browser limitations.

Deliverable:

```text
Technical feasibility report
```

## Phase 1 — Visual Engine

Build only:

```text
Upload
 ↓
Original image
 ↓
Overlay
 ↓
Test rectangle
 ↓
Resize
 ↓
Rectangle remains aligned
```

Do this before OCR.

## Phase 2 — OCR

Build:

```text
Image
 ↓
OCR
 ↓
Blocks
 ↓
Lines
 ↓
Words
 ↓
Normalized tokens
```

## Phase 3 — Highlight

Build:

```text
Token
 ↓
Coordinate transform
 ↓
Highlight
```

## Phase 4 — English Reading

Build:

- Play;
- Pause;
- Resume;
- Stop;
- voice;
- speed;
- token reading;
- highlight synchronization.

## Phase 5 — Arabic

Build:

- Arabic OCR;
- RTL order;
- Arabic normalization;
- Arabic TTS;
- mixed Arabic/English;
- Arabic UI.

## Phase 6 — Synchronization

Improve:

- speech timing;
- word boundaries;
- punctuation;
- OCR mistakes;
- speech rates.

Potential future:

```text
sentence
 ↓
token alignment
 ↓
speech segment
 ↓
timing
 ↓
current token
```

## Phase 7 — Moroccan Darija

Research:

- local open-source models;
- voice quality;
- pronunciation;
- offline operation;
- model size;
- licensing;
- Moroccan vocabulary;
- Arabic/French/English code-switching.

Do not start this phase until the reader architecture is stable.

## Phase 8 — PWA/Mobile

Add:

- manifest;
- service worker;
- camera UX;
- portrait;
- landscape;
- touch;
- zoom;
- offline cache.

## Phase 9 — Quality

Create the real-world dataset and measure all major metrics.

---

# 35. DARija ARCHITECTURE

Darija is a strategic future capability, not an MVP dependency.

Architecture:

```text
Darija Text
   ↓
Normalization
   ↓
Darija Voice Adapter
   ↓
Speech Provider
   ↓
Synchronization
```

Possible future approaches:

### A. Existing local model

Advantages:

- local;
- private;
- no cloud API.

Risks:

- voice availability;
- model size;
- quality;
- license.

### B. Fine-tuned model

Requires:

- legally obtained recordings;
- accurate transcripts;
- speaker consistency;
- GPU resources;
- training knowledge.

### C. Hybrid

Keep:

```text
OCR local
Image local
Highlight local
Reader local
```

and make speech provider pluggable.

This is the preferred architectural strategy.

---

# 36. FUTURE FEATURE ROADMAP

Only after the core reader works:

- automatic page detection;
- perspective correction;
- multi-page books;
- reading history;
- bookmarks;
- continue reading;
- paragraph selection;
- tap word to hear;
- repeat word;
- pronunciation mode;
- dictionary;
- translation;
- vocabulary mode;
- dark mode;
- accessibility controls;
- OCR metadata export;
- desktop application;
- Android;
- iOS.

---

# 37. DESKTOP FUTURE

If browser limitations become important:

```text
Basira UI
   ↓
Desktop Shell
   ├── Local OCR
   ├── Local TTS
   ├── Camera
   └── File System
```

A desktop wrapper can provide more control over local models.

Do not build desktop first unless the web prototype demonstrates a browser limitation that materially affects the product.

---

# 38. NATIVE MOBILE FUTURE

Future:

```text
Mobile App
 ├── Camera
 ├── Image Renderer
 ├── OCR
 ├── TTS
 ├── Highlight Engine
 └── Local Storage
```

The web prototype remains the first implementation because it allows faster experimentation.

---

# 39. ENGINEERING RULES

These rules are mandatory:

1. Keep original image immutable.
2. Separate OCR from rendering.
3. Separate speech from synchronization.
4. Store coordinates in original-image space.
5. Transform coordinates only during rendering.
6. Keep OCR replaceable.
7. Keep TTS replaceable.
8. Treat Arabic RTL as first-class.
9. Do not build Darija TTS before the reader architecture works.
10. Test with real photographs early.
11. Prefer local processing.
12. Keep MVP small.
13. Never make cloud APIs mandatory.
14. Never hide domain logic inside UI event handlers.
15. Never let provider-specific OCR structures leak into the application.
16. Never use hard-coded demo tokens as a substitute for real OCR in production.
17. Never permanently modify user images.
18. Never let asynchronous callbacks mutate obsolete reading sessions.

---

# 40. DEFINITION OF DONE — CORE MVP

The core MVP is done when a real user can:

```text
1. Open Basira
2. Upload a real English or Arabic page
3. See the original photograph
4. Run local OCR
5. See detected reading regions
6. Select a word
7. See the word highlighted in its actual position
8. Press Play
9. Hear the word/content
10. See the highlight advance
11. Pause
12. Resume
13. Stop
14. Resize the browser
15. See the highlight remain correctly aligned
```

No cloud API is mandatory.

---

# 41. DEFINITION OF DONE — DARija

Darija version is done only when:

- Moroccan Darija input is handled correctly;
- normalization preserves pronunciation;
- suitable Moroccan voice exists;
- native speakers evaluate pronunciation;
- speech is sufficiently natural for the intended use;
- synchronization remains stable;
- local execution is possible if the selected model permits it;
- licensing is acceptable;
- target-device performance is acceptable.

---

# 42. IMMEDIATE BUILD PLAN

The IDE agent must start with the following sequence.

## Step 1

Create the minimal application.

```text
index.html
style.css
src/app.js
```

## Step 2

Build the image viewer.

## Step 3

Build the overlay.

## Step 4

Implement coordinate transformation.

## Step 5

Add a manually positioned test token.

## Step 6

Resize the browser repeatedly.

## Step 7

Verify the test token remains perfectly aligned.

## Step 8

Only then integrate OCR.

## Step 9

Normalize OCR into the internal token model.

## Step 10

Highlight a real OCR token.

## Step 11

Add browser speech.

## Step 12

Add synchronization.

## Step 13

Add Arabic.

## Step 14

Add camera.

## Step 15

Add mobile/PWA.

## Step 16

Research Darija voice technology.

---

# 43. AGENT EXECUTION LOOP

For every implementation phase:

```text
PLAN
 ↓
IMPLEMENT
 ↓
RUN
 ↓
TEST
 ↓
INSPECT
 ↓
FIX
 ↓
RETEST
 ↓
DOCUMENT
 ↓
NEXT PHASE
```

Never declare a phase complete merely because code was written.

A phase is complete only when its acceptance criteria pass.

---

# 44. DEBUGGING PRINCIPLE

When something fails, identify the layer first.

Example:

### Highlight wrong position

Check:

```text
OCR bbox
→ original image dimensions
→ rendered image rectangle
→ coordinate transform
→ overlay container
→ CSS positioning
```

Do not randomly change CSS.

### Reading order wrong

Check:

```text
raw OCR
→ blocks
→ lines
→ language
→ direction
→ ordering algorithm
```

Do not solve reading-order problems in the speech layer.

### Speech/highlight mismatch

Check:

```text
token sequence
→ speech provider
→ callback
→ synchronization session
→ currentIndex
→ highlight engine
```

Do not modify OCR to fix speech timing.

---

# 45. LOGGING

Development mode should provide structured logs:

```text
[IMAGE]
[OCR]
[OCR-NORMALIZER]
[READING-ORDER]
[SPEECH]
[SYNC]
[HIGHLIGHT]
[CAMERA]
[STORAGE]
```

Example:

```text
[OCR] Processing started
[OCR] Language: ara
[OCR] Tokens detected: 143
[READING-ORDER] Direction: rtl
[READING-ORDER] Ordered tokens: 143
[SYNC] Session started: abc123
[SYNC] Current token: token-42
[SPEECH] Speaking: الكتاب
[HIGHLIGHT] token-42
```

Production mode should reduce logs.

---

# 46. DIAGNOSTIC MODE

Add a developer-only diagnostic mode.

It may show:

- OCR boxes;
- token IDs;
- confidence;
- line IDs;
- block IDs;
- reading order;
- current token;
- coordinate values.

Example:

```text
[42] الكتاب
confidence: 93
bbox: 810,340,120,48
line: 7
block: 2
order: 42
```

This mode is extremely useful for debugging Arabic and synchronization.

---

# 47. NO FAKE SUCCESS

The agent must never claim:

```text
OCR complete
```

unless OCR actually ran.

Never claim:

```text
Arabic supported
```

if only English has been implemented.

Never claim:

```text
offline
```

if a network dependency is still required.

Never claim:

```text
Darija supported
```

until a real Darija speech implementation is available.

The UI must communicate real state.

---

# 48. FUTURE PROVIDER INTERFACES

OCR:

```js
export class OcrProvider {
  async initialize() {}
  async recognize(image, options) {}
  async terminate() {}
}
```

Speech:

```js
export class SpeechProvider {
  async initialize() {}
  speak(text, options) {}
  pause() {}
  resume() {}
  stop() {}
  getVoices() {}
  supports(language) {}
}
```

These interfaces are architectural boundaries.

---

# 49. PRODUCT EXTENSIBILITY

Future OCR providers could include:

```text
Tesseract
FutureLocalOCR
DesktopOCR
OptionalCloudOCR
```

Future speech providers:

```text
BrowserSpeech
LocalTTS
DarijaTTS
OptionalCloudTTS
```

The application should not require changes to the reader controller when a provider changes.

---

# 50. STORAGE MODEL

Future IndexedDB stores:

```text
documents
ocr-results
settings
reading-progress
cache
```

A document should reference:

```text
document ID
image metadata
OCR result
reading order
```

Avoid unnecessary duplication.

---

# 51. SETTINGS

MVP settings:

```text
language
voice
speed
highlight color
highlight opacity
highlight mode
```

Future:

```text
auto-scroll
font/accessibility options
pronunciation mode
dictionary provider
translation provider
offline model management
```

---

# 52. IMAGE QUALITY ASSISTANCE

Future preprocessing can include:

```text
blur detection
lighting detection
rotation detection
perspective correction
```

The application may eventually say:

```text
Image is too dark.
Try better lighting.
```

But do not block MVP on automatic image correction.

---

# 53. MOBILE UX PRINCIPLES

On mobile:

- camera should be prominent;
- controls should be touch-friendly;
- image should use available screen space;
- reading controls should remain accessible;
- overlay must remain aligned during orientation changes.

Do not create a separate mobile reading engine.

Mobile and desktop must use the same core domain logic.

---

# 54. PRODUCT EXPERIENCE

The user should experience almost no visible technical complexity.

The ideal flow:

```text
OPEN BASIRA
    ↓
TAKE PHOTO
    ↓
"Ready to read"
    ↓
PRESS READ
    ↓
VOICE
    +
YELLOW HIGHLIGHT
    ↓
NEXT WORD
    ↓
NEXT WORD
```

The technology should disappear behind the experience.

---

# 55. CORE ARCHITECTURAL INSIGHT

The defining architecture is:

```text
                    CAMERA
                       │
                       ▼
                ORIGINAL PHOTO
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        LOCAL OCR           IMAGE VIEWER
             │                   │
             ▼                   │
      STRUCTURED TOKENS          │
             │                   │
       ┌─────┴──────┐            │
       │            │            │
       ▼            ▼            │
READING ORDER    SPEECH          │
       │            │            │
       ▼            ▼            │
TOKEN SEQUENCE  VOICE ENGINE     │
       │            │            │
       └──────┬─────┘            │
              ▼                  │
        SYNCHRONIZATION          │
              │                  │
              ▼                  │
         CURRENT TOKEN           │
              │                  │
              ▼                  │
       HIGHLIGHT ENGINE ◄────────┘
              │
              ▼
      ORIGINAL IMAGE
       + HIGHLIGHT
              │
              ▼
       HUMAN READING
```

The key idea is:

**OCR is not the product. OCR is metadata that tells Basira where the words are.**

The original photograph remains the visual document.

Speech and highlighting operate as synchronized layers above it.

---

# 56. FINAL SUCCESS CRITERION

Basira succeeds when a user can photograph a real Arabic or English page and experience:

```text
             ORIGINAL PHOTO
                   │
                   ▼
                 READ
                   │
                   ▼
            🔊 NATURAL SPEECH
                   +
                   ▼
             🟨 CURRENT WORD
          directly on the photo
                   │
                   ▼
          NEXT WORD → NEXT HIGHLIGHT
```

without the original photograph being replaced or permanently modified.

---

# 57. FINAL AGENT COMMAND

Start implementation now.

Do not begin with Darija.

Do not begin with advanced UI.

Do not begin with accounts.

Do not begin with cloud APIs.

Do not begin with AI chat.

Do not begin with translation.

Begin with:

```text
IMAGE
 ↓
OVERLAY
 ↓
COORDINATE ALIGNMENT
```

Then:

```text
OCR
 ↓
TOKENS
 ↓
REAL HIGHLIGHT
```

Then:

```text
SPEECH
 ↓
SYNCHRONIZATION
```

Then Arabic.

Then camera/mobile/offline.

Then Darija.

At every stage, run the application and verify the acceptance criteria before continuing.

The first undeniable proof of the product is:

```text
A real photograph
+
a real OCR token
+
a real speech event
+
a real highlight
+
correct alignment
```

Build that first.

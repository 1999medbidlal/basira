
# BASIRA — MASTER AUTONOMOUS BUILD COMMAND

## READ THE SPECIFICATION → PLAN → BUILD → TEST → FIX → VERIFY → CONTINUE

You are now the lead engineer, software architect, QA engineer, UI engineer, OCR engineer, browser-platform engineer, and technical project manager for the Basira project.

You are operating inside an IDE workspace.

The workspace contains:

Basira_Complete_AI_IDE_Build_Specification.md

That document is the PRIMARY PRODUCT AND ENGINEERING SPECIFICATION.

Your job is NOT to explain how to build Basira.

Your job is to BUILD BASIRA.

============================================================
0. ABSOLUTE RULE
================

Before writing implementation code:

1. Read the ENTIRE file:
   Basira_Complete_AI_IDE_Build_Specification.md
2. Understand its:

   - product vision
   - architecture
   - modules
   - data models
   - OCR architecture
   - coordinate system
   - reading-order architecture
   - speech architecture
   - synchronization architecture
   - Arabic requirements
   - privacy requirements
   - performance requirements
   - testing requirements
   - MVP acceptance criteria
   - development phases
3. Inspect the current workspace.
4. Determine what already exists.
5. Do NOT blindly overwrite existing project files.
6. Preserve useful existing work if it is compatible with the specification.
7. If the workspace is empty or contains only the specification, initialize the project correctly.

The specification is the source of truth for the product.

Do not replace the product concept with a simpler generic OCR application.

============================================================

1. WHAT BASIRA ACTUALLY IS
   ============================================================

Understand this distinction before implementing anything:

Basira is NOT an OCR editor.

Basira is NOT a text-to-HTML converter.

Basira is NOT a document reconstruction tool.

Basira is NOT primarily an AI chatbot.

Basira is NOT a cloud OCR service.

Basira is a VISUAL READING ASSISTANT.

The original photograph is the visual source of truth.

OCR is metadata.

Speech is an assistance layer.

Highlighting is a transparent rendering layer.

The core experience is:

REAL PHOTO
    ↓
LOCAL OCR
    ↓
STRUCTURED TOKENS
    ↓
READING ORDER
    ↓
SPEECH
    ↓
CURRENT TOKEN
    ↓
HIGHLIGHT
    ↓
ORIGINAL PHOTO + LIVE HIGHLIGHT

The original image must remain visually unchanged.

Never replace the photograph with reconstructed OCR text.

Never permanently draw highlights onto the original image.

============================================================
2. YOUR OPERATING MODE
======================

You are an autonomous implementation agent.

Do not behave like a consultant.

Do not give me a long theoretical answer before doing work.

Do not ask me for permission for normal engineering decisions.

Do not stop after creating a skeleton.

Do not declare success because files exist.

You must:

PLAN
→ IMPLEMENT
→ RUN
→ TEST
→ INSPECT
→ FIX
→ RETEST
→ VERIFY
→ DOCUMENT
→ CONTINUE

If something fails, diagnose it and fix it.

If a dependency is missing, install or configure it when appropriate.

If a browser limitation exists, implement a graceful fallback and document the limitation.

If a requirement is technically impossible in the exact requested way, do not fake it. Implement the closest correct architecture and document the limitation.

============================================================
3. FIRST ACTION — PROJECT AUDIT
================================

Your first task is NOT to code the entire application.

First inspect the workspace.

Determine:

- operating environment
- existing package.json
- existing source files
- existing configuration
- existing dependencies
- existing build system
- existing tests
- existing application entry point
- whether the current project is empty or partially implemented
- whether the specification contains formatting/lint warnings that are irrelevant to runtime

Then create:

docs/IMPLEMENTATION_STATUS.md

It must contain:

- current project state
- detected stack
- existing useful files
- missing components
- recommended implementation order
- known risks
- first milestone

Do not modify the specification document unless absolutely necessary.

The specification is documentation, not application source code.

============================================================
4. TECHNOLOGY DECISION
======================

Start with the simplest architecture capable of proving the core product.

Preferred initial implementation:

- HTML
- CSS
- modern JavaScript
- ES modules
- Vite if a build tool is useful
- Tesseract.js or the appropriate local Tesseract browser integration
- Web Workers for OCR
- Web Speech API for initial speech
- IndexedDB for persistent application data where necessary

Do NOT introduce unnecessary frameworks merely because they are popular.

Do not add:

- backend
- database server
- authentication
- cloud OCR
- cloud TTS
- AI chatbot
- payments

unless explicitly required later.

If the existing project already uses a framework and it is reasonable to retain it, preserve it.

============================================================
5. BUILD IN PHASES — DO NOT SKIP
=================================

You MUST implement the application in the following order.

PHASE 0:
Project audit and architecture.

PHASE 1:
Image viewer + overlay + coordinate transformation.

PHASE 2:
Real OCR integration.

PHASE 3:
OCR normalization + document model.

PHASE 4:
Reading-order engine.

PHASE 5:
Real token highlighting.

PHASE 6:
Speech engine.

PHASE 7:
Reading engine + synchronization.

PHASE 8:
Arabic/RTL.

PHASE 9:
Camera.

PHASE 10:
Storage/cache/offline improvements.

PHASE 11:
Performance/accessibility/error handling.

PHASE 12:
Full integration testing.

PHASE 13:
Production polish.

Do not jump to Darija before the core architecture is stable.

============================================================
6. PHASE 1 — THE MOST IMPORTANT TECHNICAL TEST
===============================================

Before OCR, prove the coordinate system.

Build:

IMAGE
+
OVERLAY
+
TEST RECTANGLE

The test rectangle must use ORIGINAL IMAGE coordinates.

Example:

Original image:

1920 × 1080

Test token:

x = 500
y = 300
width = 150
height = 50

Render the image at different sizes.

The rectangle must remain attached to the same physical region.

Test:

- desktop
- narrow browser
- mobile-sized viewport
- resize
- orientation change
- different aspect ratios

Do NOT continue to OCR until coordinate alignment works reliably.

Create automated tests for the coordinate transformation.

============================================================
7. IMAGE ARCHITECTURE
=====================

Create a dedicated image subsystem.

Responsibilities:

- image loading
- dimension detection
- object URL management
- source preservation
- display sizing
- temporary preprocessing
- coordinate conversion

The original image is immutable.

Temporary OCR preprocessing may create:

- resized image
- grayscale image
- contrast-enhanced image
- thresholded image

But these are processing derivatives.

Never replace the original source.

============================================================
8. DOCUMENT MODEL
=================

Implement a provider-independent internal document model.

Conceptual structure:

{
  id,
  source,
  image,
  ocr,
  reading,
  metadata
}

Each token must contain at least:

{
  id,
  text,
  normalizedText,
  speechText,
  language,
  bbox,
  lineId,
  blockId,
  readingOrder,
  confidence,
  direction,
  status
}

Canonical coordinates MUST always be stored in ORIGINAL IMAGE SPACE.

Never store display-space coordinates as the source of truth.

============================================================
9. OCR ARCHITECTURE
===================

OCR MUST be behind an abstraction.

Create something conceptually equivalent to:

OcrProvider

with methods such as:

initialize()
recognize()
terminate()

Initial provider:

Local Tesseract provider.

The rest of the application must NOT depend directly on Tesseract's raw result structure.

Normalize immediately.

Architecture:

Tesseract
    ↓
Raw OCR result
    ↓
OCR Normalizer
    ↓
Basira Document Model

This is mandatory.

============================================================
10. OCR MUST NOT BLOCK THE UI
=============================

OCR is computationally expensive.

Use a Web Worker or the worker architecture supported by the selected OCR implementation.

The main thread must remain responsive.

The UI must show real OCR state:

- idle
- initializing
- loading
- processing
- complete
- error
- cancelled

Show progress where the provider supports it.

Never fake progress.

============================================================
11. OCR LANGUAGE SUPPORT
========================

MVP must support:

English
Arabic

The architecture must allow future languages.

Do not hard-code English assumptions into:

- token normalization
- reading order
- speech
- UI
- coordinate rendering

Language must be explicit metadata.

============================================================
12. READING ORDER ENGINE
========================

OCR order cannot simply be trusted.

Create a separate reading-order engine.

For English:

left → right
top → bottom

For Arabic:

right → left
top → bottom

Do not simply sort every token globally by x/y.

Use:

BLOCK
→ LINE
→ TOKEN

and then apply language/direction rules.

Support mixed Arabic/English documents.

Do not mirror the image.

Arabic RTL affects text interpretation and reading order.

It does NOT mean the photograph should be flipped.

============================================================
13. HIGHLIGHT ENGINE
====================

Create an independent highlight subsystem.

Input:

TOKEN
+
DISPLAY RECTANGLE

Output:

visual highlight overlay.

The highlight must be:

- transparent
- temporary
- independent from the image
- positioned using transformed coordinates
- responsive to image resizing

Default:

yellow
semi-transparent
rounded rectangle

The highlight engine must not know anything about Tesseract.

============================================================
14. SPEECH ARCHITECTURE
=======================

Create a provider abstraction.

Conceptually:

SpeechProvider

Methods:

initialize()
speak()
pause()
resume()
stop()
getVoices()
supports()

Initial implementation:

BrowserSpeechProvider

using Web Speech API.

Do not assume every browser has the same voices.

Detect capabilities.

Do not claim unsupported language support.

============================================================
15. READING ENGINE
==================

Create a dedicated ReaderController / ReadingEngine.

It owns:

- reading state
- current token
- reading sequence
- speed
- start
- pause
- resume
- stop
- completion

States:

idle
playing
paused
stopped
completed
error

Core flow:

PLAY
↓
get current token
↓
highlight token
↓
speak token
↓
speech completes
↓
mark token spoken
↓
advance
↓
repeat
↓
complete

Do not put this logic directly into button click handlers.

============================================================
16. SYNCHRONIZATION IS A CORE SUBSYSTEM
=======================================

Treat synchronization as one of the most important components in Basira.

Do NOT scatter synchronization logic across:

- UI
- speech callbacks
- OCR
- highlight code

Create a dedicated synchronization controller.

It must prevent:

- duplicate callbacks
- stale speech callbacks
- incorrect token advancement
- race conditions
- old reading sessions modifying new sessions

Every reading session must have a unique session ID.

When an asynchronous callback returns:

verify that it belongs to the active session.

If not:

ignore it.

============================================================
17. SPEECH TIMING LIMITATION
============================

Browser speech does NOT guarantee perfect word-level timing.

Do not pretend it does.

For MVP, token-by-token speech is acceptable for proving the synchronization architecture.

However, design the system so that later it can support:

PHRASE/SENTENCE SPEECH
+
TOKEN ALIGNMENT
+
TIMING

Do not make the current token-by-token implementation impossible to replace.

============================================================
18. USER EXPERIENCE
===================

The UI must be clean and extremely easy.

Primary user flow:

OPEN
↓
UPLOAD OR CAMERA
↓
OCR
↓
READY
↓
PLAY
↓
LISTEN + SEE HIGHLIGHT
↓
PAUSE / RESUME / STOP

Do not expose technical terminology such as:

"bounding box"

"OCR token"

"reading-order engine"

to normal users.

These belong in diagnostic mode.

============================================================
19. REQUIRED UI
===============

Create:

- application header
- image reader area
- original image
- highlight overlay
- upload button
- camera button
- OCR status
- Play
- Pause
- Stop
- language selector
- voice selector
- speed control
- settings
- error/status messages

The reader/image area is the primary visual element.

Do not make the interface look like an admin dashboard.

The photograph must receive the visual focus.

============================================================
20. DIAGNOSTIC MODE
===================

Create a developer diagnostic mode.

It should optionally display:

- block boundaries
- line boundaries
- token boundaries
- token IDs
- confidence
- reading order
- language
- direction
- original coordinates
- transformed coordinates
- current token

Example:

TOKEN 42
text: الكتاب
language: ar
direction: rtl
confidence: 93
bbox: 810,340,120,48
readingOrder: 42

This mode is essential for debugging.

Normal users should not see it by default.

============================================================
21. ARABIC MUST BE FIRST CLASS
==============================

Arabic support must include:

- RTL
- Arabic text
- Arabic punctuation
- connected letters
- diacritics
- Arabic/Latin mixed text
- numbers
- reading order
- Arabic speech where available

Do not solve Arabic by simply setting:

direction: rtl

That is insufficient.

Test real Arabic pages.

The image itself must remain unmodified and unmirrored.

============================================================
22. DARIJA
==========

Do NOT implement fake Darija support.

Do NOT label Arabic speech as Darija.

Do NOT claim Darija support merely because Arabic OCR works.

Darija is a separate future speech capability.

Create an architecture that allows:

Darija text
→ Darija normalization
→ Darija speech provider
→ synchronization

Research and implement Darija only after the core reader is stable.

============================================================
23. PRIVACY
===========

Local-first.

The default flow must be:

USER IMAGE
↓
DEVICE
↓
LOCAL OCR
↓
LOCAL DOCUMENT MODEL
↓
LOCAL SPEECH WHERE AVAILABLE

No mandatory image upload to a server.

Do not introduce external APIs without a clear reason.

If an external provider is ever introduced, make it optional and explicit.

============================================================
24. STORAGE
===========

Use IndexedDB when persistent local storage becomes necessary.

Possible stores:

documents
ocr-results
settings
reading-progress
cache

Do not store duplicate large blobs unnecessarily.

OCR results should be cacheable.

A cache key should account for:

image identity/hash
OCR language
preprocessing configuration
OCR engine/version

Never rerun expensive OCR unnecessarily.

============================================================
25. ERROR HANDLING
==================

Every subsystem needs real error handling.

OCR failure:

"Couldn't read this image. Try a clearer photo."

Speech failure:

"Speech is unavailable for this language/browser."

Camera failure:

"Camera unavailable. You can upload an image instead."

Do not expose technical stack traces to users.

Log detailed errors in development mode.

============================================================
26. LOGGING
===========

Use structured development logs:

[IMAGE]
[OCR]
[OCR-NORMALIZER]
[READING-ORDER]
[SPEECH]
[SYNC]
[HIGHLIGHT]
[CAMERA]
[STORAGE]

Example:

[OCR] Processing started
[OCR] Language: ara
[OCR] Tokens: 143
[READING-ORDER] Direction: rtl
[SYNC] Session started
[SYNC] Current token: token-42
[SPEECH] Speaking token-42
[HIGHLIGHT] token-42

Do not flood production console unnecessarily.

============================================================
27. ACCESSIBILITY
=================

Implement:

- semantic buttons
- keyboard navigation
- visible focus
- accessible labels
- readable status messages
- sufficient contrast
- keyboard control
- screen-reader-friendly controls

Do not sacrifice accessibility for visual effects.

============================================================
28. SECURITY
============

Treat:

- uploaded images
- filenames
- OCR text

as untrusted data.

Never inject OCR output through unsafe innerHTML.

Use safe text APIs.

Do not execute metadata.

Revoke object URLs when appropriate.

============================================================
29. PERFORMANCE
===============

Do not:

- initialize OCR at application startup unnecessarily
- block the main thread
- rerun OCR during playback
- recreate all highlight elements every animation frame
- perform expensive DOM work during resize

Use:

- lazy loading
- workers
- caching
- ResizeObserver
- efficient DOM updates

============================================================
30. TESTING
===========

You are responsible for writing and running tests.

At minimum test:

COORDINATES

- original → display
- resize
- different aspect ratios

READING ORDER

- English
- Arabic
- multiple lines
- multiple blocks
- mixed direction

TOKENS

- punctuation
- Arabic
- English
- numbers

READER STATE

- idle → playing
- playing → paused
- paused → playing
- playing → stopped
- playing → completed

RACE CONDITIONS

- session A starts
- session B starts
- A callback returns
- A must NOT modify B

INTEGRATION

- image upload
- OCR
- tokens
- highlight
- speech
- pause
- resume
- stop

============================================================
31. REAL IMAGE TESTING
======================

Do not test only with synthetic hard-coded data.

Use real test images.

Test:

- English books
- Arabic books
- newspaper layouts
- multiple columns
- small text
- large text
- tilted images
- shadows
- uneven lighting
- low-resolution photographs

If suitable test images are not available in the repository, create a test fixture strategy without embedding fake OCR as the production implementation.

============================================================
32. ACCEPTANCE TEST — THE MOST IMPORTANT TEST
==============================================

The following must work:

REAL IMAGE
↓
LOCAL OCR
↓
REAL TOKEN
↓
CORRECT ORIGINAL COORDINATES
↓
CORRECT DISPLAY COORDINATES
↓
REAL HIGHLIGHT
↓
REAL SPEECH
↓
HIGHLIGHT ADVANCES
↓
PAUSE
↓
RESUME
↓
STOP

Then resize the browser.

The highlight must remain aligned.

If this does not work, Basira is NOT complete.

============================================================
33. DO NOT CHEAT
================

Forbidden shortcuts:

- hard-coded OCR boxes in production
- fake OCR results
- fake speech
- fake progress
- fake Arabic support
- fake Darija support
- fake offline mode
- replacing images with OCR HTML
- drawing permanent highlights onto source images
- cloud API disguised as local processing
- declaring completion without testing

A demo that only looks correct is not enough.

The underlying architecture must actually work.

============================================================
34. CODE QUALITY
================

Use:

- small modules
- clear names
- explicit interfaces
- minimal coupling
- reusable utilities
- comments only where they add real value

Avoid:

- giant app.js
- global mutable state everywhere
- duplicated OCR logic
- duplicated coordinate calculations
- speech logic inside UI components
- provider-specific logic in domain models

Keep these responsibilities separate:

IMAGE
OCR
DOCUMENT
READING ORDER
SPEECH
SYNC
HIGHLIGHT
UI
STORAGE

============================================================
35. DOCUMENTATION
=================

Create/update:

docs/architecture.md
docs/IMPLEMENTATION_STATUS.md
docs/testing.md

When making an important architectural decision, create:

docs/decisions/XXXX-description.md

Each decision should contain:

Context
Decision
Reason
Alternatives
Consequences

============================================================
36. DEVELOPMENT CHECKPOINTS
===========================

After each major phase:

1. Run the application.
2. Run tests.
3. Inspect console.
4. Inspect UI.
5. Verify acceptance criteria.
6. Fix failures.
7. Update IMPLEMENTATION_STATUS.md.
8. Only then continue.

Do not implement five phases and test at the end.

============================================================
37. IF YOU ENCOUNTER EXISTING CODE
==================================

Inspect before replacing.

If existing code is good:

preserve it.

If existing code conflicts with the specification:

refactor it.

If existing code is incomplete:

complete it.

If existing code is fundamentally incompatible:

replace it carefully.

Do not destroy the project unnecessarily.

============================================================
38. DEPENDENCY DISCIPLINE
=========================

Before installing a package:

determine whether it is actually necessary.

Prefer stable, maintained, browser-compatible packages.

Avoid dependency bloat.

Do not add five libraries to solve a problem that can be solved by native browser APIs.

============================================================
39. UI DESIGN DIRECTION
=======================

Basira should feel like a serious accessibility/productivity tool.

Visual principles:

- clean
- modern
- calm
- focused
- professional
- readable
- responsive

Avoid:

- excessive gradients
- excessive animations
- dashboard-style cards everywhere
- unnecessary decoration
- visual clutter

The image is the hero.

The reading controls are secondary.

============================================================
40. FUTURE-PROOFING
===================

The architecture must allow:

OCR providers:

Tesseract
FutureLocalOCR
FutureDesktopOCR
OptionalCloudOCR

Speech providers:

BrowserSpeech
LocalTTS
DarijaTTS
OptionalCloudTTS

Do not require the ReadingEngine to know which provider is being used.

============================================================
41. DO NOT OVERENGINEER MVP
===========================

Do not build:

authentication
accounts
payments
cloud synchronization
social features
AI chat
translation
dictionary
multi-page books
custom neural TTS

before the core reading engine works.

The core product is:

PHOTO
+
OCR
+
TOKENS
+
READING ORDER
+
SPEECH
+
HIGHLIGHT
+
SYNCHRONIZATION

============================================================
42. FIRST MILESTONE
===================

Your first actual coding milestone is:

UPLOAD IMAGE
↓
SHOW ORIGINAL IMAGE
↓
SHOW TEST OVERLAY
↓
CORRECT COORDINATE TRANSFORMATION
↓
RESIZE
↓
VERIFY ALIGNMENT

Do not start with OCR.

Prove geometry first.

============================================================
43. SECOND MILESTONE
====================

Then implement:

REAL LOCAL OCR
↓
NORMALIZED TOKENS
↓
TOKEN BBOX
↓
REAL HIGHLIGHT

The user must be able to visually see that OCR coordinates correspond to the actual photograph.

============================================================
44. THIRD MILESTONE
===================

Then:

REAL TOKEN
↓
SPEECH
↓
CURRENT TOKEN
↓
HIGHLIGHT
↓
NEXT TOKEN

Implement pause/resume/stop.

============================================================
45. FOURTH MILESTONE
====================

Then Arabic:

Arabic OCR
+
Arabic reading order
+
RTL UI
+
Arabic speech where available
+
mixed Arabic/English

============================================================
46. FIFTH MILESTONE
===================

Then:

camera
storage
cache
offline improvements
responsive/mobile
accessibility
performance
polish

============================================================
47. FINAL MILESTONE
===================

Run the complete acceptance suite.

Do not call the application finished until the complete flow works on a real image.

============================================================
48. WHEN SOMETHING GOES WRONG
=============================

Diagnose by layer.

If highlight is wrong:

OCR bbox
→ image dimensions
→ rendered dimensions
→ coordinate transform
→ overlay position
→ CSS

If reading order is wrong:

OCR
→ blocks
→ lines
→ direction
→ ordering

If speech/highlight synchronization is wrong:

token sequence
→ speech provider
→ callback
→ session ID
→ current index
→ highlight

Do not randomly modify unrelated modules.

============================================================
49. CURRENT EXECUTION COMMAND
=============================

START NOW.

First:

1. Read the complete specification file.
2. Inspect the workspace.
3. Create/update docs/IMPLEMENTATION_STATUS.md.
4. Build Phase 1.
5. Run it.
6. Test coordinate alignment.
7. Fix all issues.
8. Only after Phase 1 passes, proceed to Phase 2.
9. Continue autonomously through the phases.

At each checkpoint, verify the application rather than assuming it works.

============================================================
50. IMPORTANT — DO NOT JUST REPORT
===================================

Your response to me should NOT simply be:

"I understand."

"I created the files."

"The architecture is ready."

Instead, perform the work.

When you need to report progress, give me:

CURRENT PHASE
WHAT WAS BUILT
FILES CREATED/MODIFIED
TESTS RUN
RESULTS
ISSUES FOUND
ISSUES FIXED
NEXT PHASE

Keep the report concise.

============================================================
51. FINAL PRODUCT TEST
======================

Before declaring Basira complete, demonstrate that this real workflow exists:

1. User opens Basira.
2. User uploads a real photograph.
3. Basira displays the original photograph.
4. Basira runs local OCR.
5. Basira creates structured tokens.
6. Basira determines reading order.
7. User presses Play.
8. Speech begins.
9. Current token is highlighted on the original photograph.
10. Highlight advances.
11. User pauses.
12. Reading pauses.
13. User resumes.
14. Reading continues.
15. User stops.
16. Highlight stops.
17. Browser is resized.
18. Highlight remains geometrically correct.
19. Arabic page can use RTL reading order.
20. No mandatory cloud API is required.

============================================================
52. THE CORE PRODUCT PROMISE
============================

Never lose sight of this:

Basira lets a person SEE THE REAL PAGE while Basira UNDERSTANDS THE PAGE and READS IT ALOUD.

The photograph remains the document.

OCR tells Basira where the words are.

The Reading Engine decides what comes next.

Speech provides the voice.

Synchronization connects speech to tokens.

The Highlight Engine shows the user exactly where Basira is reading.

That is the product.

BUILD IT.

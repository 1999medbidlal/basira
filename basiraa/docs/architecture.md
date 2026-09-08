# Basira — System Architecture

**Document Version**: 2.1.0  
**Status**: ACTIVE

---

## 1. Core Architectural Axioms

1. **Immutable Visual Source of Truth**:
   The uploaded/captured photograph is the immutable source of truth. It is never overwritten, redrawn, or replaced by OCR text.
2. **Separation of OCR Recognition Accuracy vs Coordinate Transformation Accuracy**:
   - *OCR Recognition Accuracy*: The quality of character/word recognition and bounding box estimation produced by the OCR engine.
   - *Coordinate Transformation Accuracy*: The exact, drift-free mathematical scaling and offset mapping between canonical **Original Image Space** and transient **Display Viewport Space**.
3. **Canonical Coordinate Invariant**:
   All canonical bounding boxes (`Token.bbox`, `Line.bbox`, `Block.bbox`) are strictly stored in **ORIGINAL IMAGE SPACE** `(x, y, width, height)`. Display-space coordinates are transiently computed values during rendering and are never stored as canonical document metadata.
4. **Canonical Document Pipeline**:
   ```
   IMAGE (Original Dimensions)
         ↓
     DOCUMENT
         ↓
      BLOCKS
         ↓
       LINES
         ↓
      TOKENS (Canonical BBox in Original Image Space)
         ↓
   READING ORDER (LTR / RTL / Mixed)
   ```
5. **Session-Isolated Synchronization**:
   Every reading session receives an immutable `readingSessionId`. All asynchronous speech and highlight callbacks verify session validity before mutating reader state, eliminating race conditions.

---

## 2. Coordinate System Mathematics & Round-Trip Invariant

Given an original image with pixel dimensions $(W_{\text{orig}}, H_{\text{orig}})$ and its rendered element rect in the display viewport $(W_{\text{disp}}, H_{\text{disp}})$ with optional container offsets $(\text{offsetX}, \text{offsetY})$:

### Forward Transformation (Original Space $\to$ Display Space)
$$\text{scaleX} = \frac{W_{\text{disp}}}{W_{\text{orig}}}, \quad \text{scaleY} = \frac{H_{\text{disp}}}{H_{\text{orig}}}$$

$$x_{\text{disp}} = x_{\text{orig}} \cdot \text{scaleX} + \text{offsetX}$$
$$y_{\text{disp}} = y_{\text{orig}} \cdot \text{scaleY} + \text{offsetY}$$
$$w_{\text{disp}} = w_{\text{orig}} \cdot \text{scaleX}$$
$$h_{\text{disp}} = h_{\text{orig}} \cdot \text{scaleY}$$

### Reverse Transformation (Display Space $\to$ Original Space)
$$x_{\text{orig}} = \frac{x_{\text{disp}} - \text{offsetX}}{\text{scaleX}}$$
$$y_{\text{orig}} = \frac{y_{\text{disp}} - \text{offsetY}}{\text{scaleY}}$$
$$w_{\text{orig}} = \frac{w_{\text{disp}}}{\text{scaleX}}$$
$$h_{\text{orig}} = \frac{h_{\text{disp}}}{\text{scaleY}}$$

### Round-Trip Invariant
For any valid axis-aligned bounding box $B_{\text{orig}}$:
$$|\text{transformDisplayToOriginal}(\text{transformBboxToDisplay}(B_{\text{orig}})) - B_{\text{orig}}| < \epsilon \quad (\epsilon = 10^{-4})$$

---

## 3. Subsystem Architecture

```
                      ┌─────────────────────────┐
                      │      ORIGINAL PHOTO     │
                      └────────────┬────────────┘
                                   │
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
       ┌───────────────┐                       ┌───────────────┐
       │  LOCAL OCR    │                       │  IMAGE VIEWER │
       │ (Tesseract.js)│                       │  + OVERLAY    │
       └───────┬───────┘                       └───────▲───────┘
               │                                       │
               ▼                                       │
       ┌───────────────┐                               │
       │ OCR NORMALIZER│                               │
       └───────┬───────┘                               │
               │                                       │
               ▼                                       │
       ┌───────────────┐                               │
       │   DOCUMENT    │ (Canonical Original Coords)   │
       │     MODEL     │                               │
       └───────┬───────┘                               │
               │                                       │
               ▼                                       │
       ┌───────────────┐                               │
       │ READING ORDER │ (Block → Line → Token)        │
       │ (LTR / RTL)   │                               │
       └───────┬───────┘                               │
               │                                       │
               ▼                                       │
       ┌───────────────┐                               │
       │ TOKEN QUEUE   │                               │
       └───────┬───────┘                               │
               │                                       │
               ▼                                       │
       ┌───────────────┐       Transformed Coords      │
       │ SYNCHRONIZER  │───────────────────────────────┤
       │ (Session ID)  │                               │
       └───────┬───────┘                               │
               │                                       │
               ▼                                       │
       ┌───────────────┐                               │
       │ SPEECH ENGINE │                               │
       │ (Web Speech)  │                               │
       └───────────────┘                               │
               │                                       │
               ▼                                       ▼
       ┌───────────────┐                       ┌───────────────┐
       │  SPOKEN WORD  │                       │ LIVE HIGHLIGHT│
       │     AUDIO     │                       │ (Current Box) │
       └───────────────┘                       └───────────────┘
```

---

## 4. Canonical Token Model Specification

Every token in the canonical document model complies with:

```typescript
interface Token {
  id: string;              // e.g. 'token-42'
  text: string;            // Raw detected word
  normalizedText: string;  // Normalized word
  speechText: string;      // Word cleaned for TTS
  language: string;        // 'en' | 'ar'
  direction: 'ltr' | 'rtl';
  bbox: {                  // Invariant: ORIGINAL IMAGE PIXELS
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blockId: string;         // e.g. 'block-1'
  lineId: string;          // e.g. 'line-3'
  readingOrder: number;    // Continuous sequence index: 0, 1, 2, ...
  confidence: number;      // 0 - 100
  status: 'pending' | 'current' | 'spoken' | 'skipped' | 'error';
}
```

import io
import cv2
import easyocr
import numpy as np
import base64
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

reader = easyocr.Reader(['ar', 'en'])

def replace_ar_to_en_num(text):
    eastern = '٠١٢٣٤٥٦٧٨٩'
    western = '0123456789'
    return text.translate(str.maketrans(eastern, western))

@app.post("/api/ocr")
async def process_image(request: Request):
    try:
        content_type = request.headers.get("content-type", "")
        if "multipart/form-data" in content_type:
            form = await request.form()
            file = form.get("file")
            contents = await file.read()
        else:
            body = await request.json()
            image_data = body.get("image", "")
            if "," in image_data:
                image_data = image_data.split(",")[1]
            contents = base64.b64decode(image_data)

        image = np.array(Image.open(io.BytesIO(contents)).convert("RGB"))
    except Exception as e:
        return {"error": f"Invalid image format: {str(e)}"}, 400

    raw_result = reader.readtext(image)
    
    tokens = []
    for idx, (bbox, text, prob) in enumerate(raw_result):
        xs = [pt[0] for pt in bbox]
        ys = [pt[1] for pt in bbox]
        clean_text = replace_ar_to_en_num(text)
        
        # Format matching Basira's standard token structure
        tokens.append({
            "id": f"token_{idx}",
            "text": clean_text,
            "confidence": float(prob),
            "bbox": [
                int(min(xs)),
                int(min(ys)),
                int(max(xs)),
                int(max(ys))
            ]
        })
        
    full_text = " ".join([t["text"] for t in tokens])

    # Return structure matching Basira's normalization expectations
    return {
        "text": full_text,
        "tokens": tokens,
        "blocks": [],
        "lines": [],
        "width": image.shape[1],
        "height": image.shape[0],
        "direction": "rtl"
    }
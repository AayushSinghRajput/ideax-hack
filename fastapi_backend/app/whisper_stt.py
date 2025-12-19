import whisper

model = whisper.load_model("small")

def transcribe_audio(audio_path: str) -> dict:
    result = model.transcribe(
        audio_path,
        language="ne",
        task="translate",
        fp16=False
    )
    return {
        "text": result["text"],
        "language": result["language"]
    }

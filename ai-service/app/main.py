from fastapi import FastAPI
from app.routes.classify import router as classify_router
from app.routes.analyze import router as analyze_router

app = FastAPI()

app.include_router(classify_router)
app.include_router(analyze_router)

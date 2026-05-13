import os
import dotenv

dotenv.load_dotenv()

# from pydantic_ai.models.google import GoogleModel
# from pydantic_ai.providers.google import GoogleProvider

# def _get_gemini_client():
#     api_key = os.getenv("GEMINI_API_KEY", "")
#     if not api_key:
#         raise ValueError("Không tìm thấy Gemini API Key.")
#     provider = GoogleProvider(api_key=api_key)
#     model = GoogleModel('gemini-2.5-flash', provider=provider)
#     return model

from pydantic_ai.models.openrouter import OpenRouterModel
from pydantic_ai.providers.openrouter import OpenRouterProvider
import os
import dotenv
import json

dotenv.load_dotenv()

def _get_open_router_client():
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        raise ValueError("Không tìm thấy OpenRouter API Key.")
    provider = OpenRouterProvider(api_key=api_key)
    model = OpenRouterModel('openai/gpt-oss-120b:free', provider=provider)
    return model

from openai import OpenAI


from pydantic import BaseModel, Field
from pydantic_ai import Agent
from typing import List, Optional
from datetime import date
from vncv.ocr import extract_text


class ActiveIngredient(BaseModel):
    name: str = Field(..., description="Tên hoạt chất")
    content: str = Field(..., description="Hàm lượng hoạt chất")


class ProductInfo(BaseModel):
    product_name: str = Field(..., description="Tên sản phẩm")
    product_type: str = Field(..., description="Loại sản phẩm")
    manufacturer: str = Field(..., description="Nhà sản xuất")
    registration_number: Optional[str] = Field(
        None,
        description="Số đăng ký"
    )

    active_ingredients: List[ActiveIngredient] = Field(
        ...,
        description="Danh sách hoạt chất"
    )

    dosage: Optional[str] = Field(
        None,
        description="Liều lượng sử dụng"
    )

    target_crops: Optional[List[str]] = Field(
        None,
        description="Danh sách cây trồng áp dụng"
    )

    target_pests: Optional[List[str]] = Field(
        None,
        description="Danh sách bệnh/dịch hại"
    )

    pre_harvest_interval_days: Optional[int] = Field(
        None,
        description="Thời gian cách ly trước thu hoạch (ngày)"
    )

    expiry_date: Optional[date] = Field(
        None,
        description="Ngày hết hạn"
    )

    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Độ tin cậy OCR/trích xuất"
    )

def extract_text_from_image(image_path: str) -> List[str]:
    results = extract_text(image_path, lang="vi")
    return  results

client = OpenAI(
    api_key=os.getenv("wokushop_api_key"),
    base_url="https://llm.wokushop.com/v1",
)

def get_answer_from_LLM(prompt: str) -> str:
    resp = client.responses.parse(
        model="gpt-4o-mini",
        input=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        text_format=ProductInfo,
    )
    if not resp.output_parsed:
        raise ValueError("LLM return error.")
    return resp.output_parsed.model_dump_json()


async def extract_product_info(transcript_text: str) -> dict:
    """Trích xuất thông tin sản phẩm từ OCR."""
    prompt = (
        "Dựa vào đoạn OCR text sau, hãy trích xuất thông tin sản phẩm. OCR có thể chứa lỗi, hãy cố gắng trích xuất thông tin chính xác nhất có thể và đánh giá độ tin cậy của thông tin đó. Những field không chỉ rõ trong OCR có thể để trống hoặc null.\n\n"
        "Trả về JSON với product_name (str), product_type (str), manufacturer (str), registration_number (str), active_ingredients (List[ActiveIngredient]), dosage (str), target_crops (List[str]), target_pests (List[str]), pre_harvest_interval_days (int), expiry_date (date), và confidence_score (float).\n\n"
        f"OCR Text:\n{transcript_text[:3000]}"
    )
    result = get_answer_from_LLM(prompt)
    return json.loads(result)
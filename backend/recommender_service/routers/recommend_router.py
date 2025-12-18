from fastapi import APIRouter, HTTPException
from modules import hybrid

router = APIRouter()

hybrid.init_models()

@router.get("/recommend")
def get_recommendations(userId: int):
    try:
        print(f"[Python Service] Getting recommendations for userId: {userId}")
        recommendations = hybrid.hybrid_recommend(userId, top_k=10)
        print(f"[Python Service] Found {len(recommendations)} recommendations: {recommendations}")
        return {
            "userId": userId,
            "recommendations": recommendations
        }
    except Exception as e:
        print(f"[Python Service] Error getting recommendations: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/similar-products")
def get_similar_products(productId: int):
    try:
        similar = hybrid.similar_products(productId, top_k=10)
        return {
            "productId": productId,
            "similar": similar
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

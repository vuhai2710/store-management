import pandas as pd
from modules import loader, preprocess

def recommend_by_view_history(user_id: int, products_df: pd.DataFrame, top_k: int = 10):
    print(f"[Collaborative] Loading view history for user_id: {user_id}")
    views_df = loader.load_user_history(user_id, limit=200)
    print(f"[Collaborative] Loaded {len(views_df)} views")
    
    if views_df.empty:
        print(f"[Collaborative] No view history found for user_id: {user_id}")
        return []
    
    preferences = preprocess.get_user_preference_from_views(views_df, products_df)
    
    candidates = products_df.copy()
    
    candidates["score"] = 0
    
    if preferences["categories"]:
        category_mask = candidates["category"].isin(preferences["categories"])
        candidates.loc[category_mask, "score"] += 2
    
    if preferences["brands"]:
        brand_mask = candidates["brand"].isin(preferences["brands"])
        candidates.loc[brand_mask, "score"] += 1
    
    viewed_product_ids = views_df["product_id"].unique()
    candidates = candidates[~candidates["id"].isin(viewed_product_ids)]
    
    candidates = candidates.sort_values("score", ascending=False)
    top_products = candidates.head(top_k * 2)
    
    return top_products["id"].tolist()

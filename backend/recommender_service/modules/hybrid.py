from modules import loader, content_based, collaborative

_initialized = False
_products_df = None

def init_models():
    global _initialized, _products_df
    
    if _initialized:
        return
    
    _products_df = loader.load_products()
    
    content_based.init_content_model(_products_df)
    
    _initialized = True

def hybrid_recommend(user_id: int, top_k: int = 10):
    global _initialized, _products_df
    
    if not _initialized:
        init_models()
    
    collaborative_recs = collaborative.recommend_by_view_history(user_id, _products_df, top_k * 2)
    
    if not collaborative_recs:
        return []
    
    similar_products_list = []
    for product_id in collaborative_recs[:2]:
        similar = content_based.similar_products(int(product_id), top_k=5)
        similar_products_list.extend(similar)
    
    merged_ids = []
    seen = set()
    
    for pid in collaborative_recs:
        if pid not in seen:
            merged_ids.append(int(pid))
            seen.add(pid)
    
    for pid in similar_products_list:
        if pid not in seen:
            merged_ids.append(int(pid))
            seen.add(pid)
    
    return merged_ids[:top_k]

def similar_products(product_id: int, top_k: int = 10):
    global _initialized
    
    if not _initialized:
        init_models()
    
    return content_based.similar_products(product_id, top_k)

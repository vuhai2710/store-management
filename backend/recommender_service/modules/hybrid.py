from modules import loader, content_based, collaborative

# Global initialization flag
_initialized = False
_products_df = None

def init_models():
    """Initialize all models globally"""
    global _initialized, _products_df
    
    if _initialized:
        return
    
    # Load all products
    _products_df = loader.load_products()
    
    # Initialize content-based model
    content_based.init_content_model(_products_df)
    
    _initialized = True

def hybrid_recommend(user_id: int, top_k: int = 10):
    """
    Hybrid recommendation combining collaborative filtering and content-based filtering.
    """
    global _initialized, _products_df
    
    # Ensure models are initialized
    if not _initialized:
        init_models()
    
    # Get recommendations from view history
    collaborative_recs = collaborative.recommend_by_view_history(user_id, _products_df, top_k * 2)
    
    if not collaborative_recs:
        return []
    
    # Get similar products for the first 1-2 products from collaborative recommendations
    similar_products_list = []
    for product_id in collaborative_recs[:2]:
        similar = content_based.similar_products(int(product_id), top_k=5)
        similar_products_list.extend(similar)
    
    # Merge the lists, preserving order and removing duplicates
    merged_ids = []
    seen = set()
    
    # Add collaborative recommendations first
    for pid in collaborative_recs:
        if pid not in seen:
            merged_ids.append(int(pid))
            seen.add(pid)
    
    # Add similar products
    for pid in similar_products_list:
        if pid not in seen:
            merged_ids.append(int(pid))
            seen.add(pid)
    
    # Truncate to top_k
    return merged_ids[:top_k]

def similar_products(product_id: int, top_k: int = 10):
    """
    Get similar products to a given product using content-based filtering.
    """
    global _initialized
    
    # Ensure models are initialized
    if not _initialized:
        init_models()
    
    return content_based.similar_products(product_id, top_k)


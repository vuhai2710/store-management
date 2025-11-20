import pandas as pd
from collections import Counter

def get_user_preference_from_views(views_df, products_df):
    """
    Extract user preferences from view history.
    Returns top categories and brands based on view frequency.
    """
    if views_df.empty or products_df.empty:
        return {"categories": [], "brands": []}
    
    # Merge views with products
    merged = views_df.merge(
        products_df,
        left_on="product_id",
        right_on="id",
        how="inner"
    )
    
    if merged.empty:
        return {"categories": [], "brands": []}
    
    # Count category occurrences
    category_counts = Counter(merged["category"].dropna())
    top_categories = [cat for cat, _ in category_counts.most_common(5)]
    
    # Count brand occurrences
    brand_counts = Counter(merged["brand"].dropna())
    top_brands = [brand for brand, _ in brand_counts.most_common(5)]
    
    return {
        "categories": top_categories,
        "brands": top_brands
    }


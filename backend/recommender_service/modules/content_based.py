import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Global variables to store the model
_products_df = None
_vectorizer = None
_similarity_matrix = None

def init_content_model(products_df):
    """Initialize the content-based model with product data"""
    global _products_df, _vectorizer, _similarity_matrix
    
    _products_df = products_df.copy()
    
    # Create combined text column from category + brand + description
    _products_df["text"] = (
        _products_df["category"].fillna("") + " " +
        _products_df["brand"].fillna("") + " " +
        _products_df["description"].fillna("")
    )
    
    # Initialize TF-IDF vectorizer
    _vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
    
    # Fit and transform the text data
    tfidf_matrix = _vectorizer.fit_transform(_products_df["text"])
    
    # Compute cosine similarity matrix
    _similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    return True

def similar_products(product_id: int, top_k: int = 10):
    """
    Find similar products to the given product_id.
    Returns a list of product IDs (excluding the product itself).
    """
    global _products_df, _similarity_matrix
    
    if _products_df is None or _similarity_matrix is None:
        raise ValueError("Model not initialized. Call init_content_model first.")
    
    # Find the index of the product
    product_indices = _products_df[_products_df["id"] == product_id].index
    
    if len(product_indices) == 0:
        return []
    
    product_idx = product_indices[0]
    
    # Get similarity scores for this product
    similarity_scores = _similarity_matrix[product_idx]
    
    # Get top K similar products (excluding the product itself)
    top_indices = np.argsort(similarity_scores)[::-1]
    top_indices = [idx for idx in top_indices if _products_df.iloc[idx]["id"] != product_id][:top_k]
    
    # Return product IDs
    similar_product_ids = _products_df.iloc[top_indices]["id"].tolist()
    
    return similar_product_ids


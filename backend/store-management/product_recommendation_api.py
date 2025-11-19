"""
API endpoint cho hệ thống gợi ý sản phẩm
Nhận product_id từ command line argument và trả về JSON
"""

import sys
import json
import pandas as pd
from product_recommendation import (
    preprocess_text,
    build_tfidf_matrix,
    get_similar_products
)
from typing import List, Dict, Any

def get_recommendations_from_database(product_id: int, top_n: int = 5) -> List[Dict[str, Any]]:
    """
    Lấy gợi ý sản phẩm từ database (giả lập bằng DataFrame)
    Trong thực tế, hàm này sẽ đọc từ database thông qua JDBC hoặc REST API
    
    Args:
        product_id: ID sản phẩm cần tìm sản phẩm tương tự
        top_n: Số lượng sản phẩm tương tự cần lấy
        
    Returns:
        Danh sách sản phẩm tương tự dưới dạng JSON
    """
    # TODO: Thay thế bằng việc đọc từ database thực tế
    # Hiện tại sử dụng dữ liệu mẫu
    from product_recommendation import create_sample_dataframe
    
    df = create_sample_dataframe()
    df['combined_text'] = df['name'] + ' ' + df['description']
    df['processed_text'] = df['combined_text'].apply(preprocess_text)
    
    # Xây dựng ma trận TF-IDF
    tfidf_matrix, vectorizer, product_ids = build_tfidf_matrix(df, 'processed_text')
    
    # Lấy sản phẩm tương tự
    similar_products = get_similar_products(
        product_id, df, tfidf_matrix, product_ids, top_n=top_n
    )
    
    return similar_products


def main():
    """
    Main function: Nhận product_id từ command line và trả về JSON
    Usage: python product_recommendation_api.py <product_id> [top_n]
    """
    try:
        # Lấy product_id từ command line argument
        if len(sys.argv) < 2:
            error_response = {
                "error": "Missing product_id parameter",
                "usage": "python product_recommendation_api.py <product_id> [top_n]"
            }
            print(json.dumps(error_response, ensure_ascii=False))
            sys.exit(1)
        
        product_id = int(sys.argv[1])
        top_n = int(sys.argv[2]) if len(sys.argv) > 2 else 5
        
        # Lấy gợi ý sản phẩm
        recommendations = get_recommendations_from_database(product_id, top_n)
        
        # Trả về JSON
        result = {
            "product_id": product_id,
            "top_n": top_n,
            "recommendations": recommendations
        }
        
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except ValueError as e:
        error_response = {
            "error": f"Invalid parameter: {str(e)}",
            "usage": "python product_recommendation_api.py <product_id> [top_n]"
        }
        print(json.dumps(error_response, ensure_ascii=False))
        sys.exit(1)
    except Exception as e:
        error_response = {
            "error": str(e),
            "type": type(e).__name__
        }
        print(json.dumps(error_response, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    main()


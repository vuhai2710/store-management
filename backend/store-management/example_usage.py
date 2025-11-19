"""
Ví dụ sử dụng hệ thống gợi ý sản phẩm
"""

from product_recommendation import (
    create_sample_dataframe,
    preprocess_text,
    build_tfidf_matrix,
    get_similar_products,
    save_recommendations_to_json
)
import json

# Tạo dữ liệu
df = create_sample_dataframe()

# Kết hợp name + description
df['combined_text'] = df['name'] + ' ' + df['description']

# Xử lý văn bản
df['processed_text'] = df['combined_text'].apply(preprocess_text)

# Xây dựng ma trận TF-IDF
tfidf_matrix, vectorizer, product_ids = build_tfidf_matrix(df, 'processed_text')

# Tìm sản phẩm tương tự cho sản phẩm ID = 1
product_id = 1
similar_products = get_similar_products(
    product_id, 
    df, 
    tfidf_matrix, 
    product_ids, 
    top_n=5
)

# In kết quả
print(f"Sản phẩm gợi ý cho sản phẩm ID {product_id}:")
print(json.dumps(similar_products, ensure_ascii=False, indent=2))

# Lưu vào file JSON
save_recommendations_to_json(
    product_id, 
    df, 
    tfidf_matrix, 
    product_ids, 
    'recommendations.json',
    top_n=5
)


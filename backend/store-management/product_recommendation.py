"""
Hệ thống gợi ý sản phẩm sử dụng Content-based Filtering
Pipeline:
1. Xử lý ngôn ngữ (text preprocessing)
2. Chuyển văn bản thành vector bằng TF-IDF
3. Tính độ tương đồng bằng Cosine Similarity
4. Lấy top 5 sản phẩm tương tự nhất
"""

import pandas as pd
import numpy as np
import re
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any

# ============================================================
# A) TẠO DỮ LIỆU MẪU
# ============================================================

def create_sample_dataframe() -> pd.DataFrame:
    """
    Tạo DataFrame mẫu với các sản phẩm điện tử
    """
    data = {
        'product_id': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'name': [
            'iPhone 15 Pro Max 256GB',
            'Samsung Galaxy S24 Ultra',
            'MacBook Pro M3 14 inch',
            'Dell XPS 15 Laptop',
            'iPad Air 5th Gen',
            'Samsung Galaxy Tab S9',
            'AirPods Pro 2',
            'Sony WH-1000XM5 Headphones',
            'Apple Watch Series 9',
            'Samsung Galaxy Watch 6'
        ],
        'description': [
            'Điện thoại thông minh cao cấp với chip A17 Pro, camera 48MP, màn hình 6.7 inch Super Retina XDR, pin lâu dài, hỗ trợ 5G',
            'Smartphone flagship với bút S Pen, camera 200MP, màn hình Dynamic AMOLED 6.8 inch, chip Snapdragon 8 Gen 3, pin 5000mAh',
            'Laptop Apple với chip M3, RAM 16GB, SSD 512GB, màn hình Retina 14.2 inch, pin lâu dài, thiết kế mỏng nhẹ',
            'Laptop cao cấp Dell với CPU Intel Core i7, RAM 16GB, SSD 512GB, màn hình 15.6 inch 4K, card đồ họa NVIDIA RTX',
            'Máy tính bảng Apple với chip M1, màn hình 10.9 inch Liquid Retina, hỗ trợ Apple Pencil, pin lâu dài, thiết kế mỏng',
            'Tablet Samsung với chip Snapdragon 8 Gen 2, màn hình 11 inch Super AMOLED, hỗ trợ S Pen, pin 8400mAh, chống nước',
            'Tai nghe không dây Apple với chip H2, chống ồn chủ động, âm thanh không gian, pin 6 giờ, hộp sạc MagSafe',
            'Tai nghe chống ồn Sony với công nghệ chống ồn hàng đầu, pin 30 giờ, âm thanh Hi-Res, Bluetooth 5.2, thiết kế gập',
            'Đồng hồ thông minh Apple với chip S9, màn hình Always-On Retina, đo nhịp tim, GPS, chống nước, pin 18 giờ',
            'Smartwatch Samsung với chip Exynos W930, màn hình AMOLED 1.4 inch, đo sức khỏe, GPS, chống nước, pin 40 giờ'
        ],
        'category': [
            'Điện thoại', 'Điện thoại', 'Laptop', 'Laptop',
            'Máy tính bảng', 'Máy tính bảng', 'Tai nghe', 'Tai nghe',
            'Đồng hồ thông minh', 'Đồng hồ thông minh'
        ],
        'price': [
            29990000, 24990000, 45990000, 38990000,
            14990000, 17990000, 6990000, 8990000,
            10990000, 8990000
        ],
        'image_url': [
            'https://example.com/iphone15.jpg',
            'https://example.com/galaxy-s24.jpg',
            'https://example.com/macbook-pro.jpg',
            'https://example.com/dell-xps.jpg',
            'https://example.com/ipad-air.jpg',
            'https://example.com/galaxy-tab.jpg',
            'https://example.com/airpods-pro.jpg',
            'https://example.com/sony-headphones.jpg',
            'https://example.com/apple-watch.jpg',
            'https://example.com/galaxy-watch.jpg'
        ]
    }
    
    return pd.DataFrame(data)


# ============================================================
# B) XỬ LÝ NGÔN NGỮ (TEXT PREPROCESSING)
# ============================================================

# Danh sách stopwords tiếng Việt phổ biến
VIETNAMESE_STOPWORDS = {
    'và', 'của', 'cho', 'với', 'là', 'có', 'được', 'trong', 'từ', 'về',
    'một', 'các', 'những', 'này', 'đó', 'nào', 'đã', 'sẽ', 'đang', 'bị',
    'vào', 'ra', 'lên', 'xuống', 'đến', 'để', 'mà', 'nếu', 'thì', 'khi',
    'như', 'bằng', 'theo', 'vì', 'do', 'nên', 'để', 'cho', 'về', 'trên',
    'dưới', 'trước', 'sau', 'giữa', 'ngoài', 'trong', 'cùng', 'cũng', 'rất',
    'quá', 'hơn', 'nhất', 'nhiều', 'ít', 'mới', 'cũ', 'lớn', 'nhỏ', 'cao',
    'thấp', 'dài', 'ngắn', 'rộng', 'hẹp', 'đẹp', 'xấu', 'tốt', 'kém'
}

def preprocess_text(text: str) -> str:
    """
    Xử lý văn bản tiếng Việt:
    - Chuyển thành chữ thường
    - Loại bỏ ký tự đặc biệt
    - Loại bỏ stopwords
    - Tách từ (word tokenization)
    
    Args:
        text: Văn bản đầu vào
        
    Returns:
        Văn bản đã được xử lý
    """
    if pd.isna(text) or text == '':
        return ''
    
    # 1. Chuyển thành chữ thường
    text = text.lower()
    
    # 2. Loại bỏ ký tự đặc biệt, chỉ giữ lại chữ cái, số và khoảng trắng
    # Giữ lại dấu tiếng Việt để tách từ chính xác hơn
    text = re.sub(r'[^\w\s]', ' ', text)
    
    # 3. Loại bỏ số (tùy chọn - có thể giữ lại nếu số là đặc trưng quan trọng)
    # text = re.sub(r'\d+', '', text)
    
    # 4. Loại bỏ khoảng trắng thừa
    text = re.sub(r'\s+', ' ', text).strip()
    
    # 5. Tách từ (word tokenization) - tách theo khoảng trắng
    words = text.split()
    
    # 6. Loại bỏ stopwords
    words = [word for word in words if word not in VIETNAMESE_STOPWORDS and len(word) > 1]
    
    # 7. Kết hợp lại thành chuỗi
    processed_text = ' '.join(words)
    
    return processed_text


# ============================================================
# C) VECTOR HÓA BẰNG TF-IDF
# ============================================================

def build_tfidf_matrix(df: pd.DataFrame, text_column: str = 'combined_text') -> tuple:
    """
    Xây dựng ma trận TF-IDF từ DataFrame
    
    Args:
        df: DataFrame chứa dữ liệu sản phẩm
        text_column: Tên cột chứa văn bản đã xử lý
        
    Returns:
        Tuple (tfidf_matrix, vectorizer, product_ids)
        - tfidf_matrix: Ma trận TF-IDF (numpy array)
        - vectorizer: TfidfVectorizer đã được fit
        - product_ids: Danh sách product_id tương ứng với từng hàng trong ma trận
    """
    # Tạo TfidfVectorizer với các tham số tối ưu cho tiếng Việt
    vectorizer = TfidfVectorizer(
        max_features=1000,  # Giới hạn số từ vựng
        min_df=1,           # Từ phải xuất hiện ít nhất 1 lần
        max_df=0.95,        # Bỏ qua từ xuất hiện trong >95% tài liệu
        ngram_range=(1, 2), # Sử dụng unigram và bigram
        analyzer='word'     # Phân tích theo từ
    )
    
    # Fit và transform để tạo ma trận TF-IDF
    tfidf_matrix = vectorizer.fit_transform(df[text_column].values)
    
    # Lấy danh sách product_id
    product_ids = df['product_id'].values
    
    return tfidf_matrix, vectorizer, product_ids


# ============================================================
# D) TÍNH COSINE SIMILARITY
# ============================================================

def cosine_similarity_custom(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Tính cosine similarity thủ công bằng công thức:
    cosine(A,B) = (A·B) / (||A|| * ||B||)
    
    Args:
        vec_a: Vector A
        vec_b: Vector B
        
    Returns:
        Giá trị cosine similarity (0-1)
    """
    # Tính dot product
    dot_product = np.dot(vec_a, vec_b)
    
    # Tính norm (độ dài vector)
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    
    # Tránh chia cho 0
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    # Tính cosine similarity
    similarity = dot_product / (norm_a * norm_b)
    
    return float(similarity)


# ============================================================
# E) HÀM CHÍNH: LẤY SẢN PHẨM TƯƠNG TỰ
# ============================================================

def get_similar_products(
    product_id: int,
    df: pd.DataFrame,
    tfidf_matrix: np.ndarray,
    product_ids: np.ndarray,
    top_n: int = 5,
    use_sklearn: bool = True
) -> List[Dict[str, Any]]:
    """
    Lấy top N sản phẩm tương tự nhất với sản phẩm đầu vào
    
    Args:
        product_id: ID của sản phẩm cần tìm sản phẩm tương tự
        df: DataFrame chứa thông tin sản phẩm
        tfidf_matrix: Ma trận TF-IDF
        product_ids: Danh sách product_id tương ứng với ma trận
        top_n: Số lượng sản phẩm tương tự cần lấy (mặc định 5)
        use_sklearn: True nếu dùng sklearn, False nếu dùng công thức thủ công
        
    Returns:
        Danh sách dictionary chứa thông tin sản phẩm tương tự
    """
    # Tìm index của sản phẩm trong ma trận
    try:
        product_idx = np.where(product_ids == product_id)[0][0]
    except IndexError:
        return []
    
    # Lấy vector TF-IDF của sản phẩm đầu vào
    product_vector = tfidf_matrix[product_idx]
    
    # Tính cosine similarity với tất cả sản phẩm khác
    if use_sklearn:
        # Sử dụng sklearn (nhanh hơn)
        similarities = cosine_similarity(product_vector, tfidf_matrix).flatten()
    else:
        # Sử dụng công thức thủ công
        similarities = np.array([
            cosine_similarity_custom(product_vector.toarray().flatten(), 
                                    vec.toarray().flatten())
            for vec in tfidf_matrix
        ])
    
    # Tạo danh sách (index, similarity) và sắp xếp theo similarity giảm dần
    similarity_scores = list(enumerate(similarities))
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
    
    # Lấy top N (bỏ qua sản phẩm đầu tiên vì đó chính là sản phẩm đầu vào)
    top_products = similarity_scores[1:top_n + 1]
    
    # Tạo danh sách kết quả
    results = []
    for idx, similarity in top_products:
        similar_product_id = product_ids[idx]
        product_info = df[df['product_id'] == similar_product_id].iloc[0]
        
        results.append({
            'product_id': int(similar_product_id),
            'name': str(product_info['name']),
            'similarity': round(float(similarity), 4),
            'image_url': str(product_info['image_url']),
            'price': float(product_info['price'])
        })
    
    return results


# ============================================================
# F) HÀM DEMO VÀ XUẤT JSON
# ============================================================

def display_recommendations(product_id: int, product_name: str, similar_products: List[Dict[str, Any]]):
    """
    Hiển thị kết quả gợi ý sản phẩm một cách đẹp mắt trong console
    
    Args:
        product_id: ID sản phẩm đầu vào
        product_name: Tên sản phẩm đầu vào
        similar_products: Danh sách sản phẩm tương tự
    """
    print("\n" + "=" * 100)
    print(f"  SAN PHAM DAU VAO: {product_name} (ID: {product_id})")
    print("=" * 100)
    print()
    
    if not similar_products:
        print("  Khong tim thay san pham tuong tu!")
        return
    
    print(f"  TOP {len(similar_products)} SAN PHAM TUONG TU NHAT:")
    print("-" * 100)
    print()
    
    # Hiển thị dạng bảng đẹp
    for i, product in enumerate(similar_products, 1):
        similarity_percent = product['similarity'] * 100
        print(f"  [{i}] {product['name']}")
        print(f"      └─ ID: {product['product_id']}")
        print(f"      └─ Do tuong dong: {similarity_percent:.2f}% ({product['similarity']:.4f})")
        print(f"      └─ Gia: {product['price']:,.0f} VND")
        print(f"      └─ Anh: {product['image_url']}")
        print()
    
    print("-" * 100)
    print()


def display_all_products(df: pd.DataFrame):
    """
    Hiển thị danh sách tất cả sản phẩm trong hệ thống
    """
    print("\n" + "=" * 100)
    print("  DANH SACH TAT CA SAN PHAM TRONG HE THONG")
    print("=" * 100)
    print()
    
    for idx, row in df.iterrows():
        print(f"  [{row['product_id']}] {row['name']}")
        print(f"      └─ Danh muc: {row['category']}")
        print(f"      └─ Gia: {row['price']:,.0f} VND")
        print()
    
    print("=" * 100)
    print()


def run_demo():
    """
    Chạy demo hệ thống gợi ý sản phẩm
    """
    import sys
    import io
    
    # Thiết lập encoding UTF-8 cho output
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 80)
    print("HE THONG GOI Y SAN PHAM - CONTENT-BASED FILTERING")
    print("=" * 80)
    print()
    
    # 1. Tạo dữ liệu mẫu
    print("Buoc 1: Tao du lieu mau...")
    df = create_sample_dataframe()
    print(f"Da tao {len(df)} san pham")
    print()
    
    # 2. Kết hợp name + description
    print("Buoc 2: Ket hop name + description...")
    df['combined_text'] = df['name'] + ' ' + df['description']
    print("Da ket hop name va description")
    print()
    
    # 3. Xử lý văn bản
    print("Buoc 3: Xu ly van ban (preprocessing)...")
    df['processed_text'] = df['combined_text'].apply(preprocess_text)
    print("Vi du van ban da xu ly:")
    print(f"  - San pham 1: {df['processed_text'].iloc[0][:100]}...")
    print()
    
    # 4. Xây dựng ma trận TF-IDF
    print("Buoc 4: Xay dung ma tran TF-IDF...")
    tfidf_matrix, vectorizer, product_ids = build_tfidf_matrix(df, 'processed_text')
    print(f"Kich thuoc ma tran TF-IDF: {tfidf_matrix.shape}")
    print(f"So tu vung: {len(vectorizer.get_feature_names_out())}")
    print()
    
    # 5. Hiển thị danh sách tất cả sản phẩm
    display_all_products(df)
    
    # 6. Demo tìm sản phẩm tương tự
    print("\n" + "=" * 100)
    print("  TIM KIEM SAN PHAM TUONG TU")
    print("=" * 100)
    print()
    
    # Test với sản phẩm đầu tiên (iPhone)
    test_product_id = 1
    product_info = df[df['product_id'] == test_product_id].iloc[0]
    
    # Lấy top 5 sản phẩm tương tự
    similar_products = get_similar_products(
        test_product_id, df, tfidf_matrix, product_ids, top_n=5
    )
    
    # Hiển thị kết quả đẹp mắt
    display_recommendations(test_product_id, product_info['name'], similar_products)
    
    # 7. Xuất kết quả dưới dạng JSON
    print("\n" + "=" * 100)
    print("  KET QUA DUOI DANG JSON")
    print("=" * 100)
    result_json = json.dumps(similar_products, ensure_ascii=False, indent=2)
    print(result_json)
    print("=" * 100)
    
    # 8. Test với sản phẩm khác
    print("\n" + "=" * 100)
    print("  TEST VOI SAN PHAM KHAC")
    print("=" * 100)
    
    test_product_id = 3
    product_info = df[df['product_id'] == test_product_id].iloc[0]
    
    similar_products = get_similar_products(
        test_product_id, df, tfidf_matrix, product_ids, top_n=5
    )
    
    display_recommendations(test_product_id, product_info['name'], similar_products)
    
    # 9. Test với tất cả sản phẩm
    print("\n" + "=" * 100)
    print("  GOI Y CHO TAT CA SAN PHAM")
    print("=" * 100)
    print()
    
    for product_id in df['product_id'].values[:3]:  # Chỉ test 3 sản phẩm đầu
        product_info = df[df['product_id'] == product_id].iloc[0]
        similar_products = get_similar_products(
            product_id, df, tfidf_matrix, product_ids, top_n=3
        )
        display_recommendations(product_id, product_info['name'], similar_products)
    
    print("\n" + "=" * 100)
    print("  HOAN TAT!")
    print("=" * 100)
    
    return df, tfidf_matrix, vectorizer, product_ids


# ============================================================
# HÀM TIỆN ÍCH: Lưu kết quả ra file JSON
# ============================================================

def save_recommendations_to_json(
    product_id: int,
    df: pd.DataFrame,
    tfidf_matrix: np.ndarray,
    product_ids: np.ndarray,
    output_file: str = 'recommendations.json',
    top_n: int = 5
):
    """
    Lưu kết quả gợi ý ra file JSON
    
    Args:
        product_id: ID sản phẩm cần tìm sản phẩm tương tự
        df: DataFrame chứa thông tin sản phẩm
        tfidf_matrix: Ma trận TF-IDF
        product_ids: Danh sách product_id
        output_file: Tên file output
        top_n: Số lượng sản phẩm tương tự
    """
    similar_products = get_similar_products(
        product_id, df, tfidf_matrix, product_ids, top_n=top_n
    )
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(similar_products, f, ensure_ascii=False, indent=2)
    
    print(f"Đã lưu kết quả vào file: {output_file}")


# ============================================================
# HÀM TƯƠNG TÁC VỚI NGƯỜI DÙNG
# ============================================================

def interactive_mode():
    """
    Chế độ tương tác: Cho phép người dùng nhập product_id và xem kết quả gợi ý
    """
    import sys
    import io
    
    # Thiết lập encoding UTF-8 cho output
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("\n" + "=" * 100)
    print("  HE THONG GOI Y SAN PHAM - CHE DO TUONG TAC")
    print("=" * 100)
    print()
    
    # Khởi tạo hệ thống
    print("Dang khoi tao he thong...")
    df = create_sample_dataframe()
    df['combined_text'] = df['name'] + ' ' + df['description']
    df['processed_text'] = df['combined_text'].apply(preprocess_text)
    tfidf_matrix, vectorizer, product_ids = build_tfidf_matrix(df, 'processed_text')
    print("Hoan tat khoi tao!")
    print()
    
    # Hiển thị danh sách sản phẩm
    display_all_products(df)
    
    # Vòng lặp tương tác
    while True:
        print("\n" + "=" * 100)
        print("  NHAP PRODUCT_ID DE TIM SAN PHAM TUONG TU (Nhap 'q' de thoat)")
        print("=" * 100)
        
        try:
            user_input = input("\n  Product ID: ").strip()
            
            if user_input.lower() == 'q':
                print("\n  Cam on ban da su dung! Tam biet!")
                break
            
            product_id = int(user_input)
            
            # Kiểm tra product_id có tồn tại không
            if product_id not in df['product_id'].values:
                print(f"\n  Loi: Khong tim thay san pham voi ID = {product_id}")
                print("  Vui long nhap lai!")
                continue
            
            # Lấy thông tin sản phẩm
            product_info = df[df['product_id'] == product_id].iloc[0]
            
            # Lấy top 5 sản phẩm tương tự
            similar_products = get_similar_products(
                product_id, df, tfidf_matrix, product_ids, top_n=5
            )
            
            # Hiển thị kết quả
            display_recommendations(product_id, product_info['name'], similar_products)
            
            # Hỏi có muốn lưu kết quả ra file JSON không
            save_choice = input("  Ban co muon luu ket qua ra file JSON? (y/n): ").strip().lower()
            if save_choice == 'y':
                filename = f'recommendations_product_{product_id}.json'
                save_recommendations_to_json(
                    product_id, df, tfidf_matrix, product_ids, filename, top_n=5
                )
                print(f"  Da luu ket qua vao file: {filename}")
            
        except ValueError:
            print("\n  Loi: Vui long nhap mot so nguyen hop le!")
        except KeyboardInterrupt:
            print("\n\n  Cam on ban da su dung! Tam biet!")
            break
        except Exception as e:
            print(f"\n  Loi: {str(e)}")
            print("  Vui long thu lai!")


# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    import sys
    
    # Kiểm tra argument
    if len(sys.argv) > 1 and sys.argv[1] == '--interactive':
        # Chế độ tương tác
        interactive_mode()
    else:
        # Chạy demo
        df, tfidf_matrix, vectorizer, product_ids = run_demo()
        
        print("\n" + "=" * 100)
        print("  BAN CO THE SU DUNG CHE DO TUONG TAC BANG LENH:")
        print("  python product_recommendation.py --interactive")
        print("=" * 100)
        
        # Ví dụ: Lưu kết quả ra file JSON
        # save_recommendations_to_json(1, df, tfidf_matrix, product_ids, 'recommendations.json')


"""
Script test để kiểm tra hệ thống gợi ý sản phẩm
Chạy: python test_recommendations.py
"""

import sys
import json
import subprocess
from pathlib import Path

def test_python_script():
    """Test Python recommendation script"""
    print("=" * 60)
    print("🧪 TEST 1: Python Recommendation Script")
    print("=" * 60)
    
    script_path = Path("product_recommendation_api.py")
    if not script_path.exists():
        print("❌ Không tìm thấy product_recommendation_api.py")
        return False
    
    try:
        # Test với product_id = 1, top_n = 5
        result = subprocess.run(
            [sys.executable, str(script_path), "1", "5"],
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        
        if result.returncode != 0:
            print(f"❌ Python script lỗi (exit code: {result.returncode})")
            print(f"Error: {result.stderr}")
            return False
        
        # Parse JSON output
        try:
            output = json.loads(result.stdout)
            print("✅ Python script chạy thành công")
            print(f"📦 Product ID: {output.get('product_id')}")
            print(f"📊 Top N: {output.get('top_n')}")
            
            recommendations = output.get('recommendations', [])
            print(f"🎯 Số lượng recommendations: {len(recommendations)}")
            
            if len(recommendations) > 0:
                print("\n📋 Top 3 recommendations:")
                for i, rec in enumerate(recommendations[:3], 1):
                    print(f"  {i}. {rec.get('name')} (ID: {rec.get('product_id')}, Similarity: {rec.get('similarity', 0):.2f})")
                return True
            else:
                print("⚠️ Không có recommendations")
                return False
                
        except json.JSONDecodeError as e:
            print(f"❌ Không parse được JSON output: {e}")
            print(f"Output: {result.stdout}")
            return False
            
    except Exception as e:
        print(f"❌ Lỗi khi chạy Python script: {e}")
        return False


def test_product_data():
    """Test xem có đủ dữ liệu sản phẩm không"""
    print("\n" + "=" * 60)
    print("🧪 TEST 2: Product Data")
    print("=" * 60)
    
    try:
        from product_recommendation import create_sample_dataframe
        
        df = create_sample_dataframe()
        print(f"✅ DataFrame được tạo thành công")
        print(f"📊 Số lượng sản phẩm: {len(df)}")
        print(f"📋 Các cột: {', '.join(df.columns)}")
        
        # Kiểm tra có name và description không
        missing_name = df['name'].isna().sum()
        missing_desc = df['description'].isna().sum()
        
        if missing_name > 0:
            print(f"⚠️ Có {missing_name} sản phẩm thiếu name")
        if missing_desc > 0:
            print(f"⚠️ Có {missing_desc} sản phẩm thiếu description")
        
        if missing_name == 0 and missing_desc == 0:
            print("✅ Tất cả sản phẩm đều có name và description")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"❌ Lỗi khi test product data: {e}")
        return False


def test_tfidf_processing():
    """Test TF-IDF processing"""
    print("\n" + "=" * 60)
    print("🧪 TEST 3: TF-IDF Processing")
    print("=" * 60)
    
    try:
        from product_recommendation import (
            create_sample_dataframe,
            preprocess_text,
            build_tfidf_matrix,
            get_similar_products
        )
        
        df = create_sample_dataframe()
        df['combined_text'] = df['name'] + ' ' + df['description']
        df['processed_text'] = df['combined_text'].apply(preprocess_text)
        
        print("✅ Text preprocessing thành công")
        
        # Build TF-IDF matrix
        tfidf_matrix, vectorizer, product_ids = build_tfidf_matrix(df, 'processed_text')
        print(f"✅ TF-IDF matrix được tạo: {tfidf_matrix.shape}")
        print(f"📊 Số lượng từ vựng: {len(vectorizer.get_feature_names_out())}")
        
        # Test similarity
        if len(product_ids) > 0:
            test_product_id = product_ids[0]
            similar = get_similar_products(test_product_id, df, tfidf_matrix, product_ids, top_n=3)
            
            if len(similar) > 0:
                print(f"✅ Tìm thấy {len(similar)} sản phẩm tương tự cho product ID {test_product_id}")
                for rec in similar:
                    print(f"  - {rec['name']} (Similarity: {rec['similarity']:.3f})")
                return True
            else:
                print("⚠️ Không tìm thấy sản phẩm tương tự")
                return False
        else:
            print("❌ Không có product IDs")
            return False
            
    except Exception as e:
        print(f"❌ Lỗi khi test TF-IDF: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Chạy tất cả tests"""
    print("\n" + "🚀" * 30)
    print("KIỂM TRA HỆ THỐNG GỢI Ý SẢN PHẨM")
    print("🚀" * 30 + "\n")
    
    results = []
    
    # Test 1: Python script
    results.append(("Python Script", test_python_script()))
    
    # Test 2: Product data
    results.append(("Product Data", test_product_data()))
    
    # Test 3: TF-IDF processing
    results.append(("TF-IDF Processing", test_tfidf_processing()))
    
    # Tổng kết
    print("\n" + "=" * 60)
    print("📊 KẾT QUẢ TỔNG KẾT")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n🎯 Tổng kết: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Tất cả tests đều PASS! Hệ thống hoạt động tốt.")
        return 0
    else:
        print("⚠️ Một số tests FAIL. Vui lòng kiểm tra lại.")
        return 1


if __name__ == '__main__':
    sys.exit(main())



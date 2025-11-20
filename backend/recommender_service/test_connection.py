"""
Test script to verify database connection and data loading
"""
import sys
from modules import loader

def test_connection():
    """Test database connection"""
    print("=" * 50)
    print("Testing Database Connection")
    print("=" * 50)
    
    try:
        conn = loader.get_connection()
        print("✓ Database connection successful!")
        conn.close()
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False
    
    return True

def test_load_products():
    """Test loading products"""
    print("\n" + "=" * 50)
    print("Testing Product Loading")
    print("=" * 50)
    
    try:
        products_df = loader.load_products()
        print(f"✓ Loaded {len(products_df)} products")
        if len(products_df) > 0:
            print("\nSample products:")
            print(products_df.head())
        return products_df
    except Exception as e:
        print(f"✗ Failed to load products: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_load_user_history(user_id):
    """Test loading user history"""
    print("\n" + "=" * 50)
    print(f"Testing User History Loading (user_id: {user_id})")
    print("=" * 50)
    
    try:
        views_df = loader.load_user_history(user_id, limit=200)
        print(f"✓ Loaded {len(views_df)} views for user_id: {user_id}")
        if len(views_df) > 0:
            print("\nSample views:")
            print(views_df.head())
            print(f"\nUnique products viewed: {views_df['product_id'].nunique()}")
        else:
            print(f"⚠ No views found for user_id: {user_id}")
        return views_df
    except Exception as e:
        print(f"✗ Failed to load user history: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_load_global_views():
    """Test loading global views"""
    print("\n" + "=" * 50)
    print("Testing Global Views Loading")
    print("=" * 50)
    
    try:
        views_df = loader.load_global_views(limit=100)
        print(f"✓ Loaded {len(views_df)} global views")
        if len(views_df) > 0:
            print(f"\nUnique users: {views_df['user_id'].nunique()}")
            print(f"Unique products: {views_df['product_id'].nunique()}")
            print("\nSample views:")
            print(views_df.head())
        return views_df
    except Exception as e:
        print(f"✗ Failed to load global views: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    # Test connection
    if not test_connection():
        sys.exit(1)
    
    # Test loading products
    products_df = test_load_products()
    if products_df is None:
        sys.exit(1)
    
    # Test loading global views to see which users have data
    global_views = test_load_global_views()
    
    # If user_id provided as argument, test that user
    if len(sys.argv) > 1:
        try:
            user_id = int(sys.argv[1])
            test_load_user_history(user_id)
        except ValueError:
            print(f"\n⚠ Invalid user_id: {sys.argv[1]}. Please provide a number.")
    else:
        print("\n" + "=" * 50)
        print("To test a specific user, run:")
        print("  python test_connection.py <user_id>")
        print("=" * 50)


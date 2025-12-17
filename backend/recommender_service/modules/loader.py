import mysql.connector
import pandas as pd
import config

def get_connection():
    return mysql.connector.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME
    )

def load_products():
    conn = get_connection()
    try:
        query = """
            SELECT 
                id_product as id,
                product_name as name,
                c.category_name as category,
                brand,
                price,
                description
            FROM products p
            LEFT JOIN categories c ON p.id_category = c.id_category
        """
        df = pd.read_sql(query, conn)
        return df
    finally:
        conn.close()

def load_user_history(user_id: int, limit: int = 200):
    print(f"[Loader] Connecting to database: {config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}")
    conn = get_connection()
    try:
        query = """
            SELECT 
                id,
                user_id,
                session_id,
                product_id,
                action_type,
                created_at
            FROM product_view
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s
        """
        print(f"[Loader] Executing query for user_id: {user_id}, limit: {limit}")
        df = pd.read_sql(query, conn, params=(user_id, limit))
        print(f"[Loader] Query returned {len(df)} rows")
        if len(df) > 0:
            print(f"[Loader] Sample data: {df.head()}")
        return df
    except Exception as e:
        print(f"[Loader] Error loading user history: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        conn.close()

def load_global_views(limit: int = 5000):
    conn = get_connection()
    try:
        query = """
            SELECT 
                id,
                user_id,
                session_id,
                product_id,
                action_type,
                created_at
            FROM product_view
            WHERE user_id IS NOT NULL
            ORDER BY created_at DESC
            LIMIT %s
        """
        df = pd.read_sql(query, conn, params=(limit,))
        return df
    finally:
        conn.close()

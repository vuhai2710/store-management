# Product Recommender Service

FastAPI service for product recommendations using hybrid collaborative and content-based filtering.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure database connection in `.env` file or environment variables:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=store_management
```

3. Run the service:
```bash
uvicorn app:app --reload --port 5000
```

## API Endpoints

### GET /recommend?userId={userId}
Get product recommendations for a user based on their view history.

Response:
```json
{
  "userId": 10,
  "recommendations": [4, 8, 12, ...]
}
```

### GET /similar-products?productId={productId}
Get similar products to a given product.

Response:
```json
{
  "productId": 5,
  "similar": [7, 9, 13, ...]
}
```

## Architecture

- **loader.py**: Database connection and data loading
- **preprocess.py**: User preference extraction from view history
- **content_based.py**: Content-based filtering using TF-IDF and cosine similarity
- **collaborative.py**: Behavior-based collaborative filtering
- **hybrid.py**: Combines both approaches for better recommendations


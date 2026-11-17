
function ProductCard({ product }) {
  if (!product) return null;

  return (
    <div className="product-card">
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span>Product Image</span>
        )}
      </div>

      <div className="product-info">
        <p className="product-category">
          {product.category}
        </p>

        <h3>{product.name}</h3>

        <p className="product-artisan">
          By {product.artisan}
        </p>

        <div className="product-bottom">
          <span className="product-price">
            Rs. {product.price}
          </span>

          <button type="button" className="view-product-btn">
            View Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
  

import { useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import SiteHeader from "../components/SiteHeader.jsx";

const products = [
  {
    id: 1,
    name: "Traditional Mithila Painting",
    category: "Paintings",
    artisan: "Sita Devi",
    price: 2500,
    image: ""
  },
  {
    id: 2,
    name: "Handwoven Bamboo Basket",
    category: "Handicrafts",
    artisan: "Ram Kumar",
    price: 1200,
    image: ""
  },
  {
    id: 3,
    name: "Handmade Clay Pot",
    category: "Pottery",
    artisan: "Mina Kumari",
    price: 800,
    image: ""
  },
  {
    id: 4,
    name: "Traditional Handmade Jewelry",
    category: "Jewelry",
    artisan: "Anita Devi",
    price: 1500,
    image: ""
  }
];

function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    "Paintings",
    "Handicrafts",
    "Pottery",
    "Jewelry"
  ];

  const filteredProducts = products.filter((product) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      term === "" ||
      product.name.toLowerCase().includes(term) ||
      product.artisan.toLowerCase().includes(term);

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div id="top" className="min-h-screen flex flex-col justify-between">
      <SiteHeader />
      <main className="products-page flex-1">
        <section className="products-heading">
          <p>DISCOVER LOCAL CRAFTSMANSHIP</p>
          <h1>Explore Our Products</h1>
          <span>
            Discover handmade products and support local artisans.
          </span>
        </section>

        <div className="products-controls">
          <input
            type="text"
            placeholder="Search products or artisans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="category-filters">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item ? "active" : ""
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default ProductsPage;

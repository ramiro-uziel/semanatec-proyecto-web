"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type AmazonProduct = {
  price: {
    value: number;
  } | null;
  isPrime: boolean;
  mainImageUrl: string;
  rating: number | null;
  url: string;
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<AmazonProduct[]>([]);
  const [sortOption, setSortOption] = useState<"price" | "rating">("rating");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [itemLimit, setItemLimit] = useState<number | "all">(3);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    if (!hasSearched) setHasSearched(true);

    try {
      const response = await fetch("/api/amazonSearch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchTerm }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sortAmazonResults = (option: "price" | "rating") => {
    setSortOption(option);
    const sorted = [...filteredResults].sort((a, b) => {
      if (option === "price") {
        return sortDirection === "asc"
          ? (a.price?.value ?? 0) - (b.price?.value ?? 0)
          : (b.price?.value ?? 0) - (a.price?.value ?? 0);
      }
      return sortDirection === "asc"
        ? (a.rating ?? 0) - (b.rating ?? 0)
        : (b.rating ?? 0) - (a.rating ?? 0);
    });
    setSearchResults(sorted);
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    sortAmazonResults(sortOption);
  };

  const filteredResults = useMemo(() => {
    const filtered = searchResults.filter(
      (product) => product.price?.value != null && product.rating != null
    );
    return itemLimit === "all" ? filtered : filtered.slice(0, itemLimit);
  }, [searchResults, itemLimit]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <motion.div
        initial={false}
        animate={hasSearched ? { y: 0 } : { y: "40vh" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-4xl px-4 pt-8"
      >
        <motion.p
          className="text-2xl font-bold mb-8 text-center text-black"
          initial={false}
          animate={
            hasSearched
              ? { opacity: 0, height: 0, marginBottom: 0 }
              : { opacity: 1, height: "auto", marginBottom: 32 }
          }
          transition={{ duration: 0.3 }}
        >
          Busca un producto
        </motion.p>

        <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
          <div className="flex rounded-xl border-2 border-gray-400 overflow-hidden">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter product name"
              className="p-4 outline-none w-full z-10"
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-4 hover:bg-blue-700 transition duration-300 ease-in-out"
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-4xl px-4 pt-8"
          >
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {filteredResults.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-row justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-black">
                    Resultados de Amazon
                  </h2>
                  <div className="flex space-x-4">
                    <select
                      value={sortOption}
                      onChange={(e) =>
                        sortAmazonResults(e.target.value as "price" | "rating")
                      }
                      className="p-2 border border-indigo-300 rounded-md bg-white text-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="rating">Ordenar por calificación</option>
                      <option value="price">Ordenar por precio</option>
                    </select>
                    <button
                      onClick={toggleSortDirection}
                      className="p-2 border border-indigo-300 rounded-md bg-white text-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </button>
                    <select
                      value={itemLimit}
                      onChange={(e) =>
                        setItemLimit(
                          e.target.value === "all"
                            ? "all"
                            : parseInt(e.target.value)
                        )
                      }
                      className="p-2 border border-indigo-300 rounded-md bg-white text-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={3}>Mostrar 3</option>
                      <option value={5}>Mostrar 5</option>
                      <option value={10}>Mostrar 10</option>
                      <option value="all">Mostrar todos</option>
                    </select>
                  </div>
                </div>
                <ul className="space-y-4 mb-10">
                  {filteredResults.map((product, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-6 rounded-lg shadow-lg"
                    >
                      <div className="flex">
                        <div className="relative w-32 h-32 mr-4">
                          <Image
                            src={product.mainImageUrl}
                            alt="Product Image"
                            fill
                            style={{ objectFit: "cover" }}
                            className="rounded-lg"
                          />
                        </div>
                        <div>
                          <p className="text-lg font-bold mb-2 text-blue-600">
                            ${product.price!.value.toFixed(2)}
                          </p>
                          <p className="text-sm mb-2">
                            Rating: {product.rating!.toFixed(1)}
                          </p>
                          {product.isPrime && (
                            <p className="text-sm mb-2 text-green-600">
                              Prime Eligible
                            </p>
                          )}
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-black text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition duration-300 ease-in-out"
                          >
                            Ver en Amazon
                          </a>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

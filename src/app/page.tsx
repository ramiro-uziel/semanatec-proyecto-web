"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faWarning } from "@fortawesome/free-solid-svg-icons";

type AnimeResult = {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  title: string;
  title_english: string;
  title_japanese: string;
  year: number;
  synopsis: string;
  episodes: number;
  source: string;
  airing: boolean;
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [animeType, setAnimeType] = useState("tv");
  const [animeResult, setAnimeResult] = useState<AnimeResult | null>(null);
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
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
          searchTerm
        )}&type=${animeType.toUpperCase()}&limit=1&sfw=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch anime");
      }

      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setAnimeResult(data.data[0]);
      } else {
        setError("No se encontró ningún anime con ese nombre.");
      }
    } catch (err) {
      setError("Failed to fetch anime. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <motion.div
        initial={false}
        animate={hasSearched ? { y: 0 } : { y: "35vh" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-xl my-10"
      >
        <h1 className="text-3xl font-bold">Hola</h1>
        <p className="text-xl font-extralight mb-5">
          Busca un anime, y encuentra la fuente en MangaDex.
        </p>

        <form onSubmit={handleSearch} className="w-full">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <div className="flex flex-row w-full justify-between bg-white border border-black border-dashed sm:rounded-r-none rounded-xl">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre del anime"
                className="p-4 outline-none w-full rounded-l-xl"
              />
              <select
                value={animeType}
                onChange={(e) => setAnimeType(e.target.value)}
                className="max-w-18 w-min mr-2  outline-none sm:rounded-none rounded-xl"
              >
                <option value="tv">TV</option>
                <option value="movie">Película</option>
              </select>
            </div>
            <button
              type="submit"
              className="border border-gray-800 bg-gray-800 text-white px-6 py-4 hover:bg-gray-600 hover:text-white transition duration-100 ease-in-out rounded-xl sm:rounded-l-none sm:rounded-r-xl w-full sm:w-[120px]"
              disabled={isLoading}
            >
              {isLoading ? "..." : "Buscar"}
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 text-center mt-5">{error}</p>}
      </motion.div>

      <AnimatePresence>
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            {animeResult && (
              <div className="bg-white p-6 rounded-xl border border-black border-dashed">
                <h2 className="text-2xl font-bold">
                  {animeResult.title_english}
                </h2>
                <div className="flex flex-col  items-start mb-4">
                  {animeResult.title_english !== animeResult.title && (
                    <h3 className="text-lg font-medium">{animeResult.title}</h3>
                  )}
                  <p className="text-sm text-gray-600">
                    {animeResult.title_japanese}
                  </p>
                </div>
                <div className="flex mb-4">
                  <div className="w-1/3 mr-4 ">
                    <Image
                      src={animeResult.images.jpg.image_url}
                      alt={animeResult.title}
                      width={200}
                      height={300}
                      className="rounded-lg object-contain max-h-[300px]"
                    />
                  </div>
                  <div className="w-2/3">
                    <p className="mb-2">
                      <strong>Año:</strong> {animeResult.year || "N/A"}
                    </p>
                    {animeResult.episodes > 0 && (
                      <p className="mb-2">
                        <strong>Episodios:</strong> {animeResult.episodes}
                      </p>
                    )}
                    <p className="mb-2">
                      <strong>Status:</strong>{" "}
                      {animeResult.airing ? "En emisión" : "Terminado"}
                    </p>
                    <div className="max-h-48 overflow-y-auto mb-4 pr-2">
                      <p>{animeResult.synopsis}</p>
                    </div>
                    <a
                      href={animeResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition duration-300 ease-in-out"
                    >
                      Ver en MyAnimeList
                    </a>
                  </div>
                </div>
                {animeResult.source !== "Manga" &&
                  animeResult.source !== "Web manga" && (
                    <p className="text-yellow-700 bg-yellow-300 p-3 rounded-lg mt-4">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faWarning} className="fa-fw" />
                        No está basado en un manga.
                      </div>
                    </p>
                  )}
                {animeResult.source == "Light novel" && (
                  <p className="text-sky-700 bg-sky-300 p-3 rounded-lg mt-4">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBook} className="fa-fw" />
                      <a
                        href={`https://global.bookwalker.jp/search/?qcat=&word=${encodeURIComponent(
                          animeResult.title_english
                        )}&np=0&order=score`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline ml-2"
                      >
                        Su fuente es un Light novel.
                      </a>
                    </div>
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

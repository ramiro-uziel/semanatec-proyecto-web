"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart as faHeartSolid,
  faBook,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

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

type MangaResult = {
  id: string;
  attributes: {
    title: {
      en: string;
      ja: string;
      "ja-ro": string;
    };
    description: string;
    year: number;
    status: string;
  };
};

const NoisePattern: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    className="fixed inset-0 z-[-1] opacity-[5%] mix-blend-difference"
  >
    <filter id="noiseFilter">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.65"
        numOctaves="5"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [animeType, setAnimeType] = useState<"tv" | "movie">("tv");
  const [animeResult, setAnimeResult] = useState<AnimeResult | null>(null);
  const [mangaResults, setMangaResults] = useState<MangaResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFavoriteMangas = localStorage.getItem("favoriteMangas");
      if (storedFavoriteMangas) {
        setFavorites(JSON.parse(storedFavoriteMangas));
      }
    }
  }, []);

  const searchManga = useCallback(async (animeTitle: string) => {
    try {
      const response = await fetch(
        `/api/manga-search?title=${encodeURIComponent(animeTitle)}`
      );
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setMangaResults(data.data);
      } else {
        setMangaResults([]);
      }
    } catch (error) {
      console.error("Error searching manga:", error);
      setMangaResults([]);
    }
  }, []);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;

      setIsLoading(true);
      setError(null);
      setMangaResults([]);
      setHasSearched(true);

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
          const anime = data.data[0];
          setAnimeResult(anime);

          searchManga(anime.title);
        } else {
          setError("No se encontró ningún anime con ese nombre.");
        }
      } catch (err) {
        setError("Failed to fetch anime. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, animeType, searchManga]
  );

  const addToFavoriteMangas = useCallback((id: string) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = prevFavorites.includes(id)
        ? prevFavorites.filter((favId) => favId !== id)
        : [...prevFavorites, id];

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "favoriteMangas",
          JSON.stringify(updatedFavorites)
        );
      }

      return updatedFavorites;
    });
  }, []);

  const isFavoriteMangas = useCallback(
    (id: string) => {
      return favorites.includes(id);
    },
    [favorites]
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 overflow-hidden opacity-95 bg-stone-950 text-white">
      <NoisePattern />
      <motion.div
        initial={false}
        animate={hasSearched ? { y: 0 } : { y: "30vh" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-xl my-10"
      >
        {!hasSearched && (
          <h1 className="sm:text-3xl text-2xl font-black text-center">
            JikanDex
          </h1>
        )}
        <p className="sm:text-xl text-md font-medium mb-5 text-center">
          Busca un anime y encuentra la fuente en{" "}
          <a
            href="https://www.mangadex.org"
            className="font-bold text-orange-400 hover:text-orange-300 transition duration-200 ease-in-out"
          >
            MangaDex
          </a>
          .
        </p>

        <form onSubmit={handleSearch} className="w-full">
          <div
            className={`flex flex-col sm:flex-row gap-2 sm:gap-0 rounded-xl ${
              hasSearched ? "" : "shadow-xl shadow-white/5"
            }`}
          >
            <div className=" flex flex-row w-full justify-between bg-transparent border border-white/50 sm:rounded-r-none rounded-xl">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre del anime"
                className="p-4 outline-none w-full rounded-l-xl bg-transparent placeholder-stone-500 "
              />
              <select
                value={animeType}
                onChange={(e) => setAnimeType(e.target.value as "tv" | "movie")}
                className="max-w-18 w-min mr-3 text-right outline-none sm:rounded-none rounded-xl bg-transparent "
              >
                <option value="tv" className="text-black">
                  TV
                </option>
                <option value="movie" className="text-black">
                  Película
                </option>
              </select>
            </div>
            <button
              type="submit"
              className="border border-white/50 bg-transparent text-white px-6 py-4 hover:bg-stone-900 hover:text-white transition duration-100 ease-in-out rounded-xl sm:rounded-l-none sm:rounded-r-xl sm:border-l-0 w-full sm:w-[120px] "
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
              <div className="bg-stone-950 p-6 rounded-xl border border-white/20  shadow-xl shadow-white/5 mb-5">
                <h2 className="text-2xl font-bold">
                  {animeResult.title_english}
                </h2>
                <div className="flex flex-col items-start mb-4">
                  {animeResult.title_english !== animeResult.title && (
                    <h3 className="text-lg font-medium">{animeResult.title}</h3>
                  )}
                  <p className="text-sm text-stone-500">
                    {animeResult.title_japanese}
                  </p>
                </div>
                <div className="flex mb-4">
                  <div className="w-1/3 mr-4">
                    <Image
                      src={animeResult.images.jpg.image_url}
                      alt={animeResult.title}
                      width={200}
                      height={300}
                      className="rounded-lg object-contain max-h-[300px]"
                    />
                    <a
                      href={animeResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3.5 w-full text-center inline-block text-blue-200 bg-blue-900 text-stone px-4 py-2 rounded-lg hover:bg-blue-800 hover:text-blue-50 transition duration-300 ease-in-out"
                    >
                      Ver en MyAnimeList
                    </a>
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
                    <div className="max-h-60 overflow-y-auto mb-4 pr-2">
                      <p>{animeResult.synopsis}</p>
                    </div>
                  </div>
                </div>
                {animeResult.source !== "Manga" &&
                  animeResult.source !== "Web manga" &&
                  animeResult.source !== "Light novel" && (
                    <p className="text-yellow-200 bg-yellow-700 p-3 rounded-lg my-4">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faWarning} className="fa-fw" />
                        Su fuente original no es Manga.
                      </div>
                    </p>
                  )}
                {animeResult.source == "Light novel" && (
                  <p className="text-sky-200 bg-sky-700 p-3 rounded-lg my-4">
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
                        Su fuente original es un Light novel.
                      </a>
                    </div>
                  </p>
                )}
                {mangaResults.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      Manga relacionado:
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {mangaResults.map((manga) => (
                        <div
                          key={manga.id}
                          className="bg-stone-800 p-4 rounded-lg shadow-md hover:bg-stone-700 transition duration-300"
                        >
                          <h4 className="text-xl font-bold">
                            {manga.attributes.title.en ||
                              manga.attributes.title.ja ||
                              manga.attributes.title["ja-ro"]}
                          </h4>
                          <p className="text-sm text-stone-400">
                            Año: {manga.attributes.year || "N/A"}
                          </p>
                          <p className="text-sm text-stone-400">
                            Estado: {manga.attributes.status || "N/A"}
                          </p>
                          <a
                            href={`https://mangadex.org/title/${manga.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 underline mt-2 inline-block"
                          >
                            Leer en MangaDex
                          </a>
                          <p></p>
                          <button
                            className="mt-4 text-red-500 hover:text-red-600 focus:outline-none"
                            onClick={() => addToFavoriteMangas(manga.id)}
                          >
                            <FontAwesomeIcon
                              icon={
                                isFavoriteMangas(manga.id)
                                  ? faHeartSolid
                                  : faHeartRegular
                              }
                              size="lg"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {mangaResults.length === 0 && (
                  <p className="text-stone-500 text-left">
                    No se encontraron mangas relacionados.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

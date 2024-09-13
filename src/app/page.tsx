"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faWarning } from "@fortawesome/free-solid-svg-icons";

// Tipo de respuesta para los resultados de Anime
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

// Tipo de respuesta para los resultados de Manga
type MangaResult = {
  id: string;
  title: {
    en: string;
    ja: string;
  };
  description: string;
  cover_art: string;
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [animeResult, setAnimeResult] = useState<AnimeResult | null>(null);
  const [mangaResult, setMangaResult] = useState<MangaResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos del anime desde la API de anime (suponiendo que ya está configurada)
  const fetchAnimeData = async (title: string) => {
    const response = await fetch(`URL_DE_TU_API_ANIME?search=${encodeURIComponent(title)}`);
    if (!response.ok) {
      throw new Error('Error fetching anime data');
    }
    return await response.json();
  };

  // Función para obtener datos del manga desde la API de MangaDex
  const fetchMangaData = async (title: string) => {
    const response = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(title)}`);
    if (!response.ok) {
      throw new Error('Error fetching manga data');
    }
    const data = await response.json();
    
    if (data && data.data && data.data.length > 0) {
      const manga = data.data[0]; // Tomar el primer resultado
      const mangaResult: MangaResult = {
        id: manga.id,
        title: {
          en: manga.attributes.title.en || "N/A",
          ja: manga.attributes.title.ja || "N/A",
        },
        description: manga.attributes.description.en || "Descripción no disponible",
        cover_art: `https://uploads.mangadex.org/covers/${manga.id}/${manga.attributes.coverArt.fileName}`,
      };
      return mangaResult;
    }
    return null;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const animeResponse = await fetchAnimeData(searchTerm);
      setAnimeResult(animeResponse);

      const mangaData = await fetchMangaData(searchTerm);
      setMangaResult(mangaData);

      setHasSearched(true);
      setError(null);
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for an anime or manga"
        />
        <button type="submit" disabled={isLoading}>Search</button>
      </form>

      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {hasSearched && !isLoading && (
        <div>
          {animeResult && (
            <div>
              <h2>Anime Result:</h2>
              <p>Title: {animeResult.title}</p>
              <p>Episodes: {animeResult.episodes}</p>
              <p>Synopsis: {animeResult.synopsis}</p>
              <img src={animeResult.images.jpg.image_url} alt="Anime cover" />
            </div>
          )}

          {mangaResult && (
            <div>
              <h2>Manga Result:</h2>
              <p>Title: {mangaResult.title.en}</p>
              <p>Japanese Title: {mangaResult.title.ja}</p>
              <p>Description: {mangaResult.description}</p>
              <img src={mangaResult.cover_art} alt="Manga cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

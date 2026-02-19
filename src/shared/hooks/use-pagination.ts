import { useState, useEffect } from "react";

export const usePagination = (initialPage = 1) => {
  const [page, setPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  return { page, setPage, searchTerm, setSearchTerm };
};
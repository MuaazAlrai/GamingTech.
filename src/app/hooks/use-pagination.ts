import { useEffect, useMemo, useState } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const pagedItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return {
    page,
    pageSize,
    totalPages,
    setPage,
    pagedItems,
    startItem: items.length === 0 ? 0 : (page - 1) * pageSize + 1,
    endItem: Math.min(page * pageSize, items.length),
    totalItems: items.length,
  };
}

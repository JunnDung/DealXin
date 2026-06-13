"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Grid3X3,
  List,
  RefreshCw,
  Search,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { DealCard } from "@/components/deal-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  categoriesApi,
  type CategoryResponse,
  searchApi,
  type SearchQueryParams,
} from "@/lib/api";

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "hot", label: "Hot nhất" },
  { value: "discount", label: "Giảm nhiều nhất" },
  { value: "price_low", label: "Giá thấp → cao" },
  { value: "price_high", label: "Giá cao → thấp" },
];

const platformOptions = [
  { value: "", label: "Tất cả nền tảng" },
  { value: "SHOPEE", label: "Shopee" },
  { value: "LAZADA", label: "Lazada" },
  { value: "TIKTOK_SHOP", label: "TikTok Shop" },
];

const discountRanges = [
  { value: 0, label: "Tất cả" },
  { value: 10, label: "10%+" },
  { value: 20, label: "20%+" },
  { value: 30, label: "30%+" },
  { value: 50, label: "50%+" },
];

function updateSearchParams(
  router: ReturnType<typeof useRouter>,
  updates: Record<string, string | number | undefined>,
) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "" || value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  router.push(url.toString(), { scroll: false });
}

function FilterSidebar({
  categories,
  filters,
  onFilterChange,
  onClearFilter,
  onClearAll,
}: {
  categories: CategoryResponse[];
  filters: {
    platform: string;
    categoryId: string;
    minDiscount: number;
    sortBy: string;
  };
  onFilterChange: (key: string, value: string | number) => void;
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
}) {
  const activeFilters = [
    filters.platform
      ? {
          key: "platform",
          label: platformOptions.find((p) => p.value === filters.platform)
            ?.label,
        }
      : null,
    filters.categoryId
      ? {
          key: "categoryId",
          label: categories.find((c) => c.id === filters.categoryId)?.name,
        }
      : null,
    filters.minDiscount > 0
      ? { key: "minDiscount", label: `Giảm ${filters.minDiscount}%+` }
      : null,
  ].filter(Boolean) as { key: string; label?: string }[];

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Sắp xếp</h3>
        <Select
          value={filters.sortBy}
          onValueChange={(v) => onFilterChange("sortBy", v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Platform */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Nền tảng</h3>
        <div className="space-y-1">
          {platformOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange("platform", opt.value)}
              className={[
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                filters.platform === opt.value
                  ? "bg-primary/10 font-medium text-primary"
                  : "hover:bg-muted",
              ].join(" ")}
            >
              {opt.label}
              {filters.platform === opt.value && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Danh mục</h3>
        <div className="space-y-1">
          <button
            onClick={() => onFilterChange("categoryId", "")}
            className={[
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
              !filters.categoryId
                ? "bg-primary/10 font-medium text-primary"
                : "hover:bg-muted",
            ].join(" ")}
          >
            Tất cả
            {!filters.categoryId && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange("categoryId", cat.id)}
              className={[
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                filters.categoryId === cat.id
                  ? "bg-primary/10 font-medium text-primary"
                  : "hover:bg-muted",
              ].join(" ")}
            >
              {cat.name}
              {filters.categoryId === cat.id && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Discount Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Mức giảm giá</h3>
          <span className="text-sm text-primary">{filters.minDiscount}%+</span>
        </div>
        <Slider
          value={[filters.minDiscount]}
          onValueChange={([v]) => onFilterChange("minDiscount", v)}
          min={0}
          max={80}
          step={5}
          className="py-2"
        />
        <div className="flex flex-wrap gap-1">
          {discountRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => onFilterChange("minDiscount", range.value)}
              className={[
                "rounded-full px-2.5 py-0.5 text-xs transition-colors",
                filters.minDiscount === range.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80",
              ].join(" ")}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters & Clear */}
      {activeFilters.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Bộ lọc đang chọn
            </span>
            <button
              onClick={onClearAll}
              className="text-xs text-primary hover:underline"
            >
              Xóa tất cả
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map(
              (f) =>
                f.label && (
                  <Badge
                    key={f.key}
                    variant="secondary"
                    className="gap-1 pr-1.5"
                  >
                    {f.label}
                    <button
                      onClick={() => onClearFilter(f.key)}
                      className="ml-0.5 rounded-sm opacity-70 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const query = searchParams.get("q") || "";
  const sortBy = searchParams.get("sortBy") || "newest";
  const platform = searchParams.get("platform") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const minDiscount = parseInt(searchParams.get("minDiscount") || "0");
  const page = parseInt(searchParams.get("page") || "1");

  const searchParams_: SearchQueryParams = {
    q: query || undefined,
    sortBy: sortBy as SearchQueryParams["sortBy"],
    platform: platform || undefined,
    categoryId: categoryId || undefined,
    minDiscount: minDiscount > 0 ? minDiscount : undefined,
    page,
    limit: 12,
  };

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["search", searchParams_],
    queryFn: () => searchApi.search(searchParams_),
    enabled: true,
    staleTime: 30 * 1000,
  });

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateSearchParams(router, { q: inputValue || undefined, page: 1 });
    },
    [inputValue, router],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string | number) => {
      updateSearchParams(router, { [key]: value || undefined, page: 1 });
    },
    [router],
  );

  const handleClearFilter = useCallback(
    (key: string) => {
      updateSearchParams(router, { [key]: undefined, page: 1 });
    },
    [router],
  );

  const handleClearAll = useCallback(() => {
    updateSearchParams(router, {
      platform: undefined,
      categoryId: undefined,
      minDiscount: undefined,
      sortBy: "newest",
      page: 1,
    });
  }, [router]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateSearchParams(router, { page: newPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router],
  );

  useEffect(() => {
    // Sync inputValue with URL when query param changes (browser back/forward)
  }, []);

  const filters = {
    platform,
    categoryId,
    minDiscount,
    sortBy,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-jakarta text-2xl font-bold">
          {query ? `Kết quả tìm kiếm: "${query}"` : "Tìm kiếm deal"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {searchResults
            ? `${searchResults.meta.total} deal được tìm thấy`
            : isLoading
              ? "Đang tìm kiếm..."
              : "Nhập từ khóa để tìm kiếm"}
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tìm kiếm deal, sản phẩm..."
            className="h-11 w-full rounded-lg border border-border bg-card py-2 pl-10 pr-12 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                updateSearchParams(router, { q: undefined, page: 1 });
              }}
              className="absolute right-12 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-muted"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            Tìm
          </Button>
        </div>
      </form>

      {/* Main Content: Sidebar + Results */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border border-border bg-card p-4">
            <FilterSidebar
              categories={categoriesData || []}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
              onClearAll={handleClearAll}
            />
          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-1">
          {/* Mobile Filter + View Controls */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {/* Mobile Filter Trigger */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden gap-1.5"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="pt-4">
                  <FilterSidebar
                    categories={categoriesData || []}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilter={handleClearFilter}
                    onClearAll={handleClearAll}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Active Filters Summary */}
            <div className="hidden gap-1.5 lg:flex">
              {filters.platform && (
                <Badge variant="secondary" className="gap-1">
                  {
                    platformOptions.find((p) => p.value === filters.platform)
                      ?.label
                  }
                  <button
                    onClick={() => handleClearFilter("platform")}
                    className="ml-0.5 rounded-sm opacity-70 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.categoryId && (
                <Badge variant="secondary" className="gap-1">
                  {
                    categoriesData?.find((c) => c.id === filters.categoryId)
                      ?.name
                  }
                  <button
                    onClick={() => handleClearFilter("categoryId")}
                    className="ml-0.5 rounded-sm opacity-70 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.minDiscount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  Giảm {filters.minDiscount}%+
                  <button
                    onClick={() => handleClearFilter("minDiscount")}
                    className="ml-0.5 rounded-sm opacity-70 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Grid/List */}
          {isLoading ? (
            <div
              className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <Skeleton className="aspect-[16/9] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                  <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Đã xảy ra lỗi
                </h3>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  Không thể tải kết quả tìm kiếm. Vui lòng thử lại.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          ) : searchResults && searchResults.data.length > 0 ? (
            <>
              <div
                className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
              >
                {searchResults.data.map((deal) => (
                  <DealCard key={deal.id} deal={deal} voting={false} />
                ))}
              </div>

              {/* Pagination */}
              {searchResults.meta.totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Trước
                  </Button>
                  {Array.from({
                    length: Math.min(searchResults.meta.totalPages, 7),
                  }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={i}
                        variant={
                          searchResults.meta.page === pageNum
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {searchResults.meta.totalPages > 7 &&
                    page < searchResults.meta.totalPages - 2 && (
                      <>
                        <span className="px-1 text-muted-foreground">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={() =>
                            handlePageChange(searchResults.meta.totalPages)
                          }
                        >
                          {searchResults.meta.totalPages}
                        </Button>
                      </>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= searchResults.meta.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <SearchX className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {query ? "Không tìm thấy kết quả" : "Chưa có kết quả"}
                </h3>
                <p className="mb-2 max-w-sm text-sm text-muted-foreground">
                  {query
                    ? `Không có deal nào phù hợp với "${query}".`
                    : "Chưa có deal nào phù hợp với bộ lọc hiện tại."}
                </p>
                <p className="mb-6 max-w-sm text-xs text-muted-foreground">
                  Thử thay đổi từ khóa hoặc xóa bớt bộ lọc để xem thêm kết quả.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {query && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInputValue("");
                        updateSearchParams(router, { q: undefined, page: 1 });
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Xóa tìm kiếm
                    </Button>
                  )}
                  {(filters.platform ||
                    filters.categoryId ||
                    filters.minDiscount > 0) && (
                    <Button variant="outline" onClick={handleClearAll}>
                      Xóa bộ lọc
                    </Button>
                  )}
                  <Button asChild>
                    <Link href="/deals">Khám phá deals</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-11 w-full max-w-2xl mb-6 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}

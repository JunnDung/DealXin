"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Activity,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Search,
  Server,
  Shield,
  Tag,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { type DealResponse, dealsApi } from "@/lib/api";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  APPROVED: {
    label: "Đã duyệt",
    color:
      "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle,
  },
  PENDING: {
    label: "Chờ duyệt",
    color:
      "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock,
  },
  REJECTED: {
    label: "Từ chối",
    color: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
  EXPIRED: {
    label: "Hết hạn",
    color:
      "text-slate-600 bg-slate-50 dark:bg-slate-900/30 dark:text-slate-400",
    icon: XCircle,
  },
};

function formatPrice(price: number, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AdminPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isHydrated && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-deals", page, statusFilter],
    queryFn: () =>
      dealsApi.adminAll({
        page,
        limit: 20,
        ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      }),
    enabled: isHydrated && !!user && user.role === "ADMIN",
    staleTime: 30 * 1000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => dealsApi.approve(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => dealsApi.reject(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-deals"] }),
  });

  const columnHelper = createColumnHelper<DealResponse>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<DealResponse, any>[] = [
    columnHelper.accessor("title", {
      header: "Tiêu đề",
      cell: (info) => (
        <Link
          href={`/deals/${info.row.original.slug}`}
          className="font-medium hover:text-primary line-clamp-1 max-w-[300px] block"
          target="_blank"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: (info) => {
        const cfg = statusConfig[info.getValue()] || statusConfig.PENDING;
        return (
          <Badge className={`${cfg.color} border-0`}>
            <cfg.icon className="mr-1 h-3 w-3" />
            {cfg.label}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("platform", {
      header: "Nền tảng",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("salePrice", {
      header: "Giá",
      cell: (info) => (
        <span className="font-medium">
          {formatPrice(info.getValue(), info.row.original.currency)}
        </span>
      ),
    }),
    columnHelper.accessor("discountPercent", {
      header: "Giảm giá",
      cell: (info) =>
        info.getValue() > 0 ? (
          <span className="font-bold text-primary">-{info.getValue()}%</span>
        ) : (
          "-"
        ),
    }),
    columnHelper.accessor("score", {
      header: "Score",
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => row.creator?.fullName || "-", {
      id: "creator",
      header: "Người đăng",
    }),
    columnHelper.display({
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/deals/${row.original.slug}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Xem deal
              </Link>
            </DropdownMenuItem>
            {row.original.status === "PENDING" && (
              <>
                <DropdownMenuItem
                  onClick={() => approveMutation.mutate(row.original.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Duyệt
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => rejectMutation.mutate(row.original.id)}
                >
                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  Từ chối
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const deals = data?.data ?? [];
  const pendingCount = deals.filter((d) => d.status === "PENDING").length;
  const approvedCount = deals.filter((d) => d.status === "APPROVED").length;
  const rejectedCount = deals.filter((d) => d.status === "REJECTED").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <div>
            <h1 className="font-jakarta text-2xl font-bold">Quản trị</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý deals chờ duyệt và nội dung
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex items-center gap-1 border-b">
        <Link
          href="/admin"
          className="flex items-center gap-2 border-b-2 border-saffron px-4 py-2 text-sm font-medium text-foreground"
        >
          <Tag className="h-4 w-4" />
          Deals
        </Link>
        <Link
          href="/admin/analytics"
          className="flex items-center gap-2 border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:border-saffron/50 hover:text-foreground transition-colors"
        >
          <Activity className="h-4 w-4" />
          Analytics
        </Link>
        <Link
          href="/admin/status"
          className="flex items-center gap-2 border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:border-saffron/50 hover:text-foreground transition-colors"
        >
          <Server className="h-4 w-4" />
          Status
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Chờ duyệt",
            count: pendingCount,
            color: "text-yellow-600",
            key: "PENDING",
          },
          {
            label: "Đã duyệt",
            count: approvedCount,
            color: "text-green-600",
            key: "APPROVED",
          },
          {
            label: "Từ chối",
            count: rejectedCount,
            color: "text-red-600",
            key: "REJECTED",
          },
          {
            label: "Tổng cộng",
            count: deals.length,
            color: "text-foreground",
            key: "ALL",
          },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setStatusFilter(stat.key)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              statusFilter === stat.key
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <p className="text-2xl font-bold">{isLoading ? "-" : stat.count}</p>
            <p className={`text-xs ${stat.color}`}>{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm deal..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="PENDING">Chờ duyệt</SelectItem>
            <SelectItem value="APPROVED">Đã duyệt</SelectItem>
            <SelectItem value="REJECTED">Từ chối</SelectItem>
            <SelectItem value="EXPIRED">Hết hạn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : deals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {table.getHeaderGroups().map((hg) =>
                    hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <Tag className="mx-auto h-8 w-8 mb-3 opacity-50" />
            <p>Không có deal nào.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {data.meta.page} / {data.meta.totalPages} · {data.meta.total}{" "}
            deals
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {page} / {data.meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export class PaginationMeta {
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
}

export class PaginatedResponse<T> {
  data!: T[];
  meta!: PaginationMeta;

  constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.meta = meta;
  }
}

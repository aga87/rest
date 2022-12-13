type Pagination = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

type ReturnType =
  | {
      skip: number;
      pagination: Pagination;
    }
  | { error: string };

export const getPagination = ({
  page,
  pageSize,
  defaultPageSize,
  maxPageSize,
  totalCount
}: {
  page: string;
  pageSize: string;
  defaultPageSize: number;
  maxPageSize: number;
  totalCount: number;
}): ReturnType => {
  const parsedPage = parseInt(page as string, 10) || 1;
  let parsedPageSize = parseInt(pageSize as string, 10) || defaultPageSize;

  if (parsedPageSize > maxPageSize) {
    parsedPageSize = maxPageSize;
  }

  const skip = (parsedPage - 1) * parsedPageSize;

  const totalPages = Math.ceil(totalCount / parsedPageSize);

  if (parsedPage > totalPages)
    return { error: 'The requested page does not exist' };

  return {
    skip,
    pagination: {
      currentPage: parsedPage,
      pageSize: parsedPageSize,
      totalCount,
      totalPages
    }
  };
};

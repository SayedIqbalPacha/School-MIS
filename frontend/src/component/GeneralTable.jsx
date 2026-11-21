import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatCellValue(value, format) {
  if (value === null || value === undefined || value === '') return '—';

  if (format === 'number' && Number.isFinite(Number(value))) {
    return new Intl.NumberFormat().format(Number(value));
  }

  if (format === 'date') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat().format(date);
  }

  return String(value);
}

export default function GeneralTable({
  columns = [],
  data = [],
  actions,
  getRowId,
  emptyMessage = 'No records found.',
  loading = false,
  scrollbarClassName = '',
}) {
  return (
    <div
      className={`h-[max(16rem,calc(100dvh-250px))] w-full min-w-0 overflow-auto rounded-md border lg:h-[calc(100vh-250px)] ${scrollbarClassName}`}
    >
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className="sticky top-0 bg-muted/70">
                {column.label}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="sticky top-0 bg-muted/70 text-right">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                Loading records…
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={getRowId ? getRowId(row) : row._id || rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column.key} className="whitespace-nowrap">
                    {column.render
                      ? column.render(row)
                      : formatCellValue(row[column.key], column.format)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">{actions(row)}</TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

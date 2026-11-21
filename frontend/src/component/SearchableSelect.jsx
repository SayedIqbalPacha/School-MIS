import { Combobox } from '@base-ui/react/combobox';
import { CheckIcon, SearchIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .trim();
}

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  onBlur,
  inputRef,
  id,
  placeholder = 'Search and select…',
  clearLabel = 'Clear selection',
  emptyMessage = 'No matching records found.',
  invalid = false,
  disabled = false,
  dir = 'ltr',
  showMoreLabel = (count) => `Show ${count} more results`,
}) {
  const selected = options.find((option) => option.value === value) ?? null;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const normalizedQuery = normalizeSearch(query);

  const matches = normalizedQuery
    ? options
        .map((option) => ({
          option,
          rank: Math.min(
            ...[option.label, ...(option.searchTerms ?? [])].map((name) => {
              const normalizedName = normalizeSearch(name);
              if (normalizedName === normalizedQuery) return 0;
              if (normalizedName.startsWith(normalizedQuery)) return 1;
              return normalizedName.includes(normalizedQuery) ? 2 : Infinity;
            }),
          ),
        }))
        .filter(({ rank }) => Number.isFinite(rank))
        .sort((a, b) => a.rank - b.rank)
        .map(({ option }) => option)
    : [];

  return (
    <Combobox.Root
      disabled={disabled}
      items={options}
      filteredItems={matches.slice(0, visibleCount)}
      open={open && Boolean(normalizedQuery)}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery('');
          setVisibleCount(10);
        }
      }}
      onInputValueChange={(input, details) => {
        setQuery(details.reason === 'input-change' ? input : '');
        setVisibleCount(10);
      }}
      value={selected}
      onValueChange={(option) => onChange(option?.value ?? '')}
      isItemEqualToValue={(option, selectedOption) =>
        option.value === selectedOption.value
      }
    >
      <div className="relative min-w-0" dir={dir}>
        <SearchIcon className="pointer-events-none absolute start-2.5 top-2 size-4 text-muted-foreground" />
        <Combobox.Input
          id={id}
          ref={inputRef}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={invalid}
          className="h-9 w-full min-w-0 rounded-lg border border-input bg-transparent py-1 ps-8 pe-8 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm dark:bg-input/30"
        />
        <Combobox.Clear
          aria-label={clearLabel}
          className="absolute end-1 top-0 flex size-9 items-center justify-center rounded-md text-muted-foreground focus-visible:outline-ring"
        >
          <XIcon className="size-4" />
        </Combobox.Clear>
      </div>
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} align="start" className="z-50">
          <Combobox.Popup className="max-h-[min(16rem,var(--available-height))] w-(--anchor-width) max-w-(--available-width) overflow-y-auto overscroll-contain rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <Combobox.Empty className="px-2 py-3 text-muted-foreground empty:hidden">
              {emptyMessage}
            </Combobox.Empty>
            <Combobox.List>
              {(option) => (
                <Combobox.Item
                  key={option.value}
                  value={option}
                  className="flex min-h-9 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-start break-words outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block">{option.label}</span>
                    {option.description && (
                      <span className="block text-xs text-muted-foreground" dir="auto">
                        {option.description}
                      </span>
                    )}
                  </span>
                  <Combobox.ItemIndicator>
                    <CheckIcon className="size-4 shrink-0" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
            {matches.length > visibleCount && (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setVisibleCount((count) => count + 10)}
                className="min-h-9 w-full rounded-md px-2 py-1.5 text-start font-medium hover:bg-accent focus-visible:outline-ring"
              >
                {showMoreLabel(matches.length - visibleCount)}
              </button>
            )}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

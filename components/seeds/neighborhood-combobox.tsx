'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { RiArrowDownSLine, RiSearchLine } from '@remixicon/react';
import * as Input from '@/components/ui/input';
import {
  filterNeighborhoods,
  normalizeNeighborhoodQuery,
} from '@/lib/neighborhoods';
import { cn } from '@/utils/cn';

type NeighborhoodComboboxProps = {
  id?: string;
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  hasError?: boolean;
};

export function NeighborhoodCombobox({
  id,
  name = 'neighborhood',
  defaultValue = '',
  placeholder = 'Buscar bairro…',
  hasError,
}: NeighborhoodComboboxProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(defaultValue);
  const [value, setValue] = useState(defaultValue);
  const [activeIndex, setActiveIndex] = useState(0);

  const options = filterNeighborhoods(query);
  const showList = open && options.length > 0;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, value]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function selectNeighborhood(neighborhood: string) {
    setValue(neighborhood);
    setQuery(neighborhood);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (!open) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (options.length === 0) return;
      setActiveIndex((current) =>
        current + 1 >= options.length ? 0 : current + 1,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (options.length === 0) return;
      setActiveIndex((current) =>
        current - 1 < 0 ? options.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const selected = options[activeIndex];
      if (selected) selectNeighborhood(selected);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      setQuery(value);
    }
  }

  function handleBlur() {
    const match = options.find(
      (option) =>
        normalizeNeighborhoodQuery(option) ===
        normalizeNeighborhoodQuery(query),
    );

    if (match) {
      selectNeighborhood(match);
      return;
    }

    setOpen(false);
    setQuery(value);
  }

  return (
    <div ref={rootRef} className='relative'>
      <input type='hidden' name={name} value={value} />
      <Input.Root hasError={hasError}>
        <Input.Wrapper>
          <Input.Icon as={RiSearchLine} />
          <Input.Input
            id={id}
            role='combobox'
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete='list'
            aria-activedescendant={
              showList ? `${listboxId}-option-${activeIndex}` : undefined
            }
            autoComplete='off'
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <RiArrowDownSLine
            className={cn(
              'size-5 shrink-0 text-text-soft-400 transition duration-200',
              open && 'rotate-180 text-text-sub-600',
            )}
            aria-hidden
          />
        </Input.Wrapper>
      </Input.Root>

      {showList ? (
        <ul
          id={listboxId}
          role='listbox'
          className='absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-10 border border-stroke-soft-200 bg-bg-white-0 py-1 shadow-regular-md'
        >
          {options.map((neighborhood, index) => {
            const isActive = index === activeIndex;
            const isSelected = neighborhood === value;

            return (
              <li
                key={neighborhood}
                id={`${listboxId}-option-${index}`}
                role='option'
                aria-selected={isSelected}
                className={cn(
                  'cursor-pointer px-3 py-2.5 text-paragraph-sm text-text-strong-950 transition duration-150',
                  isActive && 'bg-bg-weak-50',
                  isSelected && 'font-medium',
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectNeighborhood(neighborhood);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {neighborhood}
              </li>
            );
          })}
        </ul>
      ) : null}

      {open && query && options.length === 0 ? (
        <div className='absolute z-50 mt-1.5 w-full rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-sub-600 shadow-regular-md'>
          Nenhum bairro encontrado.
        </div>
      ) : null}
    </div>
  );
}

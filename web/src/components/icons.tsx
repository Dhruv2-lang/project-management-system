import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

// Small stroke icon set (24x24 grid). Pass `className` to size/colour them.
const make = (paths: string | string[]) =>
  function Icon(props: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-5 w-5"
        {...props}
      >
        {(Array.isArray(paths) ? paths : [paths]).map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    );
  };

export const PlusIcon = make('M12 5v14M5 12h14');
export const SearchIcon = make(['M21 21l-4.35-4.35', 'M11 19a8 8 0 100-16 8 8 0 000 16z']);
export const PencilIcon = make(['M12 20h9', 'M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z']);
export const TrashIcon = make([
  'M3 6h18',
  'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2',
  'M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6',
  'M10 11v6',
  'M14 11v6',
]);
export const MenuIcon = make('M3 6h18M3 12h18M3 18h18');
export const CloseIcon = make('M18 6L6 18M6 6l12 12');
export const LogoutIcon = make(['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9']);
export const HomeIcon = make(['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z']);
export const FolderIcon = make('M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z');
export const CheckSquareIcon = make(['M9 11l3 3L22 4', 'M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11']);
export const CheckCircleIcon = make(['M22 11.08V12a10 10 0 11-5.93-9.14', 'M22 4L12 14.01l-3-3']);
export const ClockIcon = make(['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M12 6v6l4 2']);
export const PlayIcon = make(['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M10 8l6 4-6 4V8z']);
export const AlertIcon = make([
  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  'M12 9v4',
  'M12 17h.01',
]);
export const CalendarIcon = make([
  'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z',
  'M16 2v4',
  'M8 2v4',
  'M3 10h18',
]);

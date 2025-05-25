// -----------------------------------------------------------------------------
// loader.tsx
// This file defines a reusable Loader component for displaying a loading spinner.
// It is used across the application to indicate loading states during data fetching.
// Future developers: Customize the spinner styles here if needed.
// -----------------------------------------------------------------------------

export function Loader() {
	return (
		<div className="flex items-center justify-center">
			<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
		</div>
	);
}

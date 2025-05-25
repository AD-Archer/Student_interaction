// -----------------------------------------------------------------------------
// loader.d.ts
// Type declaration for the Loader component.
// This ensures TypeScript recognizes the Loader module and its exports.
// -----------------------------------------------------------------------------
// I need to import React types so that TypeScript recognizes the JSX namespace.

import * as React from "react";

declare module "@/components/ui/loader" {
	export function Loader(): React.JSX.Element;
}

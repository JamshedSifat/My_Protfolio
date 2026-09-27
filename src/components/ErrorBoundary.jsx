import { Component } from "react";

/**
 * Prevents a single failing subtree from blanking the whole page.
 * Used around the 3D scene (WebGL can fail on old GPUs / blocked contexts)
 * and around the route outlet.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surfaced in the console for debugging; never shown raw to visitors.
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    const { children, fallback, silent } = this.props;

    if (!error) return children;
    if (silent) return fallback ?? null;
    if (fallback) return fallback;

    return (
      <div
        role="alert"
        className="mx-auto my-16 max-w-md rounded-2xl border border-line bg-surface/70 p-7 text-center backdrop-blur-xl"
      >
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
          Something went wrong here.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          The rest of the page is still fine. Reloading usually clears it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 h-10 rounded-full bg-accent px-5 text-[13.5px] font-medium text-white"
        >
          Reload
        </button>
      </div>
    );
  }
}

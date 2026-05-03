/** Renders a banner when a slice's backend is still stubbed (NotImplementedError → 501). */
export function StubBanner({ person, slice }) {
  return (
    <div className="stub-banner">
      <strong>STUB · {person}</strong>
      <span>
        Showing mock data for the <em>{slice}</em> slice. Once {person} implements the
        backend controller, this banner disappears and real data loads.
      </span>
    </div>
  );
}

import { useRef } from "react";
import { I } from "./Icons";

export function SearchBox({ value, onChange, placeholder = "Search products, materials, rooms…" }) {
  const ref = useRef(null);
  return (
    <div className="search-box">
      <I.search />
      <input
        ref={ref}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
      />
      {value && (
        <button className="clear" onClick={() => { onChange(""); ref.current?.focus(); }} aria-label="Clear">
          <I.close />
        </button>
      )}
    </div>
  );
}

import Image from "@/compat/Image";

interface MarketRow {
  label: string;
  pct: number;
}

export default function MarketEmbed({
  title,
  cat,
  cover,
  pct,
  rows,
  vol,
  yesLabel,
  noLabel,
}: {
  title: string;
  cat: string;
  cover: string;
  pct?: number;
  rows?: MarketRow[];
  vol?: string;
  yesLabel: string;
  noLabel: string;
}) {
  const showRows = rows && rows.length > 0;
  const showBinary = !showRows && pct !== undefined;

  return (
    <figure className="blog-market">
      <div className="blog-market-grid">
        <div className="blog-market-cover">
          <Image src={cover} alt="" fill sizes="(max-width: 640px) 100vw, 180px" />
        </div>
        <div className="blog-market-body">
          <div className="blog-market-meta">
            <span className="blog-tag">{cat}</span>
            {vol ? <span>{vol}</span> : null}
          </div>
          <h4 className="blog-market-title">{title}</h4>
          {showRows ? (
            <ul className="blog-market-rows">
              {rows!.map((row) => (
                <li key={row.label} className="blog-market-row">
                  <span className="blog-market-row-label">{row.label}</span>
                  <span className="blog-market-row-pct">{row.pct}%</span>
                </li>
              ))}
            </ul>
          ) : null}
          {showBinary ? (
            <div className="blog-market-binary">
              <div className="blog-market-binary-cell blog-market-binary-yes">
                {yesLabel} {pct}%
              </div>
              <div className="blog-market-binary-cell blog-market-binary-no">
                {noLabel} {100 - pct!}%
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </figure>
  );
}

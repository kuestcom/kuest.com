export default function Comparison({
  columns,
  rows,
}: {
  columns: string[]
  rows: (string | number)[][]
}) {
  return (
    <div className="blog-comparison">
      <table>
        <thead>
          <tr>
            {columns.map((header, i) => (
              <th key={`${header}-${i}`} data-col={i}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} data-col={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

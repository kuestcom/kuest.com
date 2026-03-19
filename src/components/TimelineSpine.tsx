export default function TimelineSpine({ count } : { count: number }) {
    return (
        <div className="tl-spine" id="tlSpine">
            <div className="tl-dot a" data-p="0"></div>
            {Array.from({length: count}).map((_, i) => <div key={i} className="tl-dot" data-p={i+1}></div>)}
        </div>
    )
}
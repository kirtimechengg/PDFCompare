const PRESETS = ['#ff0000', '#0099ff', '#00cc44', '#ff00ff', '#00ffff', '#ffff00', '#000000', '#ffffff']

export default function ColorPicker({ label, color, opacity, onColor, onOpacity }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
        <span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onColor(p)}
            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              background: p,
              borderColor: color === p ? '#fff' : 'transparent',
              boxShadow: p === '#ffffff' ? 'inset 0 0 0 1px #666' : undefined,
            }}
            title={p}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => onColor(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer border border-gray-600 bg-transparent"
          title="Custom color"
        />
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={opacity}
        onChange={(e) => onOpacity(parseFloat(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  )
}

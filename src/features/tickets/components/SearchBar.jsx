export function SearchBar({ value, onChange, placeholder = 'Поиск билетов...' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-6 py-4 text-base border border-gray-300 rounded-2xl focus:ring-2 focus:ring-black focus:outline-none focus:border-transparent"
    />
  )
}

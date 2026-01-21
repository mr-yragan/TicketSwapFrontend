  // TODO: добавить иконку поиска и кнопку очистки
  export function SearchBar({ value, onChange, placeholder = "Поиск билетов..." }) {
    const handleChange = (e) => {
      onChange(e.target.value)
    }

    return (
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-6 py-4 text-base border border-gray-300 rounded-2xl focus:ring-2 focus:ring-black focus:outline-none focus:border-transparent"
      />
    )
  }
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTicketFiles } from '@/hooks/useTicketFiles'

export function TicketCarousel({ ticketId }) {
  const { files, loading, downloadUrls, preloadDownloadUrls } = useTicketFiles(ticketId)
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    if (!ticketId || files.length === 0) {
      return
    }

    preloadDownloadUrls(files.map((file) => file.id))
  }, [files, preloadDownloadUrls, ticketId])

  const currentIndex = files.length === 0 ? 0 : Math.min(slideIndex, files.length - 1)

  const handlePrev = () => {
    setSlideIndex(prev => (prev === 0 ? files.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSlideIndex(prev => (prev === files.length - 1 ? 0 : prev + 1))
  }

  if (loading) {
    return (
      <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-20 mb-6 flex items-center justify-center">
        <div className="text-gray-400">Загрузка изображений...</div>
      </div>
    )
  }
  if (files.length === 0) {
    return (
      <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-20 mb-6 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="mx-auto mb-4" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p className="text-sm">Нет изображений</p>
        </div>
      </div>
    )
  }

  const currentFile = files[currentIndex]
  const currentUrl = currentFile?.id ? downloadUrls[currentFile.id] : null

  return (
    <div className="relative mb-6">
      <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={currentFile?.originalName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400">Загрузка изображения...</div>
        )}

        {files.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
              aria-label="Следующее изображение"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Индикатор слайдов */}
      {files.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {files.map((_, index) => (
            <button
              key={index}
              onClick={() => setSlideIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-black w-6'
                  : 'bg-gray-300 w-2 hover:bg-gray-400'
              }`}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      )}

      {files.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {files.length}
        </div>
      )}
    </div>
  )
}

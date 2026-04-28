import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTicketFiles } from '@/hooks/useTicketFiles'

export function TicketCardImagesCarousel({ ticketId }) {
  const resolvedTicketId = useMemo(() => ticketId ?? null, [ticketId])
  const { files, loading, downloadUrls, getDownloadUrl } = useTicketFiles(resolvedTicketId)
  const [slideIndex, setSlideIndex] = useState(0)
  const currentIndex = files.length === 0 ? 0 : Math.min(slideIndex, files.length - 1)

  useEffect(() => {
    if (!resolvedTicketId) return
    if (files.length === 0) return

    const currentFile = files[currentIndex]
    if (!currentFile?.id) return

    void getDownloadUrl(currentFile.id)
  }, [currentIndex, files, getDownloadUrl, resolvedTicketId])

  const currentFile = files[currentIndex]
  const currentUrl = currentFile?.id ? downloadUrls[currentFile.id] : null

  if (!resolvedTicketId) return null

  // Нет картинок: не резервируем место в карточке
  if (!loading && files.length === 0) return null

  return (
    <div className="relative mb-3 group">
      <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative">
        {loading ? (
          <div className="text-gray-400 text-sm">Загрузка...</div>
        ) : currentUrl ? (
          <img
            src={currentUrl}
            alt={currentFile?.originalName || 'Изображение'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-sm">Загрузка изображения...</div>
        )}

        {files.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSlideIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1))
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Предыдущее изображение"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSlideIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1))
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Следующее изображение"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {files.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {files.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSlideIndex(index)
              }}
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
    </div>
  )
}

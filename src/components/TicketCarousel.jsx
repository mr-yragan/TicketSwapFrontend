import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { useTicketFiles } from '@/hooks/useTicketFiles'

export function TicketCarousel({ ticketId }) {
  const [shouldLoadFiles, setShouldLoadFiles] = useState(false)
  const {
    error,
    files,
    loading,
    downloadUrls,
    getDownloadUrl,
    preloadDownloadUrls,
  } = useTicketFiles(shouldLoadFiles ? ticketId : null)
  const [slideIndex, setSlideIndex] = useState(0)
  const imageFiles = files.filter((file) => file.contentType?.startsWith('image/'))

  useEffect(() => {
    if (!ticketId || !shouldLoadFiles || imageFiles.length === 0) {
      return
    }

    preloadDownloadUrls(imageFiles.map((file) => file.id))
  }, [imageFiles, preloadDownloadUrls, shouldLoadFiles, ticketId])

  const currentIndex = imageFiles.length === 0 ? 0 : Math.min(slideIndex, imageFiles.length - 1)

  const handlePrev = () => {
    setSlideIndex((prev) => (prev === 0 ? imageFiles.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSlideIndex((prev) => (prev === imageFiles.length - 1 ? 0 : prev + 1))
  }

  const handleOpenFile = async (fileId) => {
    const url = await getDownloadUrl(fileId)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  if (!shouldLoadFiles) {
    return (
      <div className="mb-6 flex items-center justify-center rounded-2xl border-2 border-gray-300 bg-gray-100 p-10 sm:p-20">
        <div className="max-w-sm text-center text-gray-500">
          <ImageIcon size={36} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">Файлы билета скрыты</p>
          <p className="mt-2 text-sm">
            Открыть изображения и PDF можно только если у аккаунта есть доступ к этому билету.
          </p>
          <Button
            type="button"
            className="mt-4 bg-black text-white hover:bg-gray-800"
            onClick={() => setShouldLoadFiles(true)}>
            Проверить доступ к файлам
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mb-6 flex items-center justify-center rounded-2xl border-2 border-gray-300 bg-gray-100 p-20">
        <div className="text-gray-400">Загрузка файлов...</div>
      </div>
    )
  }

  if (error === 'noAccess') {
    return (
      <div className="mb-6 flex items-center justify-center rounded-2xl border-2 border-gray-300 bg-gray-100 p-10 sm:p-20">
        <div className="text-center text-gray-500">
          <p className="text-sm font-medium text-gray-700">Нет доступа к файлам этого билета</p>
          <p className="mt-2 text-sm">
            Файлы доступны только продавцу, организатору или покупателю после завершения сделки.
          </p>
          <Button
            type="button"
            className="mt-4 border border-gray-300 bg-white text-black hover:bg-gray-50"
            onClick={() => setShouldLoadFiles(false)}>
            Назад
          </Button>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="mb-6 flex items-center justify-center rounded-2xl border-2 border-gray-300 bg-gray-100 p-20">
        <div className="text-center text-gray-400">
          <svg className="mx-auto mb-4" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p className="text-sm">Файлы не прикреплены</p>
        </div>
      </div>
    )
  }

  const currentFile = imageFiles[currentIndex]
  const currentUrl = currentFile?.id ? downloadUrls[currentFile.id] : null

  return (
    <div className="mb-6">
      {imageFiles.length > 0 ? (
        <div className="relative">
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-300 bg-gray-100">
            {currentUrl ? (
              <img
                src={currentUrl}
                alt={currentFile?.originalName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-gray-400">Загрузка изображения...</div>
            )}

            {imageFiles.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70"
                  aria-label="Предыдущее изображение"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70"
                  aria-label="Следующее изображение"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {imageFiles.length > 1 && (
            <>
              <div className="mt-4 flex justify-center gap-2">
                {imageFiles.map((file, index) => (
                  <button
                    key={file.id}
                    onClick={() => setSlideIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-6 bg-black'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Перейти к слайду ${index + 1}`}
                  />
                ))}
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-sm font-medium text-white">
                {currentIndex + 1} / {imageFiles.length}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-center rounded-2xl border-2 border-gray-300 bg-gray-100 p-10 sm:p-20">
          <div className="max-w-sm text-center text-gray-500">
            <ImageIcon size={36} className="mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Изображений для предпросмотра нет</p>
            <p className="mt-2 text-sm">
              Но у этого билета есть доступные оригинальные файлы, их можно открыть ниже.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900">Доступные файлы</h3>
        <div className="mt-3 space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {file.originalName || `Файл #${file.id}`}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {file.contentType || 'Тип не указан'}
                  {file.sizeBytes ? ` · ${Math.ceil(file.sizeBytes / 1024)} КБ` : ''}
                </p>
              </div>
              <Button
                type="button"
                className="border border-gray-300 bg-white text-black hover:bg-gray-50"
                onClick={() => handleOpenFile(file.id)}
              >
                Открыть файл
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

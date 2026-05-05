import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { useTicketFiles } from '@/hooks/useTicketFiles'
import { useTicketFilePreviews } from '@/hooks/useTicketFilePreviews'

export function TicketCarousel({ ticketId }) {
  const [shouldLoadFiles, setShouldLoadFiles] = useState(false)
  const {
    previews,
    loading: previewsLoading,
  } = useTicketFilePreviews(ticketId)
  const {
    error,
    files,
    loading,
    downloadUrls,
    getDownloadUrl,
    preloadDownloadUrls,
  } = useTicketFiles(shouldLoadFiles ? ticketId : null)
  const [slideIndex, setSlideIndex] = useState(0)
  const imageFiles = useMemo(
    () => files.filter((file) => file.contentType?.startsWith('image/')),
    [files]
  )
  const imageSlides = useMemo(
    () => imageFiles
      .map((file) => ({
        id: file.id,
        url: downloadUrls[file.id] || null,
        alt: file.originalName || `Файл #${file.id}`,
      }))
      .filter((file) => file.url),
    [downloadUrls, imageFiles]
  )
  const previewSlides = useMemo(
    () => previews
      .filter((preview) => preview?.url)
      .map((preview) => ({
        id: preview.fileId,
        url: preview.url,
        alt: `Защищённое превью файла #${preview.fileId}`,
      })),
    [previews]
  )
  const isShowingOriginalImages = shouldLoadFiles && error !== 'noAccess' && imageSlides.length > 0
  const visibleSlides = isShowingOriginalImages ? imageSlides : previewSlides

  useEffect(() => {
    if (!ticketId || !shouldLoadFiles || imageFiles.length === 0) {
      return
    }

    preloadDownloadUrls(imageFiles.map((file) => file.id))
  }, [imageFiles, preloadDownloadUrls, shouldLoadFiles, ticketId])

  const currentIndex = visibleSlides.length === 0 ? 0 : Math.min(slideIndex, visibleSlides.length - 1)

  const handlePrev = () => {
    setSlideIndex((prev) => (prev === 0 ? visibleSlides.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSlideIndex((prev) => (prev === visibleSlides.length - 1 ? 0 : prev + 1))
  }

  const handleOpenFile = async (fileId) => {
    const url = await getDownloadUrl(fileId)
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  if (previewsLoading && !shouldLoadFiles) {
    return (
      <div className="mb-6 flex items-center justify-center rounded-2xl border-2 border-gray-300 bg-gray-100 p-10 sm:p-20">
        <div className="text-gray-400">Загрузка превью...</div>
      </div>
    )
  }

  if (!shouldLoadFiles && previewSlides.length === 0) {
    return (
      <div className="mb-6 flex items-center justify-center rounded-2xl border-2 border-gray-300 bg-gray-100 p-10 sm:p-20">
        <div className="max-w-sm text-center text-gray-500">
          <ImageIcon size={36} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">Фото билета скрыто</p>
          <p className="mt-2 text-sm">
            Открыть изображения и PDF можно только если у аккаунта есть доступ к этому билету.
          </p>
          <Button
            type="button"
            className="mt-4 bg-black text-white hover:bg-gray-800"
            onClick={() => setShouldLoadFiles(true)}>
            Проверить доступ к оригиналам
          </Button>
        </div>
      </div>
    )
  }

  if (shouldLoadFiles && loading) {
    return (
      <div className="mb-6 flex items-center justify-center rounded-2xl border-2 border-gray-300 bg-gray-100 p-20">
        <div className="text-gray-400">Загрузка файлов...</div>
      </div>
    )
  }

  if (visibleSlides.length === 0 && files.length === 0) {
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

  const currentSlide = visibleSlides[currentIndex]

  return (
    <div className="mb-6">
      {visibleSlides.length > 0 ? (
        <div className="relative">
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-300 bg-gray-100">
            {currentSlide?.url ? (
              <img
                src={currentSlide.url}
                alt={currentSlide.alt}
                className={`h-full w-full object-cover ${
                  isShowingOriginalImages ? '' : 'scale-105 blur-md sm:blur-lg'
                }`}
              />
            ) : (
              <div className="text-gray-400">Загрузка изображения...</div>
            )}

            {!isShowingOriginalImages && previewSlides.length > 0 && (
              <div className="absolute left-4 top-4 max-w-[70%] rounded-xl bg-white/90 px-3 py-2 text-left shadow-sm backdrop-blur-sm">
                <p className="text-xs font-semibold text-gray-800">Защищённое превью</p>
                <p className="mt-1 text-[11px] text-gray-600">
                  На витрине показываем только размытое изображение билета.
                </p>
              </div>
            )}

            {visibleSlides.length > 1 && (
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

          {visibleSlides.length > 1 && (
            <>
              <div className="mt-4 flex justify-center gap-2">
                {visibleSlides.map((slide, index) => (
                  <button
                    key={slide.id}
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
                {currentIndex + 1} / {visibleSlides.length}
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

      {!shouldLoadFiles && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900">Оригинальные файлы билета</h3>
          <p className="mt-2 text-sm text-gray-600">
            Изображения и PDF доступны продавцу до продажи, организатору и покупателю после завершения сделки.
          </p>
          <Button
            type="button"
            className="mt-4 bg-black text-white hover:bg-gray-800"
            onClick={() => setShouldLoadFiles(true)}>
            Проверить доступ к оригиналам
          </Button>
        </div>
      )}

      {shouldLoadFiles && error === 'noAccess' && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Оригинальные файлы недоступны этому аккаунту. Для витрины мы показываем только защищённое превью.
        </div>
      )}

      {shouldLoadFiles && error === 'loadError' && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Не удалось загрузить оригинальные файлы билета.
        </div>
      )}

      {shouldLoadFiles && files.length > 0 && error !== 'noAccess' && (
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
      )}

      {previews.length > 0 && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Размытое превью подгружается из публичного защищённого источника и помогает понять формат билета без раскрытия оригинала.
        </div>
      )}

      {shouldLoadFiles && error !== 'noAccess' && files.length === 0 && previews.length > 0 && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          У аккаунта нет доступных оригинальных файлов для этого билета, поэтому остаётся только защищённое превью.
        </div>
      )}
    </div>
  )
}

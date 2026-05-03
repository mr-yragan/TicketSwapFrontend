export function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  inputMode,
  maxLength,
  rows
}) {
  const isTextarea = Boolean(rows)

  const commonProps = {
    value,
    onChange,
    placeholder,
    required,
    disabled,
    maxLength,
    className: 'border rounded px-3 py-2 text-sm w-full'
  }

  const inputProps = {
    ...commonProps,
    type,
    inputMode,
  }

  const textareaProps = {
    ...commonProps,
    rows,
  }

  return (
    <>
      {label && (
        <label className="text-sm text-gray-700 font-medium">{label}</label>
      )}
      {isTextarea ? (
        <textarea {...textareaProps} />
      ) : (
        <input {...inputProps} />
      )}
    </>
  )
}

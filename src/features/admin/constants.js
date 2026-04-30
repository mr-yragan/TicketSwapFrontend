export const EMPTY_ORGANIZER_FORM = {
  name: '',
  contactEmail: '',
  organizerCode: '',
  integrationSecret: '',
  verificationMode: 'MANUAL',
}

export const VERIFICATION_MODES = [
  {
    value: 'MANUAL',
    label: 'Проверка вручную',
    description: 'Команда организатора сама проверяет билеты, ведёт события и отправляет новый PDF после покупки.',
  },
  {
    value: 'EXTERNAL_API',
    label: 'Автоматическая проверка',
    description: 'Билеты проверяются автоматически через подключённую систему партнёра.',
  },
]

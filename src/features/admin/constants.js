export const EMPTY_ORGANIZER_FORM = {
  name: '',
  contactEmail: '',
  apiKey: '',
  verificationMode: 'MANUAL',
}

export const VERIFICATION_MODES = [
  {
    value: 'MANUAL',
    label: 'Ручная проверка',
    description: 'Организатор сам проверяет билеты, ведет события и перевыпускает PDF после покупки.',
  },
  {
    value: 'EXTERNAL_API',
    label: 'Внешний API',
    description: 'Билеты проходят автоматическую проверку через интеграцию партнера.',
  },
]

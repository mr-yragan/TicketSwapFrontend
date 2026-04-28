import { useState } from 'react'
import { Button, FormField } from '@/components/ui'
import { Shield } from 'lucide-react'
import Switch from '@/components/ui/switch'

export function ProfileSecuritySection({
  onToggleTwoFactor,
  twoFactorEnabled,
  twoFactorLoading,
  twoFactorSupported,
}) {
  const [password, setPassword] = useState('')

  const handleToggle = (nextValue) => {
    onToggleTwoFactor(nextValue, password)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield size={18} />
            <h3 className="text-lg font-semibold">Безопасность</h3>
          </div>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Для изменения 2FA нужен текущий пароль. После успешного переключения бэкенд завершит текущую сессию,
            и нужно будет войти заново.
          </p>
        </div>
      </div>

      <div className="mt-6 border rounded-xl p-4 bg-gray-50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-medium text-gray-900">Двухэтапная аутентификация</div>
            <div className="text-sm text-gray-600 mt-1">При входе будет запрашиваться код подтверждения.</div>
            <div className="text-xs text-gray-500 mt-2">
              Текущий статус: {twoFactorSupported ? (twoFactorEnabled ? 'включена' : 'выключена') : 'настройка недоступна'}
            </div>
          </div>

          <Switch
            checked={twoFactorEnabled}
            onChange={handleToggle}
            disabled={twoFactorLoading || !twoFactorSupported}
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <FormField
            label="Текущий пароль"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите текущий пароль"
            helperText="Подтверждает, что настройку меняете именно вы."
            minLength={8}
            maxLength={72}
          />

          <Button
            type="button"
            onClick={() => handleToggle(!twoFactorEnabled)}
            disabled={twoFactorLoading || !twoFactorSupported}
            className="bg-black text-white">
            {twoFactorLoading
              ? 'Сохранение...'
              : (twoFactorSupported ? (twoFactorEnabled ? 'Отключить 2FA' : 'Включить 2FA') : 'Недоступно')}
          </Button>
        </div>
      </div>
    </div>
  )
}

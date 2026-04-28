import { Button } from '@/components/ui'

export function ProfileFormSection({ profileForm, setProfileForm, onSaveProfile, profileSaving }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold">Данные профиля</h3>
      <p className="text-sm text-gray-600 mt-2">Обновите логин для входа в аккаунт.</p>

      <form className="mt-5 grid gap-4" onSubmit={onSaveProfile}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
          <input
            type="text"
            value={profileForm.login}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, login: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Например, my_login"
            minLength={3}
            maxLength={32}
          />
        </div>

        <div>
          <Button
            type="submit"
            disabled={profileSaving}
            className="bg-black text-white">
            {profileSaving ? 'Сохранение...' : 'Сохранить профиль'}
          </Button>
        </div>
      </form>
    </div>
  )
}

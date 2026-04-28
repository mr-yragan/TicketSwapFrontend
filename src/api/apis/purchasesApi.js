import { getData } from '../request'

export const purchasesApi = {
  /**
   * Получить покупки пользователя
   * @param {string} [scope='active'] - 'active' или другое значение
   * @returns {Promise<Object[]>}
   */
  async getMyPurchases(scope = 'active') {
    return await getData('/me/purchases', { params: { scope } })
  },

  /**
   * Получить холды (зарезервированные билеты)
   * @returns {Promise<Object[]>}
   */
  async getMyHolds() {
    return await getData('/me/holds')
  },

  /**
   * Получить журнал заказов пользователя
   * @returns {Promise<Object[]>}
   */
  async getMyOrders() {
    return await getData('/me/orders')
  },
}

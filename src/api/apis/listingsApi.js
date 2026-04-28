import { getData } from '../request'

export const listingsApi = {
  async getMyListings(scope = 'active') {
    return await getData('/me/listings', { params: { scope } })
  },
}

import * as hlp from '../src/services/helperfunctions'

describe('Helper functions', () => {
  describe('sortGroups', () =>  {
    it('sorts groups first by decreasing season, then by increasing groupnames ', () => {
      const g1 = {
        season: 1,
        groupname: 'a'
      }
      const g2 = {
        season: 2,
        groupname: 'a'
      }
      const g3 = {
        season: 1,
        groupname: 'b'
      }
      const g4 = {
        season: 2,
        groupname: 'b'
      }
      expect(hlp.sortGroups(g1, g2)).toBe(1)   // positive means that they will be reversed by Array.sort
      expect(hlp.sortGroups(g1, g3)).toBe(-1)  // negative means that they will NOT be reversed by Array.sort
      expect(hlp.sortGroups(g1, g4)).toBe(1)
      expect(hlp.sortGroups(g2, g3)).toBe(-1)
      expect(hlp.sortGroups(g2, g4)).toBe(-1)
      expect(hlp.sortGroups(g3, g4)).toBe(1)
    })
  })

  describe('getPlayerIds', () => {
    it('returns an array of user IDs, if an array of valid usernames is given', async () => {
      const result = await hlp.getPlayerIds([ 'oldehippy', 'Uforobban', 'PiT' ])
      expect(result).toEqual([ 1070, 33328, 32684 ])
    })
    it('skips invalid usernames and returns a shorter array of user IDs', async () => {
      const result = await hlp.getPlayerIds([ 'oldehippy', 'Uforobban', 'nonexistinguser' ])
      expect(result).toEqual([ 1070, 33328 ])
    })
  })

  describe('missingPlayersFrom', () => {
    it('filters the usernames which are not present in the DB', async () => {
      const result = await hlp.missingPlayersFrom([ 'oldehippy', 'Uforobban', 'missing1', 'missing2' ])
      expect(result).toEqual([ 'missing1', 'missing2' ])
    })
  })

  describe('isAdministrator', () => {
    it('returns true if the given username is an administrator', async () => {
      const result = await hlp.isAdministrator('oldehippy')
      expect(result).toBeTruthy()
    })

    it('returns false if the given username is not an administrator', async () => {
      const result = await hlp.isAdministrator('PiT')
      expect(result).toBeFalsy()
    })

    it('returns undefined if the given username is invalid', async () => {
      const result = await hlp.isAdministrator('nonexistinguser')
      expect(result).toBeUndefined()
    })
  })
})
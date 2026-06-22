import { describe, it, expect, beforeEach } from 'vitest'
import { DEFAULT_CHURCH_PROFILE, churchProfileDb } from '@/db'
import { DEFAULT_TERMS } from './useChurchProfile'

// Clear DB between tests
beforeEach(async () => {
  await churchProfileDb.delete()
})

describe('churchProfileDb', () => {
  it('retorna perfil padrão quando não há dados', async () => {
    const profile = await churchProfileDb.get()
    expect(profile.configMode).toBe('basic')
    expect(profile.enabledDenominationalModules).toHaveLength(0)
    expect(profile.approvedActivities).toHaveLength(0)
    expect(profile.customTerms).toEqual({})
  })

  it('salva e recupera perfil', async () => {
    const profile = {
      ...DEFAULT_CHURCH_PROFILE,
      ministryName: 'Ministério Infantil',
      churchName: 'Igreja Teste',
      configMode: 'custom' as const,
    }
    await churchProfileDb.save(profile)
    const loaded = await churchProfileDb.get()
    expect(loaded.ministryName).toBe('Ministério Infantil')
    expect(loaded.churchName).toBe('Igreja Teste')
    expect(loaded.configMode).toBe('custom')
  })

  it('approveActivity adiciona id à lista', async () => {
    await churchProfileDb.approveActivity('hb-001')
    const profile = await churchProfileDb.get()
    expect(profile.approvedActivities).toContain('hb-001')
  })

  it('approveActivity não duplica id', async () => {
    await churchProfileDb.approveActivity('hb-001')
    await churchProfileDb.approveActivity('hb-001')
    const profile = await churchProfileDb.get()
    expect(profile.approvedActivities.filter((id) => id === 'hb-001')).toHaveLength(1)
  })

  it('revokeActivity remove id da lista', async () => {
    await churchProfileDb.approveActivity('hb-001')
    await churchProfileDb.revokeActivity('hb-001')
    const profile = await churchProfileDb.get()
    expect(profile.approvedActivities).not.toContain('hb-001')
  })

  it('isApproved retorna false para id não aprovado', async () => {
    expect(await churchProfileDb.isApproved('hb-999')).toBe(false)
  })

  it('isApproved retorna true após aprovação', async () => {
    await churchProfileDb.approveActivity('hb-001')
    expect(await churchProfileDb.isApproved('hb-001')).toBe(true)
  })

  it('delete apaga o perfil e retorna padrão', async () => {
    await churchProfileDb.save({ ...DEFAULT_CHURCH_PROFILE, ministryName: 'Teste' })
    await churchProfileDb.delete()
    const profile = await churchProfileDb.get()
    expect(profile.ministryName).toBe('')
  })

  it('export retorna o perfil salvo', async () => {
    const saved = { ...DEFAULT_CHURCH_PROFILE, churchName: 'Export Test' }
    await churchProfileDb.save(saved)
    const exported = await churchProfileDb.export()
    expect(exported.churchName).toBe('Export Test')
  })

  it('import substitui o perfil existente', async () => {
    await churchProfileDb.save({ ...DEFAULT_CHURCH_PROFILE, churchName: 'Antigo' })
    await churchProfileDb.import({ ...DEFAULT_CHURCH_PROFILE, churchName: 'Novo' })
    const profile = await churchProfileDb.get()
    expect(profile.churchName).toBe('Novo')
  })
})

describe('DEFAULT_TERMS', () => {
  it('contém termos padrão esperados', () => {
    expect(DEFAULT_TERMS['escola-dominical']).toBe('Escola dominical')
    expect(DEFAULT_TERMS['culto']).toBe('Culto')
    expect(DEFAULT_TERMS['pastor']).toBe('Pastor')
    expect(DEFAULT_TERMS['ministerio-infantil']).toBe('Ministério infantil')
  })
})

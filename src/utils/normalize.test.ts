import { describe, it, expect } from 'vitest'
import { normalize, matchesSearch } from './normalize'

describe('normalize', () => {
  it('remove acentos', () => {
    expect(normalize('Ação')).toBe('acao')
    expect(normalize('José')).toBe('jose')
    expect(normalize('Criação')).toBe('criacao')
    expect(normalize('Oração')).toBe('oracao')
  })

  it('converte para minúsculo', () => {
    expect(normalize('DAVI')).toBe('davi')
    expect(normalize('Jesus')).toBe('jesus')
  })

  it('remove espaços extras nas pontas', () => {
    expect(normalize('  paz  ')).toBe('paz')
  })

  it('preserva espaços internos', () => {
    expect(normalize('filho pródigo')).toBe('filho prodigo')
  })
})

describe('matchesSearch', () => {
  it('retorna true para query vazia', () => {
    expect(matchesSearch('qualquer texto', '')).toBe(true)
  })

  it('encontra com acentos diferentes', () => {
    expect(matchesSearch('Oração e fé', 'oracao')).toBe(true)
    expect(matchesSearch('Histórias da Bíblia', 'historias')).toBe(true)
  })

  it('é case-insensitive', () => {
    expect(matchesSearch('DAVI e Golias', 'davi')).toBe(true)
    expect(matchesSearch('davi', 'DAVI')).toBe(true)
  })

  it('retorna false quando não encontra', () => {
    expect(matchesSearch('Noé e a arca', 'moisés')).toBe(false)
  })

  it('busca substring', () => {
    expect(matchesSearch('A tempestade acalmada', 'tempest')).toBe(true)
  })
})

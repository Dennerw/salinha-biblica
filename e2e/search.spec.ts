import { test, expect } from '@playwright/test'

test.describe('Busca de dinâmicas', () => {
  test('abre a home e navega para explorar', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Salinha Bíblica')).toBeVisible()
    await expect(page.getByText('40 dinâmicas')).toBeVisible()

    await page.getByRole('link', { name: /Explorar/i }).click()
    await expect(page.getByText(/de 40 dinâmicas/)).toBeVisible()
  })

  test('busca por texto filtra resultados', async ({ page }) => {
    await page.goto('/explorar')

    const searchInput = page.getByPlaceholder('Buscar dinâmicas...')
    await searchInput.fill('davi')

    await expect(page.getByText('Davi e Golias')).toBeVisible()
    await expect(page.getByText(/de 40 dinâmicas/)).not.toBeVisible()
  })

  test('limpar busca restaura todos os resultados', async ({ page }) => {
    await page.goto('/explorar')

    const searchInput = page.getByPlaceholder('Buscar dinâmicas...')
    await searchInput.fill('davi')
    await page.getByLabel('Limpar busca').click()

    await expect(page.getByText(/40 dinâmicas/)).toBeVisible()
  })

  test('abre detalhe de uma dinâmica', async ({ page }) => {
    await page.goto('/explorar')

    await page.getByText('Davi e Golias').click()
    await expect(page.getByText('Referência Bíblica')).toBeVisible()
    await expect(page.getByText('Passo a passo')).toBeVisible()
  })
})

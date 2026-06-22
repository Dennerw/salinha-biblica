import { test, expect } from '@playwright/test'

test.describe('Filtros e favoritos', () => {
  test('filtro por faixa etária restringe resultados', async ({ page }) => {
    await page.goto('/explorar')

    // Abrir filtros
    await page.getByLabel('Filtros').click()
    await page.getByText('3–5 anos').click()

    // Deve mostrar menos que 40
    const subtitle = page.locator('text=/de 40 dinâmicas/')
    await expect(subtitle).not.toBeVisible()
  })

  test('limpar filtros restaura lista completa', async ({ page }) => {
    await page.goto('/explorar')

    await page.getByLabel('Filtros').click()
    await page.getByText('3–5 anos').click()
    await page.getByText('Limpar filtros').click()

    await expect(page.getByText(/40 de 40/)).toBeVisible()
  })

  test('favoritar uma dinâmica persiste ao recarregar', async ({ page }) => {
    await page.goto('/explorar')

    // Abre detalhe
    await page.getByText('Davi e Golias').click()
    await page.getByText('☆ Favoritar').click()
    await expect(page.getByText('★ Favoritada')).toBeVisible()

    // Recarrega
    await page.reload()
    await expect(page.getByText('★ Favoritada')).toBeVisible()

    // Limpa para não afetar outros testes
    await page.getByText('★ Favoritada').click()
  })
})

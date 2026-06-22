import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

test.describe('Exportar e importar backup', () => {
  test('exporta backup JSON válido', async ({ page }) => {
    await page.goto('/configuracoes')

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByText('Exportar backup').click(),
    ])

    const filePath = path.join('/tmp', download.suggestedFilename())
    await download.saveAs(filePath)

    const content = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(content)

    expect(parsed.version).toBe(1)
    expect(parsed.exportedAt).toBeTruthy()
    expect(Array.isArray(parsed.favorites)).toBe(true)
    expect(Array.isArray(parsed.completed)).toBe(true)
    expect(typeof parsed.notes).toBe('object')

    fs.unlinkSync(filePath)
  })

  test('salva nome do professor', async ({ page }) => {
    await page.goto('/configuracoes')

    await page.getByPlaceholder('Nome do professor(a)').fill('Ana Paula')
    await page.getByText('Salvar').click()

    await expect(page.getByText('✓ Salvo!')).toBeVisible()

    await page.reload()
    await expect(page.getByDisplayValue('Ana Paula')).toBeVisible()

    // Limpa
    await page.getByPlaceholder('Nome do professor(a)').fill('')
    await page.getByText('Salvar').click()
  })
})

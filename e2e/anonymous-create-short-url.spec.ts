import { test, expect } from '@playwright/test'

// E2E: un usuario ANÓNIMO genera una short URL de extremo a extremo.
// Valida el contrato de UI documentado en components/ToolCard.tsx:
//  - input con nombre accesible /url/i
//  - botón "Acortar"
//  - éxito: texto `http://localhost:3000/<8 chars base62>` + botón "Copy" + link "Visit"
//  - error: contenedor con role="alert"

test.describe('Generación anónima de short URL', () => {
  test('happy path: el usuario anónimo acorta una URL y ve la short URL con acciones', async ({
    page,
  }) => {
    await page.goto('/')

    const input = page.getByRole('textbox', { name: /url/i })
    await expect(input).toBeVisible()

    const uniqueUrl = `https://example.com/e2e-${Date.now()}`
    await input.fill(uniqueUrl)

    await page.getByRole('button', { name: /acortar/i }).click()

    // La short URL generada debe ser visible y matchear el formato esperado.
    const shortUrlLocator = page.getByText(/^http:\/\/localhost:3000\/[0-9a-zA-Z]{8}$/)
    await expect(shortUrlLocator).toBeVisible()

    // Acciones disponibles tras el éxito.
    await expect(page.getByRole('button', { name: /copy/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /visit/i })).toBeVisible()
  })

  test('error path: una URL con esquema no permitido muestra role="alert"', async ({ page }) => {
    await page.goto('/')

    const input = page.getByRole('textbox', { name: /url/i })
    await expect(input).toBeVisible()

    await input.fill(`ftp://example.com/file-${Date.now()}`)
    await page.getByRole('button', { name: /acortar/i }).click()

    // El route announcer de Next también usa role="alert" (es un <div> con
    // nombre vacío); el contenedor real del error es un <p role="alert">.
    const alert = page.locator('p[role="alert"]')
    await expect(alert).toBeVisible()
    await expect(alert).toHaveText(/.+/)
  })
})

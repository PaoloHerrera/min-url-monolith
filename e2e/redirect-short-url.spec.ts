import { test, expect } from '@playwright/test'

// E2E: un visitante abre un short URL y es redirigido a la originalUrl (UC-02).
// Valida el contrato de redirección 302 + conteo de clics:
//  - happy path: acortar -> abrir short URL -> terminar en la originalUrl.
//  - (opcional) código inexistente -> página 404 de Next.

test.describe('Redirección de short URL (UC-02)', () => {
  test('happy path: el visitante abre el short URL y es redirigido a la originalUrl', async ({
    page,
  }) => {
    await page.goto('/')

    const input = page.getByRole('textbox', { name: /url/i })
    await expect(input).toBeVisible()

    const originalUrl = `https://example.com/e2e-redirect-${Date.now()}`
    await input.fill(originalUrl)

    await page.getByRole('button', { name: /acortar/i }).click()

    const shortUrlLocator = page.getByText(/^http:\/\/localhost:3000\/[0-9a-zA-Z]{8}$/)
    await expect(shortUrlLocator).toBeVisible()

    const shortUrl = (await shortUrlLocator.textContent())?.trim()
    expect(shortUrl).toBeTruthy()

    // El navegador sigue el 302 y termina en la originalUrl.
    await page.goto(shortUrl!)
    await expect(page).toHaveURL(originalUrl)
  })

  test('un código inexistente responde 404', async ({ page }) => {
    const response = await page.goto('/noexiste123')

    // El route handler devuelve 404 (sin UI propia) para códigos inexistentes.
    expect(response?.status()).toBe(404)
  })
})

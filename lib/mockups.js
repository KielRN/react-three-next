'use server'

import fs from 'fs'
import path from 'path'
import { cache } from 'react'

const mockupsDirectory = path.join(process.cwd(), 'content/mock-ups')

/**
 * Get all mockup slugs (folder names inside content/mock-ups/)
 */
export const getMockupSlugs = cache(async () => {
  try {
    if (!fs.existsSync(mockupsDirectory)) return []
    const entries = fs.readdirSync(mockupsDirectory, { withFileTypes: true })
    return entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch (error) {
    console.error('Error getting mockup slugs:', error)
    return []
  }
})

/**
 * Get a single mockup by slug
 */
export const getMockupBySlug = cache(async (slug) => {
  try {
    const manifestPath = path.join(mockupsDirectory, slug, 'mockup.json')
    if (!fs.existsSync(manifestPath)) return null

    const raw = fs.readFileSync(manifestPath, 'utf8')
    const data = JSON.parse(raw)

    return {
      slug,
      ...data,
    }
  } catch (error) {
    console.error(`Error getting mockup ${slug}:`, error)
    return null
  }
})

/**
 * Get all mockups sorted by date (newest first)
 */
export const getAllMockups = cache(async () => {
  try {
    const slugs = await getMockupSlugs()
    const mockups = await Promise.all(slugs.map((s) => getMockupBySlug(s)))
    return mockups
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (error) {
    console.error('Error getting all mockups:', error)
    return []
  }
})

/**
 * Read a mockup image file and return its buffer + content type.
 * Used by the image-serving API route.
 */
export async function getMockupImage(slug, filePath) {
  try {
    const fullPath = path.join(mockupsDirectory, slug, filePath)
    // Security: prevent path traversal
    const resolved = path.resolve(fullPath)
    if (!resolved.startsWith(path.resolve(mockupsDirectory))) {
      return null
    }
    if (!fs.existsSync(resolved)) return null

    const buffer = fs.readFileSync(resolved)
    const ext = path.extname(resolved).toLowerCase()
    const mimeMap = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    }
    const contentType = mimeMap[ext] || 'application/octet-stream'

    return { buffer, contentType }
  } catch (error) {
    console.error(`Error reading mockup image ${slug}/${filePath}:`, error)
    return null
  }
}

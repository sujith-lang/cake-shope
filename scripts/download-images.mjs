import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

const cakeImages = {
  'chocolate-cake.jpg': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
  'chocolate-truffle.jpg': 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&auto=format&fit=crop',
  'black-forest.jpg': 'https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=800&auto=format&fit=crop',
  'red-velvet.jpg': 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?q=80&w=800&auto=format&fit=crop',
  'white-forest.jpg': 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800&auto=format&fit=crop',
  'vanilla.jpg': 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?q=80&w=800&auto=format&fit=crop',
  'strawberry.jpg': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
  'butterscotch.jpg': 'https://images.unsplash.com/photo-1562772186-368945465d63?q=80&w=800&auto=format&fit=crop',
  'cheesecake.jpg': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop',
  'birthday-cake.jpg': 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?q=80&w=800&auto=format&fit=crop',
  'wedding-cake.jpg': 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=800&auto=format&fit=crop',
  'anniversary-cake.jpg': 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?q=80&w=800&auto=format&fit=crop',
  'photo-cake.jpg': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=800&auto=format&fit=crop',
  'cupcakes.jpg': 'https://images.unsplash.com/photo-1587668178277-295251f900ce?q=80&w=800&auto=format&fit=crop',
  'custom-cake.jpg': 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=800&auto=format&fit=crop'
}

const catImages = {
  'chocolate.jpg': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop',
  'fruit.jpg': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=600&auto=format&fit=crop',
  'cheesecake.jpg': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop',
  'celebration.jpg': 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?q=80&w=600&auto=format&fit=crop',
  'cupcakes.jpg': 'https://images.unsplash.com/photo-1587668178277-295251f900ce?q=80&w=600&auto=format&fit=crop'
}

const heroUrl = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1600&auto=format&fit=crop'

async function download(url, dest) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, buffer)
    console.log(`Saved: ${dest}`)
  } catch (err) {
    console.error(`Failed to download ${url}:`, err.message)
  }
}

async function main() {
  for (const [filename, url] of Object.entries(cakeImages)) {
    await download(url, path.join(rootDir, 'public', 'images', 'cakes', filename))
  }
  for (const [filename, url] of Object.entries(catImages)) {
    await download(url, path.join(rootDir, 'public', 'images', 'categories', filename))
  }
  await download(heroUrl, path.join(rootDir, 'public', 'images', 'hero', 'hero-cake.jpg'))
  console.log('All images downloaded successfully!')
}

main()

// `nuxt generate` çıktısını (.output/public) depoda tutulan deploy/ klasörüne kopyalar; cPanel Git bunu public_html'e alır.
import { cpSync, existsSync, rmSync } from 'node:fs'

const src = '.output/public'
if (!existsSync(`${src}/index.html`)) throw new Error('Önce `nuxt generate` çalışmalı: .output/public/index.html yok.')
rmSync('deploy', { recursive: true, force: true })
cpSync(src, 'deploy', { recursive: true })
console.log('deploy/ güncellendi.')

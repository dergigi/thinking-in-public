import './style.css'
import { loadRiver } from './feed/loadRiver.ts'
import { render } from './ui/render.ts'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('Missing #app')
}

render(app, { status: 'loading' })
const state = await loadRiver()
render(app, state)

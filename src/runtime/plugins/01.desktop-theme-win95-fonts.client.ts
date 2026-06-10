import msSansSerif from '../assets/fonts/ms-sans-serif/MS Sans Serif.ttf?url'
import msSansSerifBold from '../assets/fonts/ms-sans-serif-bold/MS Sans Serif Bold.ttf?url'

const STYLE_ID = 'desktop-theme-win95-fonts'

const css = `
@font-face {
  font-family: 'ms-sans-serif';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src:
    local('MS Sans Serif'),
    local('Microsoft Sans Serif'),
    url('${msSansSerif}') format('truetype');
}

@font-face {
  font-family: 'ms-sans-serif';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src:
    local('MS Sans Serif Bold'),
    local('Microsoft Sans Serif Bold'),
    url('${msSansSerifBold}') format('truetype');
}
`

export default defineNuxtPlugin({
  name: 'desktop-theme-win95-fonts',
  setup() {
    if (import.meta.server) return

    if (document.getElementById(STYLE_ID)) return

    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = css
    document.head.prepend(style)
  },
})

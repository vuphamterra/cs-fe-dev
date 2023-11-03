import { createGlobalStyle } from 'styled-components';

export const TEXT_COLOR_0_7_WHITE = 'hsla(0,0%,100%,0.7)';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: Manrope;
    src: url(/src/assets/images/fonts/Manrope-Regular.woff2) format("woff2");
    font-display: swap;
  }
  body {
    margin: 0;
    padding-top: 90px;
    padding-bottom: 20px;
    width: 100%;
    height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: white;
  }
  html {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 100%;
  }
  *,
  *::before,
  *::after {
    -webkit-box-sizing: inherit;
    box-sizing: inherit;
  }
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }
`;

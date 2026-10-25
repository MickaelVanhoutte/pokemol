import { render } from 'preact';
import '@fontsource/inter/400.css';
import '@fontsource/inter/400-italic.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import './styles/global.css';
import { App } from './app';
import './story/scripts';

render(<App />, document.getElementById('app')!);

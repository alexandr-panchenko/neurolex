import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import type { Bootstrap } from './ui/api';
import './ui/theme.css';
const embedded=document.getElementById('bootstrap')?.textContent;
const initial=embedded?JSON.parse(embedded) as Bootstrap:undefined;
createRoot(document.getElementById('root')!).render(initial?<App initial={initial}/>:<App/>);

import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../',import.meta.url));
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.dic':'text/plain; charset=utf-8','.aff':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server = createServer(async (request,response) => {
  try {
    if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405);response.end();return; }
    let path = decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    // También permite comprobar las rutas relativas de GitHub Pages.
    if (path.startsWith('/Click300/')) path = path.slice('/Click300'.length);
    if (path.endsWith('/')) path += 'index.html';
    const file = resolve(root, `.${path}`);
    if (!file.startsWith(root) || file.includes(`${sep}node_modules${sep}`) || file.includes(`${sep}.git${sep}`)) { response.writeHead(403);response.end();return; }
    if (!(await stat(file)).isFile()) throw new Error('No es un archivo');
    const data = await readFile(file);
    response.writeHead(200,{'Content-Type':mime[extname(file)] ?? 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});response.end('Archivo no encontrado'); }
});
server.on('error',error => {console.error(error.code === 'EADDRINUSE' ? `El puerto ${port} está ocupado. Usá npm start -- --port 4174.` : error.message);process.exit(1);});
server.listen(port,'127.0.0.1',() => console.log(`Click300: http://localhost:${port} (también http://localhost:${port}/Click300/)`));

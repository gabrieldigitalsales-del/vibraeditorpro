# Vibra Assinatura Pro

Editor React + Vite para assinatura de email baseada na imagem aprovada.

## Rodar local

```bash
npm install
npm run dev
```

Abra: http://127.0.0.1:5173

## Build para Vercel

```bash
npm run build
```

Na Vercel, use:
- Framework: Vite
- Build Command: npm run build
- Output Directory: dist

## Exportações

- PNG em alta nitidez
- JPG em alta nitidez
- HTML clicável
- SVG clicável

A exportação usa a imagem base embutida em base64, evitando erro de canvas/tainted canvas.

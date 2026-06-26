# Vibra Signature Manager + Supabase

App web em **React + Vite + Supabase** para gerar, salvar e instalar assinaturas de e-mail da Vibra de forma simples.

## Implementos principais

- Edição dos dados da assinatura
- Prévia fiel ao layout aprovado
- Exportação **JPG padrão de e-mail** (700 x 391 px)
- Compressão automática para **até 40 KB**
- Upload automático ao **Supabase Storage**
- Salvamento automático no **Supabase Database**
- Geração de **HTML pronto para Gmail/Outlook** com URL pública da imagem
- Botões para **copiar HTML**, **baixar HTML** e **copiar URL da imagem**
- Listagem de assinaturas já salvas
- Carregar/excluir assinaturas salvas
- Responsivo para desktop e mobile

## Instalação

```bash
npm install
npm run dev
```

## Variáveis de ambiente

Crie um `.env` baseado no `.env.example`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
```

## SQL do Supabase

Rode o arquivo `supabase_schema.sql` no SQL Editor do Supabase.

## Deploy na Vercel

- Framework: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Configure também `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## Fluxo do cliente final

1. Preenche os dados
2. Clica em **Gerar + enviar ao Supabase**
3. O sistema gera o JPG leve, sobe a imagem e salva os dados
4. O HTML seguro é montado automaticamente
5. O cliente clica em **Copiar HTML da assinatura**
6. Cola no Gmail/Outlook

## Observação importante

Para máxima compatibilidade com Gmail e Outlook, o HTML final usa:

- **imagem JPG pública** hospedada no Supabase Storage
- **links reais abaixo da imagem** para e-mail, telefone e site

Esse formato é muito mais estável que base64, blob, SVG puro ou image maps em clientes de e-mail.

## Ajuste de links exatos na imagem

Nesta versão, o HTML exportado usa `usemap` / `area` para posicionar os links exatamente sobre as áreas visuais da assinatura:

- nome
- cargo
- e-mail
- site
- telefone
- endereço
- bloco da marca/slogan

A imagem continua hospedada no Supabase Storage e o HTML usa a URL pública. As coordenadas são recalculadas automaticamente conforme a largura/altura final do JPG gerado.

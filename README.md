# Wax Cloud

Sistema de Inventário para Loja de Discos com Reconhecimento de Imagem

---

## ✨ Sobre o Projeto

O **Wax Cloud** é um sistema web para cadastro e gerenciamento de discos de vinil, CDs e outros itens de acervo musical. Ele permite:
- Cadastro de produtos com foto da capa
- Preenchimento automático de artista, álbum e ano usando Google Cloud Vision (OCR)
- Interface moderna, responsiva e personalizável
- Busca e visualização de inventário

Ideal para colecionadores, lojas de discos ou feiras de vinil!

---

## 🚀 Tecnologias Utilizadas
- [Next.js](https://nextjs.org/) (React + SSR)
- [Tailwind CSS](https://tailwindcss.com/) (estilização)
- [Google Cloud Vision API](https://cloud.google.com/vision) (OCR)
- [TypeScript](https://www.typescriptlang.org/) (opcional, recomendado)

---

## ⚙️ Pré-requisitos
- Node.js (recomendado: 18+)
- npm ou yarn
- Conta no [Google Cloud](https://console.cloud.google.com/) para usar a Vision API
- (Opcional) Conta no [GitHub](https://github.com/) para versionamento

---

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```sh
git clone https://github.com/seu-usuario/wax-cloud.git
cd wax-cloud
```

### 2. Instale as dependências
```sh
npm install
# ou
yarn install
```

### 3. Configure as credenciais do Google Cloud
- No Google Cloud Console, crie um projeto e ative a Vision API
- Gere uma chave de serviço (service account) e baixe o arquivo JSON
- Coloque o arquivo em um local seguro (ex: `C:/waxcloud-creds/google-credentials.json`)
- No arquivo `app/api/analyze-image/route.ts`, confira se o caminho está correto

### 4. Configure o Tailwind para sua paleta de cores
- As cores já estão no `tailwind.config.js`, mas você pode personalizar à vontade!

### 5. Rode o projeto localmente
```sh
npm run dev
# ou
yarn dev
```
- Acesse [http://localhost:3000](http://localhost:3000)

---

## 🖼️ Como Usar
1. Clique em **Cadastro de Produtos**
2. Adicione uma foto da capa do disco
3. O sistema tentará preencher artista, álbum e ano automaticamente
4. Complete os demais campos e clique em **Salvar Produto**
5. Veja seu inventário na aba **Inventário**

---

## 🎨 Personalização
- Altere as cores no `tailwind.config.js`
- Edite os componentes em `components/DiscoInventorySystem.tsx` para mudar layout, campos, etc
- Adicione novas funcionalidades conforme sua necessidade!

---

## ☁️ Deploy
Você pode hospedar o Wax Cloud em:
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Render](https://render.com/)
- Ou seu próprio servidor VPS

**Dica:** Lembre-se de configurar as variáveis de ambiente e credenciais no ambiente de produção!

---

## 🐞 Dicas de Troubleshooting
- **Erro de credencial do Google:** Verifique o caminho do arquivo JSON e as permissões
- **Cores não aparecem:** Confirme se o Tailwind está configurado e reinicie o servidor
- **Problemas com upload:** Veja se a pasta de uploads tem permissão de escrita
- **API Vision não preenche campos:** A imagem precisa ter texto legível na capa

---

## 📚 Aprenda Mais
- [Documentação do Next.js](https://nextjs.org/docs)
- [Guia de Tailwind CSS](https://tailwindcss.com/docs/installation)
- [Google Cloud Vision API Docs](https://cloud.google.com/vision/docs)
- [Guia de Git e GitHub para iniciantes](https://rogerdudler.github.io/git-guide/index.pt_BR.html)

---

## 💡 Dicas para Devs Iniciantes
- Sempre leia os logs do terminal e do navegador para entender erros
- Use o comando `npm run dev` para desenvolvimento e veja as mudanças em tempo real
- Experimente mudar as cores, textos e campos para aprender mais sobre React e Tailwind
- Não tenha medo de errar: versionamento com Git permite voltar atrás!

---

## ✉️ Suporte
Se tiver dúvidas, abra uma issue no GitHub ou procure por tutoriais das tecnologias usadas. Boa sorte e bons estudos! 
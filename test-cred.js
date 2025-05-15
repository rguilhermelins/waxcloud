const fs = require('fs');
const path = 'C:\\Users\\theri\\OneDrive\\Área de Trabalho\\WaxCloud\\google-credentials.json';

if (fs.existsSync(path)) {
  console.log('Arquivo encontrado!');
  const content = fs.readFileSync(path, 'utf8');
  console.log('Conteúdo:', content.slice(0, 100) + '...');
} else {
  console.log('Arquivo NÃO encontrado!');
}
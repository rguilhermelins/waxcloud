'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';

interface Disco {
  id: number;
  titulo: string;
  artista: string;
  ano: number;
  genero: string;
  imagemUrl: string;
}

interface FormData {
  titulo: string;
  artista: string;
  ano: string;
  genero: string;
  imagem: File | null;
}

const initialFormData: FormData = {
  titulo: '',
  artista: '',
  ano: '',
  genero: '',
  imagem: null
};

export default function DiscoInventorySystem() {
  const [discos, setDiscos] = useState<Disco[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analisandoImagem, setAnalisandoImagem] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    let imagemUrl = '';
    if (formData.imagem) {
      imagemUrl = URL.createObjectURL(formData.imagem);
    }

    const novoDisco: Disco = {
      id: Date.now(),
      titulo: formData.titulo,
      artista: formData.artista,
      ano: parseInt(formData.ano),
      genero: formData.genero,
      imagemUrl
    };

    setDiscos([...discos, novoDisco]);
    setFormData(initialFormData);
    setPreviewUrl('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImagemChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, imagem: file }));
    setPreviewUrl(URL.createObjectURL(file));
    setAnalisandoImagem(true);

    try {
      // Converter a imagem para blob
      const blob = new Blob([file], { type: file.type });
      
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: blob,
        headers: {
          'Content-Type': file.type,
        },
      });

      const data = await response.json();
      console.log('Resposta completa da API:', data); // Debug

      if (data.success && data.result) {
        const { artist, album, year, labels } = data.result;
        console.log('Dados detectados:', { artist, album, year, labels }); // Debug

        // Preencher os campos com os dados detectados
        setFormData(prev => {
          const newFormData = {
            ...prev,
            artista: artist || '',
            titulo: album || '',
            ano: year || '',
            genero: prev.genero // Mantém o gênero atual se existir
          };

          console.log('Novo estado do formulário:', newFormData); // Debug
          return newFormData;
        });

        // Se encontramos labels relacionadas a gêneros musicais, tentar definir o gênero
        if (labels && labels.length > 0) {
          const genreMap: { [key: string]: string } = {
            'rock': 'Rock',
            'pop': 'Pop',
            'jazz': 'Jazz',
            'blues': 'Blues',
            'classical': 'Clássica',
            'mpb': 'MPB',
            'samba': 'Samba',
            'electronic': 'Eletrônica',
            'hip hop': 'Hip Hop'
          };

          const detectedGenre = labels.find((label: string) => 
            Object.keys(genreMap).some(genre => 
              label.toLowerCase().includes(genre)
            )
          );

          if (detectedGenre) {
            const mappedGenre = Object.entries(genreMap).find(([key]) => 
              detectedGenre.toLowerCase().includes(key)
            );

            if (mappedGenre) {
              setFormData(prev => ({
                ...prev,
                genero: mappedGenre[1]
              }));
            }
          }
        }

        // Mostrar feedback ao usuário
        alert('Informações detectadas com sucesso! Por favor, verifique e ajuste se necessário.');
      } else {
        console.error('Erro na análise:', data.error);
        alert('Não foi possível extrair informações da imagem: ' + (data.details || data.error));
      }
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      alert('Erro ao processar a imagem. Por favor, tente novamente.');
    } finally {
      setAnalisandoImagem(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sistema de Inventário de Discos</h1>
      
      <div className="grid gap-4">
        {/* Formulário para adicionar novo disco */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Adicionar Novo Disco</h2>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label htmlFor="imagem" className="block text-sm font-medium text-gray-700 mb-1">
                Imagem do Disco
              </label>
              <div className="flex flex-col items-center gap-2">
                {previewUrl && (
                  <div className="relative w-32 h-32 mb-2">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <label className="w-full">
                  <div className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 cursor-pointer text-center">
                    {analisandoImagem ? 'Analisando imagem...' : (previewUrl ? 'Trocar Imagem' : 'Carregar Imagem')}
                  </div>
                  <input
                    type="file"
                    id="imagem"
                    name="imagem"
                    accept="image/*"
                    onChange={handleImagemChange}
                    className="hidden"
                    disabled={analisandoImagem}
                  />
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={analisandoImagem ? 'Analisando imagem...' : 'Digite o título do disco'}
              />
            </div>

            <div>
              <label htmlFor="artista" className="block text-sm font-medium text-gray-700 mb-1">
                Artista
              </label>
              <input
                type="text"
                id="artista"
                name="artista"
                value={formData.artista}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={analisandoImagem ? 'Analisando imagem...' : 'Digite o nome do artista'}
              />
            </div>

            <div>
              <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <input
                type="number"
                id="ano"
                name="ano"
                value={formData.ano}
                onChange={handleChange}
                required
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={analisandoImagem ? 'Analisando imagem...' : 'Digite o ano'}
              />
            </div>

            <div>
              <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-1">
                Gênero
              </label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um gênero</option>
                <option value="Rock">Rock</option>
                <option value="Pop">Pop</option>
                <option value="Jazz">Jazz</option>
                <option value="Blues">Blues</option>
                <option value="Clássica">Clássica</option>
                <option value="MPB">MPB</option>
                <option value="Samba">Samba</option>
                <option value="Eletrônica">Eletrônica</option>
                <option value="Hip Hop">Hip Hop</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              disabled={analisandoImagem}
            >
              {analisandoImagem ? 'Analisando imagem...' : 'Adicionar Disco'}
            </button>
          </form>
        </div>

        {/* Lista de discos */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Lista de Discos</h2>
          {discos.length === 0 ? (
            <p className="text-gray-500">Nenhum disco cadastrado ainda.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {discos.map(disco => (
                <div key={disco.id} className="border p-4 rounded-lg">
                  {disco.imagemUrl && (
                    <div className="relative w-full h-48 mb-3">
                      <Image
                        src={disco.imagemUrl}
                        alt={disco.titulo}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold">{disco.titulo}</h3>
                  <p className="text-gray-600">Artista: {disco.artista}</p>
                  <p className="text-gray-600">Ano: {disco.ano}</p>
                  <p className="text-gray-600">Gênero: {disco.genero}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useRef } from 'react';
import { Camera, Save, Search, PlusCircle, Trash2, List, BarChart2, Check } from 'lucide-react';

export default function DiscoInventorySystem() {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [isScanning, setIsScanning] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // Estado para formulário de cadastro
  const [formData, setFormData] = useState({
    artista: '',
    album: '',
    ano: '',
    valor: '',
    estadoCapa: 'M',
    estadoMidia: 'M',
    observacoes: '',
    foto: null
  });
  
  // Banco de dados de exemplo para reconhecimento visual
  const albumDatabase = [
    {
      id: 'pf-dark-side',
      coverMatch: 'dark-side-of-the-moon.jpg',
      artista: 'Pink Floyd',
      album: 'The Dark Side of the Moon',
      ano: '1973',
      valor: '120,00',
      genero: 'Rock Progressivo',
      gravadora: 'Harvest/EMI',
      pais: 'Reino Unido'
    },
    {
      id: 'beatles-abbey',
      coverMatch: 'abbey-road.jpg',
      artista: 'The Beatles',
      album: 'Abbey Road',
      ano: '1969',
      valor: '150,00',
      genero: 'Rock',
      gravadora: 'Apple Records',
      pais: 'Reino Unido'
    },
    {
      id: 'miles-kind',
      coverMatch: 'kind-of-blue.jpg',
      artista: 'Miles Davis',
      album: 'Kind of Blue',
      ano: '1959',
      valor: '180,00',
      genero: 'Jazz',
      gravadora: 'Columbia',
      pais: 'EUA'
    }
  ];
  const estadoOptions = [
    { value: 'M', label: 'Mint (M) - Perfeito' },
    { value: 'NM', label: 'Near Mint (NM) - Quase perfeito' },
    { value: 'VG+', label: 'Very Good Plus (VG+) - Muito bom+' },
    { value: 'VG', label: 'Very Good (VG) - Muito bom' },
    { value: 'G+', label: 'Good Plus (G+) - Bom+' },
    { value: 'G', label: 'Good (G) - Bom' },
    { value: 'F', label: 'Fair (F) - Regular' },
    { value: 'P', label: 'Poor (P) - Ruim' }
  ];
  
  // Simulação de alguns produtos já cadastrados
  const mockInventory = [
    { id: 1, artista: 'Pink Floyd', album: 'The Dark Side of the Moon', ano: '1973', valor: '120,00', estadoCapa: 'VG+', estadoMidia: 'VG' },
    { id: 2, artista: 'The Beatles', album: 'Abbey Road', ano: '1969', valor: '150,00', estadoCapa: 'NM', estadoMidia: 'VG+' },
    { id: 3, artista: 'David Bowie', album: 'The Rise and Fall of Ziggy Stardust', ano: '1972', valor: '200,00', estadoCapa: 'G+', estadoMidia: 'VG' }
  ];
  
  // Handler para alterações no formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Função para analisar a imagem
  const analyzeImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setFormData(prev => ({
        ...prev,
        artista: data.result.artist || data.result.artista || '',
        album: data.result.album || '',
        ano: data.result.year || data.result.ano || ''
      }));

      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);

    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      alert('Não foi possível reconhecer as informações da imagem. Por favor, preencha manualmente.');
    }
  };

  // Função para fazer upload da imagem
  const handleFileUpload = async (file: File) => {
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload do arquivo
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      setFormData(prev => ({
        ...prev,
        foto: uploadResult.filename
      }));

      // Analisa a imagem para extrair informações
      await analyzeImage(file);

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsScanning(false);
    }
  };

  // Referência para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler para o clique no botão de upload
  const handleUploadClick = (source: 'file' | 'camera') => {
    if (source === 'file' && fileInputRef.current) {
      fileInputRef.current.click();
    }
    setShowPhotoOptions(false);
  };

  // Handler para quando um arquivo é selecionado
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };
  
  // Estado para controlar visibilidade do popover de seleção de fonte da foto
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  
  // Layout da tela de cadastro
  const renderCadastroTab = () => {
    return (
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Card de upload */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center h-72 relative shadow-md border border-fifth">
            {formData.foto ? (
              <img 
                src={formData.foto} 
                alt="Capa do disco" 
                className="max-h-60 rounded-xl object-contain shadow-lg border border-quaternary"
              />
            ) : (
              <div className="flex flex-col items-center">
                <Camera size={56} className="text-quaternary mb-4" />
                <p className="text-primary text-lg font-semibold text-center">Selecione uma fonte para adicionar foto</p>
                <p className="text-quaternary text-xs mt-2">Resolução recomendada: 600x600</p>
              </div>
            )}
            {isScanning && (
              <div className="absolute inset-0 bg-primary/80 rounded-xl flex items-center justify-center z-10">
                <div className="text-white text-center animate-pulse">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-3"></div>
                  <p className="font-bold">Analisando imagem...</p>
                  <p className="text-xs mt-1">Buscando informações do álbum</p>
                </div>
              </div>
            )}
          </div>
          <div className="relative mt-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => setShowPhotoOptions(!showPhotoOptions)}
              className="w-full bg-primary text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 shadow hover:bg-secondary transition-all font-semibold text-lg"
              disabled={isScanning}
            >
              <Camera size={20} />
              {isScanning ? 'Analisando...' : formData.foto ? 'Trocar foto' : 'Adicionar foto'}
            </button>
            {showPhotoOptions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-20 p-3 border border-fifth flex flex-col gap-2">
                <div 
                  className="p-2 hover:bg-fifth rounded-lg cursor-pointer flex items-center gap-2 transition-all"
                  onClick={() => handleUploadClick('file')}
                >
                  <Camera size={16} />
                  Carregar do computador
                </div>
                <div 
                  className="p-2 hover:bg-fifth rounded-lg cursor-pointer flex items-center gap-2 transition-all"
                  onClick={() => handleUploadClick('camera')}
                >
                  <Camera size={16} />
                  Usar câmera USB
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Formulário */}
        <div className="w-full md:w-2/3">
          {showNotification && (
            <div className="mb-4 bg-secondary/30 border-l-4 border-primary text-primary p-4 rounded-xl flex items-center justify-between shadow">
              <div className="flex items-center gap-2">
                <Check size={24} className="text-quaternary" />
                <span className="font-semibold">Artista e álbum identificados automaticamente!</span>
              </div>
              <button onClick={() => setShowNotification(false)} className="text-fifth hover:text-primary text-2xl font-bold">&times;</button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Artista</label>
              <input
                type="text"
                name="artista"
                value={formData.artista}
                onChange={handleInputChange}
                className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                placeholder="Nome do artista"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Álbum</label>
              <input
                type="text"
                name="album"
                value={formData.album}
                onChange={handleInputChange}
                className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                placeholder="Nome do álbum"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Ano</label>
              <input
                type="text"
                name="ano"
                value={formData.ano}
                onChange={handleInputChange}
                className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                placeholder="Ano de lançamento"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Valor (R$)</label>
              <input
                type="text"
                name="valor"
                value={formData.valor}
                onChange={handleInputChange}
                className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Estado da Capa</label>
              <select
                name="estadoCapa"
                value={formData.estadoCapa}
                onChange={handleInputChange}
                className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
              >
                {estadoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Estado da Mídia</label>
              <select
                name="estadoMidia"
                value={formData.estadoMidia}
                onChange={handleInputChange}
                className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
              >
                {estadoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Observações</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
              rows={3}
              placeholder="Detalhes adicionais, características específicas deste exemplar..."
            ></textarea>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button className="bg-quaternary text-white py-3 px-8 rounded-full font-bold shadow hover:bg-fifth transition-all text-lg">Limpar</button>
            <button className="bg-primary text-white py-3 px-8 rounded-full font-bold shadow hover:bg-secondary transition-all text-lg flex items-center gap-2">
              <Save size={20} />
              Salvar Produto
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Layout da tela de inventário
  const renderInventarioTab = () => {
    return (
      <div className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Buscar no inventário..."
              className="w-full border border-pastel-300 rounded p-2 pl-8 focus:ring-2 focus:ring-pastel-400 focus:border-transparent"
            />
            <Search size={16} className="absolute left-2 top-3 text-pastel-400" />
          </div>
          
          <button className="bg-pastel-500 text-pastel-900 py-2 px-4 rounded flex items-center gap-2 hover:bg-pastel-400 transition-colors">
            <PlusCircle size={16} />
            Novo Produto
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden border border-pastel-200">
          <table className="min-w-full divide-y divide-pastel-200">
            <thead className="bg-pastel-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Foto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Artista</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Álbum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Ano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-pastel-200">
              {mockInventory.map(item => (
                <tr key={item.id} className="hover:bg-pastel-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 bg-pastel-100 rounded flex items-center justify-center">
                      <img src="/api/placeholder/48/48" alt="" className="h-10 w-10 rounded" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.artista}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.album}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.ano}</td>
                  <td className="px-6 py-4 whitespace-nowrap">R$ {item.valor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      <span className="px-2 py-1 text-xs rounded bg-pastel-100 text-pastel-800">
                        Capa: {item.estadoCapa}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-pastel-200 text-pastel-800">
                        Mídia: {item.estadoMidia}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-pastel-600 hover:text-pastel-800 mr-3">Editar</button>
                    <button className="text-red-500 hover:text-red-700">Vender</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-tertiary to-quaternary">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-lg">
        <div className="max-w-[2000px] mx-auto">
          <h1 className="text-2xl font-bold">Wax Cloud</h1>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-secondary border-b">
        <div className="max-w-[2000px] mx-auto flex">
          <button 
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'cadastro' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-quaternary hover:text-primary'
            }`}
            onClick={() => setActiveTab('cadastro')}
          >
            <PlusCircle size={16} />
            Cadastro de Produtos
          </button>
          <button 
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'inventario' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-quaternary hover:text-primary'
            }`}
            onClick={() => setActiveTab('inventario')}
          >
            <List size={16} />
            Inventário
          </button>
          <button 
            className={`px-6 py-4 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'relatorios' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-quaternary hover:text-primary'
            }`}
            onClick={() => setActiveTab('relatorios')}
          >
            <BarChart2 size={16} />
            Relatórios
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8 bg-gradient-to-br from-tertiary to-quaternary flex items-center justify-center">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-quaternary p-10 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Card de upload */}
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center h-72 relative shadow-md border border-fifth">
                {formData.foto ? (
                  <img 
                    src={formData.foto} 
                    alt="Capa do disco" 
                    className="max-h-60 rounded-xl object-contain shadow-lg border border-quaternary"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera size={56} className="text-quaternary mb-4" />
                    <p className="text-primary text-lg font-semibold text-center">Selecione uma fonte para adicionar foto</p>
                    <p className="text-quaternary text-xs mt-2">Resolução recomendada: 600x600</p>
                  </div>
                )}
                {isScanning && (
                  <div className="absolute inset-0 bg-primary/80 rounded-xl flex items-center justify-center z-10">
                    <div className="text-white text-center animate-pulse">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-3"></div>
                      <p className="font-bold">Analisando imagem...</p>
                      <p className="text-xs mt-1">Buscando informações do álbum</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative mt-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                  className="w-full bg-primary text-white py-3 px-4 rounded-full flex items-center justify-center gap-2 shadow hover:bg-secondary transition-all font-semibold text-lg"
                  disabled={isScanning}
                >
                  <Camera size={20} />
                  {isScanning ? 'Analisando...' : formData.foto ? 'Trocar foto' : 'Adicionar foto'}
                </button>
                {showPhotoOptions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-20 p-3 border border-fifth flex flex-col gap-2">
                    <div 
                      className="p-2 hover:bg-fifth rounded-lg cursor-pointer flex items-center gap-2 transition-all"
                      onClick={() => handleUploadClick('file')}
                    >
                      <Camera size={16} />
                      Carregar do computador
                    </div>
                    <div 
                      className="p-2 hover:bg-fifth rounded-lg cursor-pointer flex items-center gap-2 transition-all"
                      onClick={() => handleUploadClick('camera')}
                    >
                      <Camera size={16} />
                      Usar câmera USB
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Formulário */}
            <div className="w-full md:w-2/3">
              {showNotification && (
                <div className="mb-4 bg-secondary/30 border-l-4 border-primary text-primary p-4 rounded-xl flex items-center justify-between shadow">
                  <div className="flex items-center gap-2">
                    <Check size={24} className="text-quaternary" />
                    <span className="font-semibold">Artista e álbum identificados automaticamente!</span>
                  </div>
                  <button onClick={() => setShowNotification(false)} className="text-fifth hover:text-primary text-2xl font-bold">&times;</button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Artista</label>
                  <input
                    type="text"
                    name="artista"
                    value={formData.artista}
                    onChange={handleInputChange}
                    className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                    placeholder="Nome do artista"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Álbum</label>
                  <input
                    type="text"
                    name="album"
                    value={formData.album}
                    onChange={handleInputChange}
                    className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                    placeholder="Nome do álbum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Ano</label>
                  <input
                    type="text"
                    name="ano"
                    value={formData.ano}
                    onChange={handleInputChange}
                    className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                    placeholder="Ano de lançamento"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Valor (R$)</label>
                  <input
                    type="text"
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Estado da Capa</label>
                  <select
                    name="estadoCapa"
                    value={formData.estadoCapa}
                    onChange={handleInputChange}
                    className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                  >
                    {estadoOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Estado da Mídia</label>
                  <select
                    name="estadoMidia"
                    value={formData.estadoMidia}
                    onChange={handleInputChange}
                    className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                  >
                    {estadoOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">Observações</label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  className="w-full border border-fifth rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-quaternary shadow-sm text-lg"
                  rows={3}
                  placeholder="Detalhes adicionais, características específicas deste exemplar..."
                ></textarea>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button className="bg-quaternary text-white py-3 px-8 rounded-full font-bold shadow hover:bg-fifth transition-all text-lg">Limpar</button>
                <button className="bg-primary text-white py-3 px-8 rounded-full font-bold shadow hover:bg-secondary transition-all text-lg flex items-center gap-2">
                  <Save size={20} />
                  Salvar Produto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
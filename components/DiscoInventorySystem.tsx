'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Save, Search, PlusCircle, Trash2, List, BarChart2, Check, Upload } from 'lucide-react';

export default function DiscoInventorySystem() {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [isScanning, setIsScanning] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | null>(null);
  
  // Estado para formulário de cadastro
  const [formData, setFormData] = useState<{
    artista: string;
    album: string;
    ano: string;
    valor: string;
    estadoCapa: string;
    estadoMidia: string;
    observacoes: string;
    foto: string | null;
  }>({
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
  
  // Estado para inventário salvo
  const [inventory, setInventory] = useState<any[]>([]);
  // Estado para saber se está editando
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Estado para progresso de upload
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Handler para alterações no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Função para analisar a imagem
  const analyzeImage = async (file: File) => {
    setStatusMessage('Analisando foto...');
    setStatusType('info');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        setStatusMessage('Erro ao analisar foto. Preencha manualmente.');
        setStatusType('error');
        throw new Error(data.error);
      }

      setFormData(prev => ({
        ...prev,
        artista: data.result.artist || data.result.artista || '',
        album: data.result.album || '',
        ano: data.result.year || data.result.ano || ''
      }));

      setStatusMessage('Informações encontradas e preenchidas automaticamente!');
      setStatusType('success');
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        setStatusMessage(null);
        setStatusType(null);
      }, 3000);

    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      setStatusMessage('Erro ao analisar foto. Preencha manualmente.');
      setStatusType('error');
      alert('Não foi possível reconhecer as informações da imagem. Por favor, preencha manualmente.');
    }
  };

  // Função para fazer upload da imagem
  const handleFileUpload = async (file: File) => {
    // Validação de tipo e tamanho
    if (!file.type.startsWith('image/')) {
      setStatusMessage('O arquivo deve ser uma imagem.');
      setStatusType('error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage('A imagem deve ter no máximo 5MB.');
      setStatusType('error');
      return;
    }
    // Preview imediato
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({ ...prev, foto: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
    setIsScanning(true);
    setStatusMessage('Enviando foto...');
    setStatusType('info');
    setUploadProgress(0);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      // Barra de progresso
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      const promise = new Promise<{ success: boolean; filename?: string; error?: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(xhr.responseText);
          }
        };
        xhr.onerror = () => reject(xhr.responseText);
      });
      xhr.send(formDataUpload);
      const uploadResult = await promise;
      if (!uploadResult.success) {
        setStatusMessage('Erro ao enviar foto. Tente novamente.');
        setStatusType('error');
        throw new Error(uploadResult.error);
      }
      setFormData(prev => ({
        ...prev,
        foto: uploadResult.filename || null
      }));
      setStatusMessage('Foto enviada! Agora analisando...');
      setStatusType('info');
      // Analisa a imagem para extrair informações
      await analyzeImage(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setStatusMessage('Erro ao enviar foto. Tente novamente.');
      setStatusType('error');
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsScanning(false);
      setUploadProgress(0);
    }
  };

  // Referência para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler para o clique no botão de upload
  const handleUploadClick = (source: 'file' | 'camera') => {
    if (fileInputRef.current) {
      if (source === 'file') {
        fileInputRef.current.removeAttribute('capture');
      } else if (source === 'camera') {
        fileInputRef.current.setAttribute('capture', 'environment');
      }
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
  
  // Função para salvar ou atualizar o disco
  const handleSave = async () => {
    if (editingId) {
      // Atualizar disco existente
      await fetch('/api/discos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingId })
      });
      setStatusMessage('Disco atualizado com sucesso!');
      setStatusType('success');
    } else {
      // Criar novo disco
      await fetch('/api/discos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setStatusMessage('Disco salvo com sucesso!');
      setStatusType('success');
    }
    setFormData({
      artista: '',
      album: '',
      ano: '',
      valor: '',
      estadoCapa: 'M',
      estadoMidia: 'M',
      observacoes: '',
      foto: null
    });
    setEditingId(null);
    fetchInventory();
    setTimeout(() => {
      setStatusMessage(null);
      setStatusType(null);
    }, 2000);
  };
  
  // Função para excluir disco
  const handleDelete = async (id: number) => {
    await fetch('/api/discos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    // Atualiza a lista após exclusão
    fetchInventory();
  };

  // Função para buscar inventário da API
  const fetchInventory = async () => {
    const res = await fetch('/api/discos');
    const data = await res.json();
    if (data.success) setInventory(data.data);
  };

  // Buscar inventário ao carregar a aba
  useEffect(() => {
    if (activeTab === 'inventario') fetchInventory();
  }, [activeTab]);
  
  // Função para editar disco
  const handleEdit = (item: any) => {
    setActiveTab('cadastro');
    setFormData({
      artista: item.artista || '',
      album: item.album || '',
      ano: item.ano || '',
      valor: item.valor || '',
      estadoCapa: item.estadoCapa || 'M',
      estadoMidia: item.estadoMidia || 'M',
      observacoes: item.observacoes || '',
      foto: item.foto || null
    });
    setEditingId(item.id);
  };
  
  // Layout da tela de cadastro
  const renderCadastroTab = () => {
    return (
      <div className="flex flex-col lg:flex-row gap-3 items-start">
        {/* Card de upload + botão */}
        <div className="w-full lg:w-1/3 flex flex-col items-center">
          <div className="bg-pastel-100 rounded-xl p-2 flex flex-col items-center justify-center h-64 relative shadow hover:shadow-lg transition-shadow duration-200 border border-pastel-200 w-full">
            {formData.foto ? (
              <>
                <img 
                  src={formData.foto} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain rounded-lg mb-2"
                />
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline mb-2"
                  onClick={() => setFormData(prev => ({ ...prev, foto: null }))}
                >
                  Remover imagem
                </button>
              </>
            ) : (
              <div className="text-center flex flex-col items-center justify-center h-full w-full">
                <Upload className="w-12 h-12 text-pastel-400 mb-2" />
                <p className="text-pastel-600 text-sm">Arraste uma imagem ou clique para selecionar</p>
              </div>
            )}
            {/* Barra de progresso */}
            {isScanning && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full h-2 bg-pastel-200 rounded mt-2 overflow-hidden">
                <div className="h-2 bg-pastel-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {/* Botão de escolha de fonte da foto */}
          <div className="relative w-full flex justify-center mt-2">
            <button
              type="button"
              className="px-3 py-1.5 bg-pastel-500 text-pastel-900 rounded-lg flex items-center gap-2 hover:bg-pastel-400 transition-colors duration-200 focus:ring-2 focus:ring-pastel-200/20 outline-none shadow"
              onClick={() => setShowPhotoOptions((v) => !v)}
            >
              <Upload className="w-5 h-5" />
              Adicionar Foto
            </button>
            {showPhotoOptions && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-pastel-200 rounded-lg shadow-lg z-10 min-w-[160px] animate-fade-in">
                <button
                  className="w-full px-4 py-2 text-left text-pastel-900 hover:bg-pastel-100 rounded-t-lg"
                  onClick={() => handleUploadClick('file')}
                >
                  Selecionar Arquivo
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-pastel-900 hover:bg-pastel-100 rounded-b-lg"
                  onClick={() => handleUploadClick('camera')}
                >
                  Usar Câmera/Webcam
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Formulário */}
        <div className="w-full lg:w-2/3">
          {/* Mensagem de status do upload/análise */}
          {statusMessage && (
            <div className={`mb-3 rounded-xl px-4 py-2 flex items-center gap-2 shadow text-sm font-medium border
              ${statusType === 'info' ? 'bg-pastel-100 text-pastel-800 border-pastel-200' : ''}
              ${statusType === 'success' ? 'bg-green-100 text-green-800 border-green-300' : ''}
              ${statusType === 'error' ? 'bg-red-100 text-red-800 border-red-300' : ''}
            `}>
              {statusType === 'info' && <Upload className="w-4 h-4 text-pastel-400" />}
              {statusType === 'success' && <Check className="w-4 h-4 text-green-500" />}
              {statusType === 'error' && <Trash2 className="w-4 h-4 text-red-500" />}
              <span>{statusMessage}</span>
            </div>
          )}
          {showNotification && (
            <div className="mb-4 bg-pastel-100 border-l-4 border-pastel-400 text-pastel-800 p-4 rounded-xl flex items-center justify-between shadow">
              <div className="flex items-center gap-2">
                <Check size={24} className="text-pastel-500" />
                <span className="font-semibold">Artista e álbum identificados automaticamente!</span>
              </div>
              <button onClick={() => setShowNotification(false)} className="text-pastel-400 hover:text-pastel-600 text-2xl font-bold">&times;</button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pastel-800">Artista</label>
              <input
                type="text"
                value={formData.artista}
                onChange={handleInputChange}
                name="artista"
                className="w-full px-2 py-1.5 rounded-lg border border-pastel-200 focus:border-pastel-400 focus:ring-2 focus:ring-pastel-200/40 outline-none transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pastel-800">Álbum</label>
              <input
                type="text"
                value={formData.album}
                onChange={handleInputChange}
                name="album"
                className="w-full px-2 py-1.5 rounded-lg border border-pastel-200 focus:border-pastel-400 focus:ring-2 focus:ring-pastel-200/40 outline-none transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pastel-800">Ano</label>
              <input
                type="text"
                value={formData.ano}
                onChange={handleInputChange}
                name="ano"
                className="w-full px-2 py-1.5 rounded-lg border border-pastel-200 focus:border-pastel-400 focus:ring-2 focus:ring-pastel-200/40 outline-none transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pastel-800">Valor (R$)</label>
              <input
                type="text"
                value={formData.valor}
                onChange={handleInputChange}
                name="valor"
                className="w-full px-2 py-1.5 rounded-lg border border-pastel-200 focus:border-pastel-400 focus:ring-2 focus:ring-pastel-200/40 outline-none transition-colors duration-200"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pastel-800">Estado da Capa</label>
              <select
                value={formData.estadoCapa}
                onChange={handleInputChange}
                name="estadoCapa"
                className="w-full px-2 py-1.5 rounded-lg border border-pastel-200 focus:border-pastel-400 focus:ring-2 focus:ring-pastel-200/40 outline-none transition-colors duration-200"
              >
                {estadoOptions.map((option: { value: string; label: string }) => {
                  const { value, label } = option;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-pastel-800">Estado da Mídia</label>
              <select
                value={formData.estadoMidia}
                onChange={handleInputChange}
                name="estadoMidia"
                className="w-full px-2 py-1.5 rounded-lg border border-pastel-200 focus:border-pastel-400 focus:ring-2 focus:ring-pastel-200/40 outline-none transition-colors duration-200"
              >
                {estadoOptions.map((option: { value: string; label: string }) => {
                  const { value, label } = option;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="mt-2">
            <label className="block text-sm font-medium text-pastel-800">Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={handleInputChange}
              name="observacoes"
              className="w-full px-2 py-1.5 rounded-lg border border-pastel-200 focus:border-pastel-400 focus:ring-2 focus:ring-pastel-200/40 outline-none transition-colors duration-200"
              rows={3}
              placeholder="Detalhes adicionais, características específicas deste exemplar..."
            ></textarea>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setFormData({...formData, artista: '', album: '', ano: '', valor: '', estadoCapa: 'M', estadoMidia: 'M', observacoes: '', foto: null})}
              className="px-3 py-1.5 bg-pastel-200 text-pastel-800 rounded-lg hover:bg-pastel-300 transition-colors duration-200 focus:ring-2 focus:ring-pastel-200/20 outline-none"
            >
              Limpar
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-pastel-500 text-pastel-900 rounded-lg hover:bg-pastel-400 transition-colors duration-200 focus:ring-2 focus:ring-pastel-200/20 outline-none"
            >
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Layout da tela de inventário
  const renderInventarioTab = () => {
    return (
      <div className="p-2">
        <div className="mb-3 flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Buscar no inventário..."
              className="w-full px-2 py-1.5 rounded-lg border border-pastel-200 focus:border-pastel-400 focus:ring-2 focus:ring-pastel-200/40 outline-none transition-colors duration-200 pl-8 text-pastel-800 bg-pastel-100"
            />
            <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-pastel-400" />
          </div>
          
          <button className="px-3 py-1.5 bg-pastel-500 text-pastel-900 rounded-lg flex items-center gap-2 hover:bg-pastel-400 transition-colors duration-200 focus:ring-2 focus:ring-pastel-200/20 outline-none">
            <PlusCircle size={16} />
            Novo Produto
          </button>
        </div>
        
        <div className="bg-pastel-100 rounded-lg shadow overflow-hidden border border-pastel-200">
          <table className="min-w-full divide-y divide-pastel-200">
            <thead className="bg-pastel-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Foto</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Artista</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Álbum</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Ano</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Valor</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Estado</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-pastel-800 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-pastel-100 divide-y divide-pastel-200">
              {(inventory.length > 0 ? inventory : mockInventory).map(item => (
                <tr key={item.id} className="hover:bg-pastel-200 transition-colors duration-200">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="h-10 w-10 bg-pastel-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.foto ? (
                        <img src={item.foto} alt="Capa do disco" className="h-10 w-10 object-cover rounded" />
                      ) : (
                        <img src="/api/placeholder/48/48" alt="" className="h-8 w-8 rounded" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-pastel-900">{item.artista}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-pastel-900">{item.album}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-pastel-900">{item.ano}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-pastel-900">R$ {item.valor}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex gap-1">
                      <span className="px-2 py-1 text-xs rounded bg-pastel-200 text-pastel-800">
                        Capa: {item.estadoCapa}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-pastel-200 text-pastel-800">
                        Mídia: {item.estadoMidia}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-pastel-500 hover:text-pastel-800 mr-3 transition-colors duration-200" onClick={() => handleEdit(item)}>Editar</button>
                    <button className="text-red-500 hover:text-red-700 transition-colors duration-200 mr-2">Vender</button>
                    <button className="text-red-700 hover:text-red-900 transition-colors duration-200 font-bold" onClick={() => handleDelete(item.id)}>Excluir</button>
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
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[2000px] mx-auto px-2 py-2 flex items-center justify-between">
          {/* Ícone à esquerda */}
          <img src="/logo/icone.png" alt="Ícone Wax Cloud" className="h-12 w-auto" />
          {/* Logo centralizado */}
          <img src="/logo/logo.png" alt="Logo Wax Cloud" className="h-12 w-auto mx-auto" />
          {/* Espaço à direita para manter centralização */}
          <div className="h-12 w-12" />
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[2000px] mx-auto flex px-2">
          <button 
            className={`px-3 py-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
              activeTab === 'cadastro' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-600 hover:text-primary'
            }`}
            onClick={() => setActiveTab('cadastro')}
          >
            <PlusCircle size={16} />
            Cadastro de Produtos
          </button>
          <button 
            className={`px-3 py-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
              activeTab === 'inventario' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-600 hover:text-primary'
            }`}
            onClick={() => setActiveTab('inventario')}
          >
            <List size={16} />
            Inventário
          </button>
          <button 
            className={`px-3 py-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
              activeTab === 'relatorios' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-neutral-600 hover:text-primary'
            }`}
            onClick={() => setActiveTab('relatorios')}
          >
            <BarChart2 size={16} />
            Relatórios
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-2 bg-neutral-50">
        <div className="max-w-[2000px] mx-auto h-full bg-white rounded-2xl shadow-apple border border-neutral-200 p-3 animate-fade-in">
          {activeTab === 'cadastro' && (
            <div className="animate-slide-up">
              {renderCadastroTab()}
            </div>
          )}
          {activeTab === 'inventario' && (
            <div className="animate-slide-up">
              {renderInventarioTab()}
            </div>
          )}
          {activeTab === 'relatorios' && (
            <div className="animate-slide-up">
              <div className="p-4">Conteúdo da tela de relatórios...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
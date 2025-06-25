import React, { useState, useEffect } from 'react';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const tipos = ['Todos', 'Fornecimento', 'Instalação', 'Manutenção'];
const statusTipos = ['Todos', 'Ativo', 'Encerrado', 'Aguardando execução'];
const Cores = ['#0088FE', '#00C49F', '#FFBB28'];

const App = () => {
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({});
  const [filtros, setFiltros] = useState({ tipo: 'Todos', status: 'Todos', estado: 'Todos', busca: '' });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('contracts')) || [];
    setContracts(data);
  }, []);

  useEffect(() => {
    localStorage.setItem('contracts', JSON.stringify(contracts));
  }, [contracts]);

  const calcularStatus = contrato => {
    const hoje = new Date();
    if (!contrato.dataInicio) return 'Aguardando execução';
    const fim = parseISO(contrato.dataEncerramento);
    return isBefore(fim, hoje) ? 'Encerrado' : 'Ativo';
  };

  const salvar = () => {
    const novoContrato = {
      ...form,
      id: form.id || Date.now(),
      status: calcularStatus(form),
      valorComissao: (form.valorGlobal * 0.04).toFixed(2)
    };

    const atualizados = form.id
      ? contracts.map(c => (c.id === form.id ? novoContrato : c))
      : [...contracts, novoContrato];

    setContracts(atualizados);
    setForm({});
  };

  const editar = contrato => setForm(contrato);
  const resetarForm = () => setForm({});

  const contratosFiltrados = contracts.filter(c => {
    const tipoOk = filtros.tipo === 'Todos' || (c.objeto && c.objeto.includes(filtros.tipo));
    const statusOk = filtros.status === 'Todos' || calcularStatus(c) === filtros.status;
    const estadoOk = filtros.estado === 'Todos' || c.estado === filtros.estado;
    const buscaOk = c.orgao?.toLowerCase().includes(filtros.busca.toLowerCase());
    return tipoOk && statusOk && estadoOk && buscaOk;
  });

  const porMes = {};
  contracts.forEach(c => {
    const mes = format(parseISO(c.dataInicio), 'yyyy-MM');
    porMes[mes] = porMes[mes] || { vendas: 0, comissao: 0 };
    porMes[mes].vendas += Number(c.valorGlobal);
    porMes[mes].comissao += Number(c.valorComissao);
  });

  const resumo = contracts.reduce(
    (acc, c) => {
      acc.elevadores += Number(c.qtdElevador || 0);
      acc.plataformas += Number(c.qtdPlataforma || 0);
      return acc;
    },
    { elevadores: 0, plataformas: 0 }
  );

  const contagemStatus = ['Ativo', 'Encerrado', 'Aguardando execução'].map(status => ({
    name: status,
    value: contracts.filter(c => calcularStatus(c) === status).length
  }));

  return (
    <div className="p-4 text-gray-900 dark:bg-gray-900 dark:text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Gestão de Contratos de Elevadores</h1>

      <div className="flex gap-4 flex-wrap mb-4">
        {['tipo', 'status', 'estado'].map(filtro => (
          <select
            key={filtro}
            value={filtros[filtro]}
            onChange={e => setFiltros({ ...filtros, [filtro]: e.target.value })}
            className="border p-1 rounded"
          >
            {(filtro === 'tipo' ? tipos : filtro === 'status' ? statusTipos : ['Todos', ...estados]).map(op => (
              <option key={op}>{op}</option>
            ))}
          </select>
        ))}
        <input
          placeholder="Buscar órgão"
          value={filtros.busca}
          onChange={e => setFiltros({ ...filtros, busca: e.target.value })}
          className="border p-1 rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded p-4 text-xl font-bold">
          Elevadores: {resumo.elevadores}
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded p-4 text-xl font-bold">
          Plataformas: {resumo.plataformas}
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
          <PieChart width={300} height={200}>
            <Pie
              data={contagemStatus}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              label
            >
              {contagemStatus.map((_, i) => (
                <Cell key={i} fill={Cores[i % Cores.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">Novo Contrato</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <input placeholder="Órgão" value={form.orgao || ''} onChange={e => setForm({ ...form, orgao: e.target.value })} className="border p-1" />
        <select value={form.estado || ''} onChange={e => setForm({ ...form, estado: e.target.value })} className="border p-1">
          <option value="">Selecione o Estado</option>
          {estados.map(uf => <option key={uf}>{uf}</option>)}
        </select>
        <input type="number" placeholder="Valor Global" value={form.valorGlobal || ''} onChange={e => setForm({ ...form, valorGlobal: e.target.value })} className="border p-1" />
        <input value={`R$ ${((form.valorGlobal || 0) * 0.04).toFixed(2)}`} readOnly className="border p-1 bg-gray-100" />
        <input placeholder="Objeto" value={form.objeto || ''} onChange={e => setForm({ ...form, objeto: e.target.value })} className="border p-1" />
        <input type="number" placeholder="Qtd Elevador" value={form.qtdElevador || ''} onChange={e => setForm({ ...form, qtdElevador: e.target.value })} className="border p-1" />
        <input type="number" placeholder="Qtd Plataforma" value={form.qtdPlataforma || ''} onChange={e => setForm({ ...form, qtdPlataforma: e.target.value })} className="border p-1" />
        <input type="date" placeholder="Data Início" value={form.dataInicio || ''} onChange={e => setForm({ ...form, dataInicio: e.target.value })} className="border p-1" />
        <input type="date" placeholder="Data Fim" value={form.dataEncerramento || ''} onChange={e => setForm({ ...form, dataEncerramento: e.target.value })} className="border p-1" />
        <input placeholder="Gestor" value={form.gestor || ''} onChange={e => setForm({ ...form, gestor: e.target.value })} className="border p-1" />
        <input placeholder="Telefone" value={form.telefone || ''} onChange={e => setForm({ ...form, telefone: e.target.value })} className="border p-1" />
        <input placeholder="E-mail" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="border p-1" />
      </div>

      <div className="mb-4">
        <button onClick={salvar} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">
          {form.id ? 'Atualizar' : 'Salvar'}
        </button>
        <button onClick={resetarForm} className="bg-gray-400 text-white px-4 py-2 rounded">
          Limpar
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-2">Contratos</h2>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-1">Órgão</th>
            <th>Estado</th>
            <th>Valor</th>
            <th>Comissão</th>
            <th>Elevadores</th>
            <th>Plataformas</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {contratosFiltrados.map(c => (
            <tr key={c.id} className={isBefore(parseISO(c.dataEncerramento), addDays(new Date(), 30)) ? 'bg-yellow-100' : ''}>
              <td className="p-1">{c.orgao}</td>
              <td>{c.estado}</td>
              <td>R$ {Number(c.valorGlobal).toFixed(2)}</td>
              <td>R$ {Number(c.valorComissao).toFixed(2)}</td>
              <td>{c.qtdElevador}</td>
              <td>{c.qtdPlataforma}</td>
              <td>{calcularStatus(c)}</td>
              <td><button onClick={() => editar(c)} className="text-blue-600">Editar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;

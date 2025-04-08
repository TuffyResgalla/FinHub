'use client';

import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

function formatarNumero(valor) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function exportarCSV(tabela) {
  const cabecalho = [
    "Mês",
    "Aporte (R$)",
    "Rendimento (R$)",
    "Saldo Total (R$)",
    "Custo de Vida (R$)",
    "Renda Passiva (R$)",
  ];
  const linhas = tabela.map((l) => [
    l.mes,
    formatarNumero(l.aporte),
    formatarNumero(l.rendimento),
    formatarNumero(l.saldo),
    formatarNumero(l.custoVida),
    formatarNumero(l.rendaPassiva),
  ]);
  const conteudo = [cabecalho, ...linhas].map((e) => e.join(";")).join("
");")).join("
");
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "tabela_simulacao.csv");
  link.click();
}

export default function Simulador() {
  const [form, setForm] = useState({
    custoVidaAtual: 7000,
    anos: 10,
    inflacao: 5,
    rendimento: 12,
    ir: 15,
    patrimonioInicial: 0,
  });

  const [resultado, setResultado] = useState(null);
  const [mesesExibidos, setMesesExibidos] = useState(240);
  const [pontoInflexao, setPontoInflexao] = useState(null);

  const calcular = () => {
    const {
      custoVidaAtual,
      anos,
      inflacao,
      rendimento,
      ir,
      patrimonioInicial,
    } = form;

    const meses = anos * 12;
    const inflacaoAnual = inflacao / 100;
    const rendimentoAnual = rendimento / 100;
    const taxaLiquida = rendimentoAnual * (1 - ir / 100);
    const taxaMensal = Math.pow(1 + taxaLiquida, 1 / 12) - 1;
    const inflacaoMensal = Math.pow(1 + inflacaoAnual, 1 / 12) - 1;

    const custoFuturoMensal = custoVidaAtual * Math.pow(1 + inflacaoAnual, anos);
    const custoFuturoAnual = custoFuturoMensal * 12;
    const patrimonioIdeal = custoFuturoAnual / taxaLiquida;

    const aporteMensal = (patrimonioIdeal - patrimonioInicial * Math.pow(1 + taxaMensal, meses)) * taxaMensal / (Math.pow(1 + taxaMensal, meses) - 1);

    let saldo = patrimonioInicial;
    let totalAporte = patrimonioInicial;
    let custoMensal = custoVidaAtual;
    const aportes = [patrimonioInicial];
    const rendimentos = [0];
    const tabela = [{ mes: 0, aporte: patrimonioInicial, rendimento: 0, saldo: patrimonioInicial, custoVida: custoMensal, rendaPassiva: patrimonioInicial * taxaLiquida / 12 }];

    let primeiroMesInflexao = null;

    for (let i = 1; i <= meses; i++) {
      custoMensal = custoMensal * (1 + inflacaoMensal);
      const rendimentoDoMes = saldo * taxaMensal;
      saldo = saldo + rendimentoDoMes + aporteMensal;
      totalAporte += aporteMensal;

      const rendaPassiva = saldo * taxaLiquida / 12;
      if (!primeiroMesInflexao && rendaPassiva >= custoMensal) {
        primeiroMesInflexao = i;
      }

      aportes.push(totalAporte);
      rendimentos.push(saldo - totalAporte);

      tabela.push({
        mes: i,
        aporte: aporteMensal,
        rendimento: rendimentoDoMes,
        saldo: saldo,
        custoVida: custoMensal,
        rendaPassiva: rendaPassiva,
      });
    }

    setResultado({
      custoFuturoMensal,
      patrimonioIdeal,
      aporteMensal,
      saldos: aportes.map((a, i) => a + rendimentos[i]),
      aportes,
      rendimentos,
      tabelaMensal: tabela,
    });
    setPontoInflexao(primeiroMesInflexao);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseFloat(e.target.value) });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#009d71] mb-4">FinHub - Simulador de Independência Financeira</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(form).map(([key, val]) => (
          <div key={key}>
            <label className="block text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</label>
            <Input type="number" name={key} value={val} onChange={handleChange} className="text-right" />
          </div>
        ))}
      </div>
      <Button className="mt-4 bg-[#009d71] text-white" onClick={calcular}>Calcular</Button>

      {resultado && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-[#009d71] mb-2">Resultados</h2>
          <p><strong>Patrimônio ideal:</strong> R$ {formatarNumero(resultado.patrimonioIdeal)}</p>
          <p><strong>Aporte mensal necessário:</strong> R$ {formatarNumero(resultado.aporteMensal)}</p>
          <p><strong>Ponto de Inflexão:</strong> mês {pontoInflexao} {pontoInflexao && `(em ${Math.floor(pontoInflexao / 12)} anos e ${pontoInflexao % 12} meses)`}</p>

          <div className="mt-6">
            <Line
              data={{
                labels: resultado.tabelaMensal.map(l => l.mes),
                datasets: [
                  {
                    label: "Renda Passiva",
                    data: resultado.tabelaMensal.map(l => l.rendaPassiva),
                    borderColor: "#009d71",
                    fill: false,
                  },
                  {
                    label: "Custo de Vida",
                    data: resultado.tabelaMensal.map(l => l.custoVida),
                    borderColor: "#ff6347",
                    fill: false,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: { position: "top" },
                },
                scales: {
                  x: {
                    title: { display: true, text: 'Meses' },
                  },
                  y: {
                    title: { display: true, text: 'R$' },
                  }
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <div>
              <label>Meses para exibir: </label>
              <select value={mesesExibidos} onChange={(e) => setMesesExibidos(Number(e.target.value))} className="ml-2 border rounded">
                <option value={12}>12</option>
                <option value={60}>60</option>
                <option value={120}>120</option>
                <option value={240}>240</option>
              </select>
            </div>
            <Button onClick={() => exportarCSV(resultado.tabelaMensal)}>Exportar CSV</Button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="min-w-full text-sm">
              <thead className="bg-[#009d71] text-white">
                <tr>
                  <th className="p-2">Mês</th>
                  <th className="p-2">Aporte (R$)</th>
                  <th className="p-2">Rendimento (R$)</th>
                  <th className="p-2">Saldo (R$)</th>
                  <th className="p-2">Custo de Vida (R$)</th>
                  <th className="p-2">Renda Passiva (R$)</th>
                </tr>
              </thead>
              <tbody>
                {resultado.tabelaMensal.slice(0, mesesExibidos).map((linha, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{linha.mes}</td>
                    <td className="p-2">{formatarNumero(linha.aporte)}</td>
                    <td className="p-2">{formatarNumero(linha.rendimento)}</td>
                    <td className="p-2">{formatarNumero(linha.saldo)}</td>
                    <td className="p-2">{formatarNumero(linha.custoVida)}</td>
                    <td className="p-2">{formatarNumero(linha.rendaPassiva)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

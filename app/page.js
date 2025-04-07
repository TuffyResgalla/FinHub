'use client';

import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function formatarNumero(valor) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SimuladorIndependenciaFinanceira() {
  const [form, setForm] = useState({
    custoVidaAtual: 7000,
    anos: 10,
    inflacao: 5,
    rendimento: 12,
    ir: 15,
    patrimonioInicial: 0,
  });

  const [resultado, setResultado] = useState(null);
  const [tabelaComparativa, setTabelaComparativa] = useState([]);

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
    const inflacaoMensal = Math.pow(1 + inflacaoAnual, 1 / 12) - 1;
    const rendimentoAnual = rendimento / 100;
    const taxaLiquida = rendimentoAnual * (1 - ir / 100);
    const taxaMensal = Math.pow(1 + taxaLiquida, 1 / 12) - 1;

    const custoFuturoMensal = custoVidaAtual * Math.pow(1 + inflacaoAnual, anos);
    const custoFuturoAnual = custoFuturoMensal * 12;
    const patrimonioIdeal = custoFuturoAnual / taxaLiquida;

    let saldo = patrimonioInicial;
    let totalAporte = patrimonioInicial;
    const aportes = [patrimonioInicial];
    const rendimentos = [0];
    const tabela = [];

    const aporteMensalInicial = (patrimonioIdeal * taxaMensal / (Math.pow(1 + taxaMensal, meses) - 1));

    for (let i = 1; i <= meses; i++) {
      const aporteCorrigido = aporteMensalInicial * Math.pow(1 + inflacaoMensal, i);
      const aporteFixo = aporteMensalInicial;

      saldo = saldo * (1 + taxaMensal) + aporteCorrigido;
      totalAporte += aporteCorrigido;
      aportes.push(totalAporte);
      rendimentos.push(saldo - totalAporte);

      tabela.push({
        mes: i,
        aporteFixo: aporteFixo,
        aporteCorrigido: aporteCorrigido,
      });
    }

    setResultado({
      custoFuturoMensal,
      patrimonioIdeal,
      aporteMensal: aporteMensalInicial,
      saldos: aportes.map((a, i) => a + rendimentos[i]),
      aportes,
      rendimentos,
    });

    setTabelaComparativa(tabela);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseFloat(e.target.value) });
  };

  return (
    <div className="min-h-screen bg-[#f4fefb] text-gray-900 font-sans bg-[url('/image.png')] bg-cover bg-center bg-no-repeat">
      <div className="bg-[#009d71]/90 py-10 text-white text-center shadow">
        <h1 className="text-4xl font-bold mb-2">FinHub</h1>
        <p className="text-lg">Simulador de Independência Financeira</p>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <Card className="p-6 shadow-md bg-white/90">
          <CardContent>
            <h2 className="text-2xl font-semibold text-[#009d71] mb-6">Preencha os dados abaixo</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm">Qual o seu custo de vida hoje? (R$)</span>
                <Input className="text-right" name="custoVidaAtual" type="number" step="100" value={form.custoVidaAtual} onChange={handleChange} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Quantos anos até a independência financeira?</span>
                <Input className="text-right" name="anos" type="number" value={form.anos} onChange={handleChange} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Qual a projeção de inflação média ao ano? (%)</span>
                <Input className="text-right" name="inflacao" type="number" value={form.inflacao} onChange={handleChange} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Qual a expectativa de rendimento anual? (%)</span>
                <Input className="text-right" name="rendimento" type="number" value={form.rendimento} onChange={handleChange} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Qual o IR sobre o rendimento? (%)</span>
                <Input className="text-right" name="ir" type="number" value={form.ir} onChange={handleChange} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm">Quanto você já tem hoje investido? (R$)</span>
                <Input className="text-right" name="patrimonioInicial" type="number" step="1000" value={form.patrimonioInicial} onChange={handleChange} />
              </label>
            </div>
            <div className="mt-6">
              <Button onClick={calcular} className="bg-[#009d71] hover:bg-[#007f5b] text-white w-full">Calcular</Button>
            </div>
          </CardContent>
        </Card>

        {resultado && (
          <Card className="mt-8 p-6 shadow-md bg-white/90">
            <CardContent>
              <h2 className="text-2xl font-semibold text-[#009d71] mb-4">Resultado</h2>
              <p><strong>Custo de vida futuro:</strong> R$ {formatarNumero(resultado.custoFuturoMensal)}</p>
              <p><strong>Patrimônio necessário:</strong> R$ {formatarNumero(resultado.patrimonioIdeal)}</p>
              <p><strong>Aporte mensal necessário (valor inicial):</strong> R$ {formatarNumero(resultado.aporteMensal)}</p>
              <p className="text-sm mt-2 text-gray-700">* Este é o valor de entrada. Com aportes corrigidos pela inflação, seu esforço de poupança será constante ao longo do tempo.</p>

              <div className="mt-6">
                <Bar
                  data={{
                    labels: resultado.saldos.map((_, i) => i),
                    datasets: [
                      {
                        label: "Aportes (R$)",
                        data: resultado.aportes,
                        backgroundColor: "#009d71",
                      },
                      {
                        label: "Rendimento (R$)",
                        data: resultado.rendimentos,
                        backgroundColor: "#52c9ac",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: { mode: "index", intersect: false },
                    },
                    scales: {
                      x: { stacked: true },
                      y: { stacked: true },
                    },
                  }}
                />
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-[#009d71] mb-2">Comparativo de Aportes</h3>
                <p className="text-sm text-gray-700 mb-4">A tabela abaixo compara o valor de aporte mensal fixo com o valor corrigido pela inflação, para manter o esforço real constante.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-[#009d71] text-white">
                        <th className="p-2">Mês</th>
                        <th className="p-2">Aporte Fixo (R$)</th>
                        <th className="p-2">Aporte Corrigido (R$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabelaComparativa.slice(0, 24).map((linha, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{linha.mes}</td>
                          <td className="p-2">{formatarNumero(linha.aporteFixo)}</td>
                          <td className="p-2">{formatarNumero(linha.aporteCorrigido)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-1">* Exibindo os primeiros 24 meses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

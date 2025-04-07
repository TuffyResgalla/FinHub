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

    const custoFuturoMensal = custoVidaAtual * Math.pow(1 + inflacaoAnual, anos);
    const custoFuturoAnual = custoFuturoMensal * 12;
    const patrimonioIdeal = custoFuturoAnual / taxaLiquida;

    const aporteMensal = patrimonioInicial > 0
      ? ((patrimonioIdeal - patrimonioInicial * Math.pow(1 + taxaMensal, meses)) * taxaMensal) /
        (Math.pow(1 + taxaMensal, meses) - 1)
      : patrimonioIdeal * taxaMensal / (Math.pow(1 + taxaMensal, meses) - 1);

    let saldo = patrimonioInicial;
    let totalAporte = patrimonioInicial;
    const aportes = [patrimonioInicial];
    const rendimentos = [0];

    for (let i = 1; i <= meses; i++) {
      saldo = saldo * (1 + taxaMensal) + aporteMensal;
      totalAporte += aporteMensal;
      aportes.push(totalAporte);
      rendimentos.push(saldo - totalAporte);
    }

    setResultado({
      custoFuturoMensal,
      patrimonioIdeal,
      aporteMensal,
      saldos: aportes.map((a, i) => a + rendimentos[i]),
      aportes,
      rendimentos,
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseFloat(e.target.value) });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <div className="bg-[#009d71] py-10 text-white text-center shadow">
        <h1 className="text-4xl font-bold mb-2">FinHub</h1>
        <p className="text-lg">Simulador de Independência Financeira</p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6 shadow-md">
          <CardContent>
            <h2 className="text-2xl font-semibold text-[#009d71] mb-4">Preencha os dados abaixo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          <Card className="mt-8 p-6 shadow-md">
            <CardContent>
              <h2 className="text-2xl font-semibold text-[#009d71] mb-4">Resultado</h2>
              <p><strong>Custo de vida futuro:</strong> R$ {formatarNumero(resultado.custoFuturoMensal)}</p>
              <p><strong>Patrimônio necessário:</strong> R$ {formatarNumero(resultado.patrimonioIdeal)}</p>
              <p><strong>Aporte mensal necessário:</strong> R$ {formatarNumero(resultado.aporteMensal)}</p>

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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

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
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">FinHub - Simulador de Independência Financeira</h1>

      <div className="flex flex-col gap-4 mb-6">
        <label>
          <span className="text-sm">Qual o seu custo de vida hoje? (R$)</span>
          <Input className="text-right" name="custoVidaAtual" type="number" step="100" value={form.custoVidaAtual} onChange={handleChange} />
        </label>
        <label>
          <span className="text-sm">Quantos anos até a independência financeira?</span>
          <Input className="text-right" name="anos" type="number" value={form.anos} onChange={handleChange} />
        </label>
        <label>
          <span className="text-sm">Qual a projeção de inflação média ao ano? (%)</span>
          <Input className="text-right" name="inflacao" type="number" value={form.inflacao} onChange={handleChange} />
        </label>
        <label>
          <span className="text-sm">Qual a expectativa de rendimento anual? (%)</span>
          <Input className="text-right" name="rendimento" type="number" value={form.rendimento} onChange={handleChange} />
        </label>
        <label>
          <span className="text-sm">Qual o IR sobre o rendimento? (%)</span>
          <Input className="text-right" name="ir" type="number" value={form.ir} onChange={handleChange} />
        </label>
        <label>
          <span className="text-sm">Quanto você já tem hoje investido? (R$)</span>
          <Input className="text-right" name="patrimonioInicial" type="number" step="1000" value={form.patrimonioInicial} onChange={handleChange} />
        </label>
      </div>

      <Button onClick={calcular}>Calcular</Button>

      {resultado && (
        <Card className="mt-6">
          <CardContent>
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
                      backgroundColor: "#3b82f6",
                    },
                    {
                      label: "Rendimento (R$)",
                      data: resultado.rendimentos,
                      backgroundColor: "#60a5fa",
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
  );
}

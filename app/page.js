import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

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

    // Gerar dados para o gráfico
    let saldo = patrimonioInicial;
    const saldos = [];
    for (let i = 0; i <= meses; i++) {
      saldos.push(saldo);
      saldo = saldo * (1 + taxaMensal) + aporteMensal;
    }

    setResultado({
      custoFuturoMensal,
      patrimonioIdeal,
      aporteMensal,
      saldos,
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseFloat(e.target.value) });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simulador de Independência Financeira</h1>
      <div className="grid grid-cols-2 gap-4">
        <Input name="custoVidaAtual" type="number" step="100" value={form.custoVidaAtual} onChange={handleChange} placeholder="Custo de vida mensal atual (R$)" />
        <Input name="anos" type="number" value={form.anos} onChange={handleChange} placeholder="Anos até a independência" />
        <Input name="inflacao" type="number" value={form.inflacao} onChange={handleChange} placeholder="Inflação média anual (%)" />
        <Input name="rendimento" type="number" value={form.rendimento} onChange={handleChange} placeholder="Rendimento médio anual (%)" />
        <Input name="ir" type="number" value={form.ir} onChange={handleChange} placeholder="IR sobre rendimento (%)" />
        <Input name="patrimonioInicial" type="number" step="1000" value={form.patrimonioInicial} onChange={handleChange} placeholder="Patrimônio inicial (R$)" />
      </div>
      <Button onClick={calcular} className="mt-4">Calcular</Button>

      {resultado && (
        <Card className="mt-6">
          <CardContent>
            <p><strong>Custo de vida futuro:</strong> R$ {resultado.custoFuturoMensal.toFixed(2)}</p>
            <p><strong>Patrimônio necessário:</strong> R$ {resultado.patrimonioIdeal.toFixed(2)}</p>
            <p><strong>Aporte mensal necessário:</strong> R$ {resultado.aporteMensal.toFixed(2)}</p>

            <div className="mt-6">
              <Line
                data={{
                  labels: resultado.saldos.map((_, i) => i),
                  datasets: [
                    {
                      label: "Evolução do Patrimônio (R$)",
                      data: resultado.saldos,
                      borderColor: "#3b82f6",
                      fill: false,
                    },
                  ],
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BellRing,
  CheckCircle,
  CircleAlert,
  Database,
  Fuel,
  Gauge,
  Globe,
  Leaf,
  LineChart as LineChartIcon,
  MapPin,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const emissionBaseline = 45.2;
const totalEmission = 31.8;
const target2025 = 35;
const target2030 = 29;
const carbonCeiling = 32;

const realizedTrendData = [
  { month: "Jan '24", total: 42.1, realized: 3.1 },
  { month: "Apr '24", total: 40.4, realized: 4.8, initiative: "Building Retrofits" },
  { month: "Jul '24", total: 38.7, realized: 6.5 },
  { month: "Oct '24", total: 36.2, realized: 8.4, initiative: "Renewable PPAs" },
  { month: "Jan '25", total: 34.9, realized: 10.1 },
  { month: "Apr '25", total: 33.3, realized: 11.6, initiative: "Fleet Electrification Wave 2" },
  { month: "Jul '25", total: 32.4, realized: 12.6 },
  { month: "Nov '25", total: 31.8, realized: 13.4, initiative: "Sustainable Fuel Procurement" },
];

const scopeBreakdownData = [
  { scope: "Scope 1", current: 12.6, target: 11.4 },
  { scope: "Scope 2", current: 10.4, target: 9.1 },
  { scope: "Scope 3", current: 8.8, target: 8.2 },
];

const layerBreakdown = [
  { layer: "Building", emission: 10.2, variance: -0.8, intensity: "-7% vs LY" },
  { layer: "Energy", emission: 11.6, variance: -1.4, intensity: "-9% vs LY" },
  { layer: "Fleet", emission: 6.9, variance: -1.8, intensity: "-12% vs LY" },
  { layer: "Supply Chain", emission: 3.1, variance: 0.3, intensity: "+2% vs LY" },
];

const carbonAccountingRows = [
  {
    name: "Smart Building Optimization",
    layer: "Building",
    emission: 4.8,
    targetVariance: -0.6,
    trend: "On Track",
  },
  {
    name: "Renewable Energy Procurement",
    layer: "Energy",
    emission: 6.2,
    targetVariance: -0.9,
    trend: "Ahead",
  },
  {
    name: "Fleet Electrification",
    layer: "Fleet",
    emission: 3.7,
    targetVariance: -0.8,
    trend: "Scaling",
  },
  {
    name: "Sustainable Fuel Mix",
    layer: "Fleet",
    emission: 2.4,
    targetVariance: -0.4,
    trend: "Stabilizing",
  },
  {
    name: "Supplier Engagement",
    layer: "Supply Chain",
    emission: 1.9,
    targetVariance: 0.2,
    trend: "Watch",
  },
];

const fleetElectrification = {
  adoptionRate: 64,
  targetRate: 80,
  emissionImpact: -2.1,
};

const sustainableFuel = {
  replacementRate: 48,
  targetRate: 65,
  emissionImpact: -1.3,
};

const dataSources = [
  {
    name: "Carbon Data Integrations Platform (CDIP)",
    status: "Sinkron",
    description: "Menggabungkan data sensor IoT, ERP, dan laporan vendor",
  },
  {
    name: "Energy & Fuel Consumption Data",
    status: "Dalam Pemrosesan",
    description: "Data bahan bakar & energi diperbarui setiap 15 menit",
  },
];

const followUpRecommendations = [
  {
    id: 1,
    title: "Aktivasi Renewable Energy Certificates (RECs)",
    description: "Menutup gap 0.8 mtCO₂e terhadap target 2030",
    priority: "High",
    estimatedImpact: "-0.8 mtCO₂e",
    timeline: "Q4 2025",
    actions: [
      "Identifikasi supplier REC terpercaya",
      "Negosiasi kontrak 2-tahun dengan pricing kompetitif",
      "Integrasi dokumentasi REC ke sistem akuntansi karbon",
    ],
  },
  {
    id: 2,
    title: "Program Supplier Low Carbon Action (SLCA)",
    description: "Melibatkan 20 pemasok utama untuk pengurangan emisi Scope 3",
    priority: "High",
    estimatedImpact: "-1.2 mtCO₂e",
    timeline: "Q1-Q2 2026",
    actions: [
      "Seleksi 20 pemasok terbesar berdasarkan kontribusi emisi",
      "Workshop pelatihan sustainability best practices",
      "Implementasi monitoring KPI bulanan per supplier",
    ],
  },
  {
    id: 3,
    title: "Perluas Data Granular CDIP",
    description: "Penelusuran emisi produk per pelanggan secara real-time",
    priority: "Medium",
    estimatedImpact: "Data Intelligence",
    timeline: "Q2-Q3 2026",
    actions: [
      "Upgrade IoT sensor ke 150 lokasi tambahan",
      "Integrasi API dengan sistem ERP pelanggan",
      "Dashboard transparansi emisi per produk",
    ],
  },
  {
    id: 4,
    title: "Scaling Fleet Electrification Wave 3",
    description: "Meningkatkan adopsi EV dari 64% menjadi 75%",
    priority: "High",
    estimatedImpact: "-1.5 mtCO₂e",
    timeline: "Q4 2025 - Q1 2026",
    actions: [
      "Procurement 200 unit EV generasi terbaru",
      "Ekspansi charging infrastructure di 5 regional hub",
      "Program insentif driver adoption",
    ],
  },
];

const apiServices = [
  {
    id: 1,
    name: "Carbon Data API",
    type: "Internal",
    status: "Active",
    description: "REST API untuk akses real-time data emisi dari CDIP",
    endpoint: "/api/v1/carbon-data",
    consumers: ["Dashboard", "Mobile App", "ERP System"],
    documentation: "api.logigreen.local/docs/carbon-data",
  },
  {
    id: 2,
    name: "Supplier Integration API",
    type: "External",
    status: "Active",
    description: "API untuk supplier partners mengirimkan data emisi berkala",
    endpoint: "/api/v1/supplier-emissions",
    consumers: ["Supplier Portal", "Third-party Systems"],
    documentation: "api.logigreen.local/docs/supplier-integration",
  },
  {
    id: 3,
    name: "Compliance Reporting API",
    type: "External",
    status: "Planned",
    description: "API untuk regulatory bodies mengakses laporan kepatuhan",
    endpoint: "/api/v1/compliance-reports",
    consumers: ["Regulatory Agencies", "Audit Partners"],
    documentation: "Coming Q1 2026",
  },
  {
    id: 4,
    name: "Real-time Monitoring API",
    type: "Internal",
    status: "Development",
    description: "WebSocket API untuk live tracking emisi dan IoT sensor data",
    endpoint: "/api/v1/ws/realtime-monitoring",
    consumers: ["Operations Center", "Alert System"],
    documentation: "api.logigreen.local/docs/realtime",
  },
];

const esgReports = [
  {
    id: 1,
    name: "Annual ESG Report 2024",
    type: "Public",
    status: "Published",
    regulatoryStandard: "GRI Standards 3-1, SASB, TCFD",
    releaseDate: "2024-12-15",
    scope: ["Scope 1, 2, 3 Emissions", "Energy", "Waste", "Water", "Labor Practices"],
    accessibility: "https://reports.logigreen.id/esg-2024",
  },
  {
    id: 2,
    name: "Carbon Disclosure Project (CDP) Submission",
    type: "External",
    status: "In Preparation",
    regulatoryStandard: "CDP Climate Change Module",
    releaseDate: "2025-09-30",
    scope: ["Climate Risk Assessment", "Emission Reduction Goals", "Supply Chain"],
    accessibility: "Submission Portal",
  },
  {
    id: 3,
    name: "Net Zero Readiness Assessment",
    type: "Internal",
    status: "Quarterly",
    regulatoryStandard: "Science Based Targets Initiative (SBTi)",
    releaseDate: "Every Quarter",
    scope: ["Target Progress", "Gap Analysis", "Strategic Initiatives"],
    accessibility: "Internal Dashboard",
  },
  {
    id: 4,
    name: "Regulatory Compliance Report (Indonesia)",
    type: "Government",
    status: "Quarterly Submission",
    regulatoryStandard: "Peraturan Pemerintah No. 70 Tahun 2021",
    releaseDate: "30 Hari Setelah Akhir Kuartal",
    scope: ["Emission Inventory", "Reduction Initiatives", "Technology Updates"],
    accessibility: "Government Portal (SIMPIT)",
  },
];

const executiveStatuses = [
  {
    name: "Target 2025",
    description: "Net Zero Readiness",
    status: "On Track",
    tone: "positive" as const,
    detail: "Realisasi 91% dari target pengurangan 2025",
  },
  {
    name: "Target 2030",
    description: "Reduce Emission < 29 mtCO₂e",
    status: "Warning",
    tone: "warning" as const,
    detail: "Perlu tambahan pengurangan 2.8 mtCO₂e",
  },
  {
    name: "GHG Limit",
    description: "Upper Carbon Threshold",
    status: totalEmission >= carbonCeiling ? "Critical" : "Near Limit",
    tone: totalEmission >= carbonCeiling ? ("critical" as const) : ("warning" as const),
    detail: `${Math.round((totalEmission / carbonCeiling) * 100)}% dari batas 32 mtCO₂e`,
  },
];

type Tone = "positive" | "warning" | "critical";

type TabKey = "cockpit" | "reporting" | "api-services" | "esg-hub";

const tabs: { key: TabKey; label: string; description: string }[] = [
  {
    key: "cockpit",
    label: "Cockpit",
    description: "Pandangan Ringkas Eksekutif",
  },
  {
    key: "reporting",
    label: "Reporting",
    description: "Analitik Detail ESG & Operasional",
  },
  {
    key: "api-services",
    label: "API Services",
    description: "Integrasi Internal & External",
  },
  {
    key: "esg-hub",
    label: "ESG HUB",
    description: "Laporan External & Kepatuhan",
  },
];

const cardBase =
  "rounded-3xl border border-emerald-100/60 bg-white/80 p-6 shadow-sm shadow-emerald-900/5 backdrop-blur";

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={`${cardBase}${className ? ` ${className}` : ""}`}>{children}</section>;
}

function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const style =
    tone === "positive"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : tone === "warning"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-rose-100 text-rose-700 border-rose-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${style}`}
    >
      {children}
    </span>
  );
}

function RadialProgress({
  value,
  label,
  caption,
  tone = "positive",
}: {
  value: number;
  label: string;
  caption?: string;
  tone?: Tone;
}) {
  const display = Math.max(0, Math.min(100, Math.round(value)));
  const gradient =
    tone === "positive"
      ? "from-emerald-400 via-emerald-500 to-sky-400"
      : tone === "warning"
        ? "from-amber-400 via-amber-500 to-orange-400"
        : "from-rose-400 via-rose-500 to-red-400";
  const progressColor = tone === "positive" ? "#059669" : tone === "warning" ? "#f59e0b" : "#dc2626";

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient}`}
          style={{
            maskImage: "radial-gradient(circle at center, black 70%, transparent 71%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 70%, transparent 71%)",
            background: `conic-gradient(${progressColor} ${display * 3.6}deg, #e2f5eb ${display * 3.6}deg)`,
          }}
        />
        <div className="absolute inset-1 rounded-full bg-white/90 backdrop-blur" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-slate-900">{display}%</span>
          <span className="text-xs text-slate-500">progress</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{caption}</p>
        <p className="text-xl font-semibold text-slate-900">{label}</p>
      </div>
    </div>
  );
}

function formatMt(value: number) {
  return `${value.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mtCO₂e`;
}

function CockpitView({ onOpenFollowUp }: { onOpenFollowUp: () => void }) {
  const reductionAchievement = emissionBaseline - totalEmission;
  const reductionTarget2025 = emissionBaseline - target2025;
  const reductionTarget2030 = emissionBaseline - target2030;
  const progress2025 = (reductionAchievement / reductionTarget2025) * 100;
  const progress2030 = (reductionAchievement / reductionTarget2030) * 100;

  const carbonAlertLevel = carbonCeiling * 0.95;
  const isNearLimit = totalEmission >= carbonAlertLevel;
  const isOverLimit = totalEmission >= carbonCeiling;

  return (
    <div className="space-y-8">
      {isNearLimit && (
        <Card className={"border-amber-200/80 bg-amber-50/80 shadow-amber-200/40"}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <BellRing className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Carbon Alert</p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {isOverLimit ? "Jejak karbon telah melewati batas atas operasional" : "Jejak karbon mendekati batas atas operasional"}
                </h3>
                <p className="text-sm text-slate-600">
                  Intensitas emisi saat ini {formatMt(totalEmission)} dari batas {formatMt(carbonCeiling)}. Segera aktifkan
                  inisiatif mitigasi tambahan (reduksi bahan bakar fosil atau kompensasi) untuk menjaga jalur Net Zero 2025.
                </p>
              </div>
            </div>
            <button onClick={onOpenFollowUp} className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-amber-200 transition hover:bg-amber-600">
              Rencana Tindak Lanjut
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Emisi Saat Ini</p>
              <h3 className="mt-2 text-3xl font-semibold text-slate-900">{formatMt(totalEmission)}</h3>
              <p className="mt-2 text-sm text-slate-500">Baseline 2022: {formatMt(emissionBaseline)}</p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <Gauge className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <ProgressBar value={(reductionAchievement / emissionBaseline) * 100} tone="positive" />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Realized Decarbonization Effect</span>
              <span>{formatMt(reductionAchievement)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Target 2025</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">{formatMt(target2025)}</h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-emerald-600">Net Zero Emissions GHG 2025</p>
            </div>
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
              <Leaf className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-6">
            <RadialProgress value={progress2025} label="Progress 2025" caption="Pengurangan terwujud" tone="positive" />
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Target 2030</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">{formatMt(target2030)}</h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-sky-600">Reduce Emission &lt; 29 mtCO₂e</p>
            </div>
            <div className="rounded-2xl bg-emerald-200 p-3 text-emerald-700">
              <Activity className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-6">
            <RadialProgress value={progress2030} label="Progress 2030" caption="Pengurangan kumulatif" tone={progress2030 >= 75 ? "positive" : "warning"} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                <LineChartIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Realized Decarbonization Effect (KPI)</h3>
                <p className="text-sm text-slate-500">Analisis tren pengurangan emisi & inisiatif utama</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              <StatusBadge tone="positive">Tren Emisi Aktual</StatusBadge>
              <StatusBadge tone="warning">Pengurangan Kumulatif</StatusBadge>
              <StatusBadge tone="positive">Inisiatif Prioritas</StatusBadge>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600 md:grid-cols-4">
              <div>
                <dt>Capaian Pengurangan</dt>
                <dd className="text-lg font-semibold text-slate-900">{formatMt(reductionAchievement)}</dd>
              </div>
              <div>
                <dt>Kebutuhan Tambahan 2030</dt>
                <dd className="text-lg font-semibold text-slate-900">{formatMt(totalEmission - target2030)}</dd>
              </div>
              <div>
                <dt>Inisiatif Aktif</dt>
                <dd className="text-lg font-semibold text-slate-900">8</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge tone={reductionAchievement / reductionTarget2030 >= 0.75 ? "positive" : "warning"}>
                    {reductionAchievement / reductionTarget2030 >= 0.75 ? "On Track" : "Warning"}
                  </StatusBadge>
                </dd>
              </div>
            </dl>
          </div>
          <div className="h-72 w-full lg:w-3/5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realizedTrendData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#DCFCE7" />
                <XAxis dataKey="month" stroke="#0f766e" tickLine={false} axisLine={false} />
                <YAxis stroke="#0f766e" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}
                  domain={[28, 44]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    borderColor: "#bbf7d0",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.15)",
                  }}
                  formatter={(value: number, name) => [formatMt(value), name === "total" ? "Total Emisi" : "Pengurangan Kumulatif"]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 12 }}
                  formatter={(value) => (value === "total" ? "Total Emisi" : "Realized Effect")}
                />
                <Line type="monotone" dataKey="total" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: "#059669" }} />
                <Line type="monotone" dataKey="realized" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: "#0ea5e9" }} />
                {realizedTrendData
                  .filter((item) => item.initiative)
                  .map((item) => (
                    <ReferenceDot
                      key={item.month}
                      x={item.month}
                      y={item.realized}
                      r={6}
                      fill="#f59e0b"
                      stroke="white"
                      strokeWidth={2}
                      label={{
                        value: item.initiative,
                        position: "top",
                        fill: "#b45309",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Status Pemangku Kepentingan</h3>
              <p className="text-sm text-slate-500">Ringkasan KPI dan status pencapaian target 2025 / 2030</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {executiveStatuses.map((item) => (
              <div key={item.name} className="rounded-2xl border border-emerald-100/80 bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{item.name}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{item.status}</p>
                <p className="mt-2 text-xs text-slate-600">{item.description}</p>
                <StatusBadge tone={item.tone}>{item.detail}</StatusBadge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Integrasi Data</h3>
              <p className="text-sm text-slate-500">Data terakhir diperbarui</p>
              <p className="mt-2 text-sm font-semibold text-emerald-700">23 November 2025, 10:00 WIB</p>
              <ul className="mt-4 space-y-3 text-sm">
                {dataSources.map((source) => (
                  <li key={source.name} className="rounded-2xl bg-slate-50/70 p-3">
                    <p className="font-semibold text-slate-900">{source.name}</p>
                    <p className="text-xs uppercase tracking-wide text-emerald-600">Status: {source.status}</p>
                    <p className="mt-1 text-xs text-slate-500">{source.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Fleet Electrification Management</h3>
              <p className="text-sm text-slate-500">Detail rasio adopsi kendaraan listrik</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <ProgressStat label="Rasio Adopsi EV" value={fleetElectrification.adoptionRate} suffix="% dari 80%" tone="positive" />
            <ProgressStat label="Dampak Pengurangan Emisi" value={fleetElectrification.emissionImpact} suffix="mtCO₂e" tone="positive" isDelta />
            <p className="text-xs text-slate-500">
              Fokus Q4: mempercepat elektrifikasi armada logistik regional dan integrasi pengisian daya berbasis energi terbarukan.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
              <Fuel className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Sustainable Fuel Procurement</h3>
              <p className="text-sm text-slate-500">Penggantian bahan bakar fosil & dampak emisi</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <ProgressStat label="Sustainable Fuel Mix" value={sustainableFuel.replacementRate} suffix="% dari 65%" tone="warning" />
            <ProgressStat label="Dampak Pengurangan Emisi" value={sustainableFuel.emissionImpact} suffix="mtCO₂e" tone="positive" isDelta />
            <p className="text-xs text-slate-500">
              Perluasan kontrak biofuel untuk armada laut & udara guna mengejar gap 17% terhadap target 2030.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ApiServicesView() {
  return (
    <div className="space-y-8">
      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">API Services Platform</h3>
            <p className="text-sm text-slate-500">Integrasi sistem internal dan eksternal untuk pertukaran data real-time</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          {apiServices.map((api) => (
            <div key={api.id} className="rounded-2xl border border-sky-100/70 bg-sky-50/40 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      api.type === "Internal"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-sky-100 text-sky-700"
                    }`}>
                      {api.type}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">{api.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{api.description}</p>

                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                      <StatusBadge tone={api.status === "Active" ? "positive" : api.status === "Development" ? "warning" : "critical"}>
                        {api.status}
                      </StatusBadge>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Endpoint</p>
                      <code className="mt-1 block text-xs font-mono text-slate-700 bg-white/60 rounded px-2 py-1">
                        {api.endpoint}
                      </code>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dokumentasi</p>
                      <p className="mt-1 text-sm text-slate-600">{api.documentation}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Konsumen</p>
                    <div className="flex flex-wrap gap-2">
                      {api.consumers.map((consumer) => (
                        <span key={consumer} className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                          {consumer}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Integration Guidelines</h3>
            <p className="text-sm text-slate-500">Panduan implementasi untuk developer</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100/70 bg-emerald-50/60 p-4">
            <h4 className="font-semibold text-slate-900">Internal Integration</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-emerald-600">▪</span>
                <span>Autentikasi via OAuth 2.0 dengan token akses 24 jam</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-emerald-600">▪</span>
                <span>Rate limiting: 10,000 requests/jam per aplikasi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-emerald-600">▪</span>
                <span>Response format JSON dengan error handling standar</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-sky-100/70 bg-sky-50/60 p-4">
            <h4 className="font-semibold text-slate-900">External Integration</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-sky-600">▪</span>
                <span>API Key dengan IP whitelist untuk keamanan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-sky-600">▪</span>
                <span>Rate limiting: 1,000 requests/jam per partner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-sky-600">▪</span>
                <span>Webhook support untuk event-driven integration</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

function EsgHubView() {
  return (
    <div className="space-y-8">
      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">ESG HUB - Laporan & Kepatuhan</h3>
            <p className="text-sm text-slate-500">Manajemen laporan eksternal dan kepatuhan regulasi serta standar internasional</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          {esgReports.map((report) => (
            <div key={report.id} className="rounded-2xl border border-emerald-100/70 bg-white/80 p-6 shadow-sm shadow-emerald-200/40">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      report.type === "Public"
                        ? "bg-emerald-100 text-emerald-700"
                        : report.type === "External"
                        ? "bg-sky-100 text-sky-700"
                        : report.type === "Internal"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {report.type}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">{report.name}</h3>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                      <StatusBadge tone={report.status === "Published" ? "positive" : report.status === "Quarterly Submission" ? "positive" : "warning"}>
                        {report.status}
                      </StatusBadge>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rilis</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{report.releaseDate}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Standar Regulasi</p>
                      <p className="mt-1 text-sm text-slate-600">{report.regulatoryStandard}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Cakupan Laporan</p>
                    <div className="flex flex-wrap gap-2">
                      {report.scope.map((item) => (
                        <span key={item} className="inline-flex rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1 text-xs text-emerald-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Aksesibilitas</p>
                    <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700 transition">
                      {report.accessibility}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Compliance Framework</h3>
              <p className="text-sm text-slate-500">Kerangka kerja kepatuhan internasional</p>
            </div>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-900">GRI Standards</p>
                <p className="text-xs text-slate-500">Global Reporting Initiative - Disclosure 3-1 & 3-2</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-900">SASB Standards</p>
                <p className="text-xs text-slate-500">Sustainability Accounting Standards Board</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-900">TCFD Framework</p>
                <p className="text-xs text-slate-500">Task Force on Climate-related Financial Disclosures</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-900">SBTi Initiative</p>
                <p className="text-xs text-slate-500">Science-Based Targets Validation</p>
              </div>
            </li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
              <CircleAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Regulatory Calendar</h3>
              <p className="text-sm text-slate-500">Jadwal kepatuhan regulasi utama</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-amber-100/70 bg-amber-50/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-amber-900">Q1 2026 - CDP Climate Submission</p>
                  <p className="mt-1 text-xs text-amber-700">Batas: 31 Mei 2026</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100/70 bg-amber-50/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-amber-900">Q4 2025 - Laporan Pemerintah</p>
                  <p className="mt-1 text-xs text-amber-700">Batas: 30 Desember 2025</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100/70 bg-emerald-50/60 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-emerald-900">2026 Annual ESG Report</p>
                  <p className="mt-1 text-xs text-emerald-700">Target: Desember 2026</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReportingView() {
  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Carbon Accounting & Reporting</h3>
                <p className="text-sm text-slate-500">
                  Filter emisi berdasarkan Decarbonization Layers, Customer & Product Data Carbon
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {["Building", "Energy", "Fleet", "Supply Chain"].map((layer) => (
                <span
                  key={layer}
                  className="rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1 font-medium text-emerald-700"
                >
                  {layer}
                </span>
              ))}
              <span className="rounded-full border border-sky-200/70 bg-sky-50/70 px-3 py-1 font-medium text-sky-700">
                Customer &amp; Product Data
              </span>
            </div>
          </div>
          <div className="grid gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              <span>Emisi aktual</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-sky-500" />
              <span>Target resmi</span>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="rounded-3xl bg-emerald-50/60 p-4">
            <h4 className="text-sm font-semibold text-emerald-700">Emisi per Decarbonization Layer</h4>
            <ul className="mt-3 space-y-3 text-sm">
              {layerBreakdown.map((item) => (
                <li key={item.layer} className="rounded-2xl bg-white/80 p-3 shadow-sm shadow-emerald-200/40">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{item.layer}</span>
                    <span className="font-semibold text-slate-700">{formatMt(item.emission)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Varian target {item.variance > 0 ? "+" : ""}{formatMt(item.variance)}</span>
                    <span>{item.intensity}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="h-64 w-full rounded-3xl bg-white/80 p-4 shadow-sm shadow-emerald-900/5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scopeBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#bae6fd" />
                <XAxis dataKey="scope" stroke="#0369a1" tickLine={false} axisLine={false} />
                <YAxis stroke="#0369a1" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    borderColor: "#bfdbfe",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.15)",
                  }}
                  formatter={(value: number, name) => [formatMt(value), name === "current" ? "Aktual" : "Target"]}
                />
                <Legend wrapperStyle={{ paddingTop: 8 }} formatter={(value) => (value === "current" ? "Aktual" : "Target 2030")}
                />
                <Bar dataKey="current" fill="#10b981" radius={[12, 12, 0, 0]} barSize={26} />
                <Bar dataKey="target" fill="#0ea5e9" radius={[12, 12, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Go Green Dashboard &amp; Reporting</h3>
            <p className="text-sm text-slate-500">
              Drill-down detail untuk audit ESG, carbon accounting, dan perencanaan dekarbonisasi
            </p>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/90">
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-50 text-xs uppercase tracking-wide text-emerald-700">
              <tr>
                <th className="px-6 py-3">Program / Inisiatif</th>
                <th className="px-6 py-3">Layer</th>
                <th className="px-6 py-3">Emisi Saat Ini</th>
                <th className="px-6 py-3">Varian Target</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {carbonAccountingRows.map((row, index) => (
                <tr key={row.name} className={index % 2 === 0 ? "bg-white" : "bg-emerald-50/50"}>
                  <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                  <td className="px-6 py-4 text-slate-600">{row.layer}</td>
                  <td className="px-6 py-4 text-slate-600">{formatMt(row.emission)}</td>
                  <td className="px-6 py-4 text-slate-600">{row.targetVariance > 0 ? "+" : ""}{formatMt(row.targetVariance)}</td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge tone={row.trend === "Watch" ? "warning" : "positive"}>{row.trend}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Rencana Implementasi Lapisan Dekarbonisasi</h3>
              <p className="text-sm text-slate-500">Fleet Electrification • Sustainable Fuel • Smart Building</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ImplementationPill
              title="Fleet Electrification"
              description="Perluasan charging hub & integrasi telematika"
              progress={64}
              tone="positive"
            />
            <ImplementationPill
              title="Sustainable Fuel Procurement"
              description="Kontrak biofuel & SAF untuk operasi logistik"
              progress={48}
              tone="warning"
            />
            <ImplementationPill
              title="Building Efficiency"
              description="Optimasi HVAC & microgrid"
              progress={71}
              tone="positive"
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
              <CircleAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Insight &amp; Rekomendasi</h3>
              <p className="text-sm text-slate-500">Tindakan prioritas 30 hari</p>
            </div>
          </div>
          <ul className="mt-6 space-y-4 text-sm text-slate-600">
            <li>
              • Aktifkan opsi Renewable Energy Certificates untuk menutup gap 0.8 mtCO₂e terhadap target 2030.
            </li>
            <li>• Libatkan 20 pemasok utama pada program Supplier Low Carbon Action (SLCA).</li>
            <li>
              • Perluas data granular pada CDIP untuk penelusuran emisi produk per pelanggan secara real-time.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function ProgressBar({ value, tone = "positive" }: { value: number; tone?: Tone }) {
  const normalized = Math.max(0, Math.min(100, value));
  const barColor = tone === "positive" ? "from-emerald-400 to-emerald-600" : tone === "warning" ? "from-amber-400 to-amber-600" : "from-rose-400 to-rose-600";

  return (
    <div className="h-2 rounded-full bg-slate-200/70">
      <div
        className={`h-2 rounded-full bg-gradient-to-r ${barColor}`}
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}

function ProgressStat({
  label,
  value,
  suffix,
  tone = "positive",
  isDelta = false,
}: {
  label: string;
  value: number;
  suffix: string;
  tone?: Tone;
  isDelta?: boolean;
}) {
  const display = isDelta ? `${value < 0 ? "-" : ""}${Math.abs(value).toFixed(1)} ${suffix}` : `${value.toFixed(0)}${suffix ? ` ${suffix}` : ""}`;
  const nuance = tone === "positive" ? "text-emerald-600" : tone === "warning" ? "text-amber-600" : "text-rose-600";
  const progressValue = Math.max(0, Math.min(100, isDelta ? Math.abs(value) * 12 : value));

  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-xl font-semibold ${nuance}`}>{display}</p>
      <ProgressBar value={progressValue} tone={tone} />
    </div>
  );
}

function ImplementationPill({ title, description, progress, tone }: { title: string; description: string; progress: number; tone: Tone }) {
  const nuance = tone === "positive" ? "text-emerald-600" : tone === "warning" ? "text-amber-600" : "text-rose-600";
  return (
    <div className="rounded-2xl border border-emerald-100/70 bg-white/90 p-4 shadow-sm shadow-emerald-200/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-2xl font-semibold ${nuance}`}>{progress}%</span>
        <span className="text-xs uppercase tracking-wide text-slate-400">Progress</span>
      </div>
      <ProgressBar value={progress} tone={tone} />
    </div>
  );
}

function FollowUpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-3xl border border-emerald-200/60 bg-white/95 shadow-2xl">
        <div className="flex items-center justify-between border-b border-emerald-100/60 px-8 py-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Rencana Tindak Lanjut</h2>
            <p className="mt-1 text-sm text-slate-600">Usulan rencana rekomendasi untuk mencapai target emisi 2025 & 2030</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-8">
          <div className="space-y-6">
            {followUpRecommendations.map((recommendation) => (
              <div key={recommendation.id} className="rounded-2xl border border-emerald-100/70 bg-emerald-50/40 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${recommendation.priority === "High" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{recommendation.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{recommendation.description}</p>

                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prioritas</p>
                        <StatusBadge tone={recommendation.priority === "High" ? "critical" : "warning"}>
                          {recommendation.priority}
                        </StatusBadge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimasi Dampak</p>
                        <p className="mt-1 font-semibold text-emerald-600">{recommendation.estimatedImpact}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timeline</p>
                        <p className="mt-1 font-semibold text-slate-900">{recommendation.timeline}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Rencana Aksi</p>
                      <ul className="space-y-2">
                        {recommendation.actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-emerald-100/60 px-8 py-4">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-500/30 transition hover:bg-emerald-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("cockpit");
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  const mainClass = useMemo(
    () =>
      "mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-10",
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-white text-slate-900">
      <header className="border-b border-emerald-100/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 p-4 text-white shadow-lg shadow-emerald-500/30">
              <Leaf className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">LogiGreen</p>
              <h1 className="text-3xl font-semibold text-slate-900">Decarbonization KPI Cockpit</h1>
              <p className="mt-1 text-sm text-slate-500">
                Dashboard utama untuk memantau kemajuan menuju Net Zero Emissions GHG 2025 &amp; Reduce Emission &lt; 29 mtCO₂e 2030.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50/80 p-4 text-sm text-slate-600">
              <p className="font-semibold text-emerald-700">Data Terakhir Diperbarui</p>
              <p>23 November 2025, 10:00 WIB</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">Sumber: CDIP &amp; Energy &amp; Fuel Consumptions Data</p>
            </div>
          </div>
        </div>
      </header>

      <main className={mainClass}>
        <nav className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`group rounded-full border px-6 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "border-emerald-200 bg-white/60 text-emerald-700 hover:bg-emerald-100/80"
                }`}
              >
                <span className="block text-sm font-semibold">{tab.label}</span>
                <span className={`block text-xs ${isActive ? "text-emerald-50" : "text-emerald-700/70"}`}>{tab.description}</span>
              </button>
            );
          })}
        </nav>

        {activeTab === "cockpit" && <CockpitView onOpenFollowUp={() => setShowFollowUpModal(true)} />}
        {activeTab === "reporting" && <ReportingView />}
        {activeTab === "api-services" && <ApiServicesView />}
        {activeTab === "esg-hub" && <EsgHubView />}
      </main>

      <FollowUpModal isOpen={showFollowUpModal} onClose={() => setShowFollowUpModal(false)} />
    </div>
  );
}

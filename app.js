(() => {
  const TARGET_2030 = 29;
  const TARGET_2025 = 0;
  const EMISSION_POINTS = 1825; // ~5 tahun data harian untuk ribuan data dummy
  const RECORD_COUNT = 1800;

  Chart.defaults.font.family = 'Poppins, sans-serif';
  Chart.defaults.color = 'rgba(248, 251, 249, 0.78)';
  Chart.defaults.borderColor = 'rgba(248, 251, 249, 0.12)';

  const emissionSeries = generateEmissionSeries(EMISSION_POINTS, TARGET_2030);
  const carbonRecords = generateCarbonRecords(RECORD_COUNT);
  const assetSites = generateAssetSites();
  const initiatives = createInitiatives();

  const baselineEmission = emissionSeries[0].value;
  const currentEmission = emissionSeries[emissionSeries.length - 1].value;
  const realizedReduction = Number((baselineEmission - currentEmission).toFixed(2));
  const realizedEffectPercent = Math.max(0, Math.min(100, (realizedReduction / baselineEmission) * 100));
  const progress2030 = clamp((baselineEmission - currentEmission) / (baselineEmission - TARGET_2030), 0, 1);
  const deltaToTarget = Number((currentEmission - TARGET_2030).toFixed(2));
  const progress2025 = clamp((baselineEmission - currentEmission) / (baselineEmission - TARGET_2025 || baselineEmission), 0, 1);
  const additionalReduction = Math.max(0, Number((currentEmission - TARGET_2025).toFixed(2)));
  const averageDailyReduction = (realizedReduction / EMISSION_POINTS) || 0;
  const averageAnnualDrop = averageDailyReduction * 365;

  const topRiskRecord = carbonRecords.reduce((worst, record) => {
    if (!worst) return record;
    return record.variance > worst.variance ? record : worst;
  }, null);

  const fleetInsights = computeFleetInsights(carbonRecords);
  const statusSummaries = {
    executive: assessStatus(deltaToTarget, { ok: 0, warning: 1.5 }),
    esg: assessStatus(Math.abs(realizedEffectPercent - 65), { ok: 10, warning: 18 }),
    operations: assessStatus(fleetInsights.riskScore, { ok: 25, warning: 45 })
  };

  hydrateSidebar(averageAnnualDrop);
  hydrateKpiCards({
    currentEmission,
    target2030: TARGET_2030,
    deltaToTarget,
    realizedReduction,
    realizedEffectPercent,
    progress2030,
    progress2025,
    additionalReduction,
    statusSummaries,
    fleetInsights,
    initiatives
  });

  const trendChart = renderEmissionTrendChart(emissionSeries, TARGET_2030, initiatives, baselineEmission);
  const gaugeChart = renderGaugeChart(progress2030, currentEmission, TARGET_2030);
  const scopeChart = renderScopeBreakdownChart(carbonRecords);

  renderCarbonTable('all', carbonRecords);
  renderTableMeta('all', carbonRecords);
  renderFleetSection(fleetInsights);
  const mapInstance = renderAssetMap(assetSites);
  renderTimelineCards();
  renderIntegrationOverview(carbonRecords, fleetInsights);

  const notifications = buildNotifications({
    currentEmission,
    deltaToTarget,
    progress2030,
    progress2025,
    topRiskRecord,
    fleetInsights
  });
  renderNotifications(notifications);

  initNavigation((target) => {
    if (target === 'reporting-view' && mapInstance) {
      setTimeout(() => mapInstance.invalidateSize(), 200);
    }
  });
  initFilters(scopeChart, carbonRecords);

  function hydrateSidebar(avgAnnualDrop) {
    const forecastDropEl = document.getElementById('forecastDrop');
    if (forecastDropEl) {
      forecastDropEl.innerHTML = `${formatNumber(avgAnnualDrop, 2)} mtCO<sub>2</sub>e/tahun`;
    }
  }

  function hydrateKpiCards(payload) {
    const {
      currentEmission,
      target2030,
      deltaToTarget,
      realizedReduction,
      realizedEffectPercent,
      progress2030,
      progress2025,
      additionalReduction,
      statusSummaries,
      fleetInsights,
      initiatives
    } = payload;

    setText('currentEmissionValue', formatNumber(currentEmission, 2));
    setText('target2030Value', `${formatNumber(target2030, 0)} mtCO<sub>2</sub>e`);
    setText('deltaToTarget', `${deltaToTarget >= 0 ? '+' : ''}${formatNumber(deltaToTarget, 2)} mtCO<sub>2</sub>e`);
    setStatusPill('currentEmissionBadge', deltaToTarget <= 0 ? 'ok' : deltaToTarget <= 1.5 ? 'warning' : 'critical', deltaToTarget <= 0 ? 'OK' : deltaToTarget <= 1.5 ? 'Warning' : 'Critical');
    setText('targetStatus', deltaToTarget <= 0 ? 'Target tercapai' : deltaToTarget <= 1.5 ? 'Mendekati target' : 'Di atas batas');

    setText('realizedEffectValue', `${formatNumber(realizedEffectPercent, 1)}%`);
    setText('realizedReduction', `${formatNumber(realizedReduction, 2)} mtCO<sub>2</sub>e`);
    setStatusPill('realizedStatus', realizedEffectPercent >= 65 ? 'ok' : realizedEffectPercent >= 50 ? 'warning' : 'critical', realizedEffectPercent >= 65 ? 'OK' : realizedEffectPercent >= 50 ? 'Warning' : 'Critical');

    const progress2025Fill = document.getElementById('progress2025Fill');
    if (progress2025Fill) {
      progress2025Fill.style.width = `${Math.min(100, Math.round(progress2025 * 100))}%`;
    }
    setText('roadTo2025', `${formatNumber(progress2025 * 100, 1)}%`);
    setText('additionalReduction', `${formatNumber(additionalReduction, 2)} mtCO<sub>2</sub>e`);
    const status2025 = progress2025 >= 1 ? 'ok' : progress2025 >= 0.82 ? 'warning' : 'critical';
    setStatusPill('target2025Badge', status2025, status2025 === 'ok' ? 'OK' : status2025 === 'warning' ? 'Warning' : 'Critical');

    setStatusPill('execStatus', statusSummaries.executive.severity, statusSummaries.executive.label);
    setStatusPill('esgStatus', statusSummaries.esg.severity, statusSummaries.esg.label);
    setStatusPill('opsStatus', statusSummaries.operations.severity, statusSummaries.operations.label);

    const riskBadge = document.getElementById('headerRiskBadge');
    if (riskBadge) {
      const headerStatus = deltaToTarget <= 0 ? { severity: 'ok', label: 'Dalam Batas' } : deltaToTarget <= 1 ? { severity: 'warning', label: 'Mendekati Batas' } : { severity: 'critical', label: 'Area Risiko Tinggi' };
      riskBadge.textContent = headerStatus.label;
      riskBadge.classList.remove('badge--ok', 'badge--warning', 'badge--critical');
      riskBadge.classList.add(headerStatus.severity === 'ok' ? 'badge--ok' : headerStatus.severity === 'warning' ? 'badge--warning' : 'badge--critical');
    }

    const realTimeAlert = document.getElementById('realTimeAlert');
    if (realTimeAlert && deltaToTarget > 0) {
      realTimeAlert.innerHTML = `Emisi ${formatNumber(currentEmission, 1)} mtCO<sub>2</sub>e (${formatNumber((currentEmission / target2030) * 100, 1)}% dari target)`;
    } else if (realTimeAlert) {
      realTimeAlert.textContent = 'Tidak ada alert kritis';
    }

    if (initiatives?.length) {
      const listEl = document.getElementById('initiativeList');
      if (listEl) {
        listEl.innerHTML = '';
        initiatives.forEach((item) => {
          const li = document.createElement('li');
          li.innerHTML = `
            <div>
              <h4>${item.title}</h4>
              <p>${item.subtitle}</p>
            </div>
            <span class="impact">-${formatNumber(item.impact, 2)}<span> mtCO<sub>2</sub>e</span></span>
          `;
          listEl.appendChild(li);
        });
      }
    }

    const topRiskAssetEl = document.getElementById('topRiskAsset');
    if (topRiskAssetEl) {
      topRiskAssetEl.textContent = `${fleetInsights.topRisk.location} (${fleetInsights.topRisk.layer})`;
    }

    ['fleetImpactBadge', 'fuelImpactBadge', 'buildingImpactBadge'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const baseLabel = el.dataset.label || el.textContent;
        el.dataset.label = baseLabel;
        el.innerHTML = `${baseLabel} • ${formatNumber(fleetInsights.impacts[id] || 0, 1)} mtCO<sub>2</sub>e`;
      }
    });
  }

  function renderEmissionTrendChart(series, target2030, initiatives, baseline) {
    const ctx = document.getElementById('emissionTrendChart');
    if (!ctx) return null;

    const labels = series.map((item) => item.label);
    const emissionValues = series.map((item) => item.value);
    const effectValues = series.map((item) => Number((baseline - item.value).toFixed(2)));
    const targetLine = new Array(series.length).fill(target2030);

    const initiativeIndexLookup = initiatives.reduce((acc, item) => {
      acc[item.index] = item;
      return acc;
    }, {});

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Emisi Aktual',
            data: emissionValues,
            tension: 0.35,
            borderColor: '#39d0ff',
            borderWidth: 2,
            backgroundColor: 'rgba(57, 208, 255, 0.15)',
            fill: false,
            pointRadius: (ctx) => (initiativeIndexLookup[ctx.dataIndex] ? 5 : 0),
            pointHoverRadius: 6,
            pointBackgroundColor: (ctx) => (initiativeIndexLookup[ctx.dataIndex] ? '#ffce54' : '#39d0ff'),
            pointBorderWidth: 2,
            segment: {
              borderColor: (ctx) => {
                const init = initiativeIndexLookup[ctx.p1DataIndex];
                return init ? '#ffce54' : undefined;
              }
            }
          },
          {
            label: 'Realized Decarbonization Effect',
            data: effectValues,
            tension: 0.35,
            borderColor: 'rgba(77, 243, 157, 0.9)',
            backgroundColor: 'rgba(77, 243, 157, 0.25)',
            yAxisID: 'y1',
            fill: true,
            pointRadius: 0,
            borderWidth: 2
          },
          {
            label: 'Target 2030',
            data: targetLine,
            borderDash: [6, 6],
            borderColor: 'rgba(255, 255, 255, 0.38)',
            borderWidth: 1.6,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 8,
              callback: (value, index) => {
                if (index % 180 === 0) {
                  return labels[index];
                }
                return '';
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.08)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Emisi (mtCO₂e)',
              color: 'rgba(248, 251, 249, 0.8)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.08)'
            }
          },
          y1: {
            position: 'right',
            title: {
              display: true,
              text: 'Realized Effect (mtCO₂e)',
              color: 'rgba(248, 251, 249, 0.8)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (tooltip) => `Tanggal ${tooltip[0].label}`,
              label: (context) => {
                if (context.dataset.label === 'Target 2030') {
                  return `Target 2030: ${formatNumber(context.raw, 1)} mtCO₂e`;
                }
                if (context.dataset.label === 'Realized Decarbonization Effect') {
                  return `Realized Effect: ${formatNumber(context.raw, 1)} mtCO₂e`;
                }
                const initiative = initiativeIndexLookup[context.dataIndex];
                if (initiative) {
                  return `${context.dataset.label}: ${formatNumber(context.raw, 1)} mtCO₂e (Initiative: ${initiative.title})`;
                }
                return `${context.dataset.label}: ${formatNumber(context.raw, 1)} mtCO₂e`;
              }
            }
          },
          decimation: {
            enabled: true,
            algorithm: 'lttb',
            samples: 250
          }
        }
      }
    });
  }

  function renderGaugeChart(progress, currentEmission, target2030) {
    const ctx = document.getElementById('kpiGaugeChart');
    if (!ctx) return null;

    const value = Math.round(progress * 100);
    const clamped = Math.min(100, Math.max(0, value));

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Progress', 'Remaining'],
        datasets: [
          {
            data: [clamped, 100 - clamped],
            backgroundColor: ['rgba(77, 243, 157, 0.9)', 'rgba(255, 255, 255, 0.08)'],
            borderWidth: 0,
            cutout: '72%',
            circumference: 180,
            rotation: 270
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      }
    });

    setText('gaugeValueLabel', `${formatNumber(value, 0)}%`);
    setText('gaugeEmissionLabel', `${formatNumber(currentEmission, 2)} mtCO<sub>2</sub>e`);
    setText('gaugeResidue', `${formatNumber(Math.max(0, currentEmission - target2030), 2)} mtCO<sub>2</sub>e`);

    return chart;
  }

  function renderScopeBreakdownChart(records) {
    const ctx = document.getElementById('scopeBreakdownChart');
    if (!ctx) return null;

    const totals = summarizeScopes(records);

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Scope 1', 'Scope 2', 'Scope 3'],
        datasets: [
          {
            label: 'Emisi Aktual',
            data: totals.actual,
            backgroundColor: ['rgba(57, 208, 255, 0.6)', 'rgba(77, 243, 157, 0.6)', 'rgba(255, 206, 84, 0.6)'],
            borderRadius: 12,
            maxBarThickness: 36
          },
          {
            label: 'Target',
            data: totals.target,
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            borderRadius: 12,
            maxBarThickness: 36
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.08)'
            }
          }
        }
      }
    });
  }

  function renderCarbonTable(layer, records) {
    const body = document.querySelector('#carbon-table tbody');
    if (!body) return;

    const filtered = layer === 'all' ? records : records.filter((item) => item.layer === layer);
    const truncated = filtered.slice(0, 60);

    body.innerHTML = '';
    truncated.forEach((record) => {
      const tr = document.createElement('tr');
      const varianceClass = record.variance > 0.8 ? 'status-critical' : record.variance > 0.2 ? 'status-warning' : 'status-ok';
      const varianceLabel = record.variance > 0.8 ? 'Critical' : record.variance > 0.2 ? 'Warning' : 'OK';
      tr.innerHTML = `
        <td>${record.layer}</td>
        <td>${record.source}</td>
        <td>${record.scope}</td>
        <td>${record.location}</td>
        <td>${formatNumber(record.emission, 2)}<span class="unit"> mtCO<sub>2</sub>e</span></td>
        <td>${formatNumber(record.target, 2)}<span class="unit"> mtCO<sub>2</sub>e</span></td>
        <td><span class="status-pill ${varianceClass}">${varianceLabel}</span> ${record.variance >= 0 ? '+' : ''}${formatNumber(record.variance, 2)}<span class="unit"> mtCO<sub>2</sub>e</span></td>
      `;
      body.appendChild(tr);
    });

    setText('recordCountChip', `${records.length.toLocaleString('id-ID')} data dummy`);
  }

  function renderTableMeta(layer, records) {
    const meta = document.getElementById('tableMeta');
    if (!meta) return;
    const filtered = layer === 'all' ? records : records.filter((item) => item.layer === layer);
    meta.textContent = `Menampilkan ${Math.min(60, filtered.length)} dari ${filtered.length} data dummy (total ${records.length} baris).`;
  }

  function initFilters(scopeChart, records) {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const layer = chip.dataset.layer;
        renderCarbonTable(layer, records);
        renderTableMeta(layer, records);
        updateScopeChart(scopeChart, records, layer);
      });
    });
  }

  function updateScopeChart(chart, records, layer) {
    if (!chart) return;
    const filtered = layer === 'all' ? records : records.filter((item) => item.layer === layer);
    const totals = summarizeScopes(filtered);
    chart.data.datasets[0].data = totals.actual;
    chart.data.datasets[1].data = totals.target;
    chart.update();
  }

  function renderFleetSection(fleetInsights) {
    setText('evAdoption', `${formatNumber(fleetInsights.adoptionRate, 1)}%`);
    setText('sustainableFuelImpact', `${formatNumber(fleetInsights.impact, 2)} mtCO<sub>2</sub>e`);
    setText('evTargetLabel', `${formatNumber(fleetInsights.adoptionTarget, 0)}%`);
    setText('fuelBlendLabel', `${formatNumber(fleetInsights.sustainableBlend, 1)}%`);

    const evFill = document.getElementById('evProgressFill');
    if (evFill) {
      evFill.style.width = `${clamp((fleetInsights.adoptionRate / fleetInsights.adoptionTarget) * 100, 0, 100)}%`;
    }
    const fuelFill = document.getElementById('fuelProgressFill');
    if (fuelFill) {
      fuelFill.style.width = `${clamp((fleetInsights.sustainableBlend / fleetInsights.sustainableTarget) * 100, 0, 100)}%`;
    }

    const fleetStatus = fleetInsights.adoptionRate >= fleetInsights.adoptionTarget ? 'ok' : fleetInsights.adoptionRate >= fleetInsights.adoptionTarget * 0.8 ? 'warning' : 'critical';
    setStatusPill('fleetStatus', fleetStatus, fleetStatus === 'ok' ? 'OK' : fleetStatus === 'warning' ? 'Warning' : 'Critical');

    const list = document.getElementById('fleetMetricList');
    if (list) {
      list.innerHTML = '';
      fleetInsights.metrics.forEach((metric) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${metric.label}</span><span>${metric.value}</span>`;
        list.appendChild(li);
      });
    }
  }

  function renderAssetMap(sites) {
    const container = document.getElementById('asset-map');
    if (!container) return null;

    const map = L.map(container, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: false
    }).setView([1.5, 115], 3);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    sites.forEach((site) => {
      const color = site.status === 'Critical' ? '#ff6b6b' : site.status === 'Warning' ? '#f6c044' : '#4df39d';
      L.circleMarker([site.lat, site.lng], {
        radius: 6 + site.emission * 0.8,
        color,
        fillColor: color,
        fillOpacity: 0.85,
        weight: 1.8
      })
        .addTo(map)
        .bindPopup(`
          <strong>${site.name}</strong><br />
          Layer: ${site.layer}<br />
          Emisi: ${formatNumber(site.emission, 2)} mtCO₂e<br />
          Reduksi: ${formatNumber(site.reduction, 2)} mtCO₂e<br />
          Status: ${site.status}
        `);
    });

    return map;
  }

  function renderTimelineCards() {
    renderTimeline('cdipTimeline', [
      'Streaming sensor energi area Asia Tenggara (5 menit lalu)',
      'Integrasi offset marketplace (30 menit lalu)',
      'Sinkronisasi faktor emisi regional (Hari ini 07.30 WIB)'
    ]);
    renderTimeline('energyTimeline', [
      'Hasil audit utilitas gedung HQ (1 jam lalu)',
      'Update konsumsi bahan bakar depot Timur (3 jam lalu)',
      'Pembacaan smart meter gedung data center (Kemarin)'
    ]);
    renderTimeline('customerTimeline', [
      'Refresh data karbon pelanggan strategis (Hari ini)',
      'Pembaruan faktor emisi produk kategori pendingin (2 hari lalu)',
      'Sinkronisasi data vendor offset pelanggan (4 hari lalu)'
    ]);
  }

  function renderTimeline(elementId, items) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      container.appendChild(li);
    });
  }

  function renderIntegrationOverview(records, fleetInsights) {
    const container = document.getElementById('integrationGrid');
    const summary = document.getElementById('integrationSummary');
    if (!container || !summary) return;

    const integrations = [
      {
        name: 'CDIP - Operational Streams',
        owner: 'Sustainability Data Team',
        freshness: 'Tersinkron 5 menit lalu',
        latency: 'Latency rata-rata 280 ms',
        health: 'ok'
      },
      {
        name: 'Energy & Fuel Platform',
        owner: 'Energy Operations',
        freshness: 'Anomali konsumsi BBM (Fleet Timur)',
        latency: 'Latency 1.3 detik',
        health: fleetInsights.adoptionRate >= fleetInsights.adoptionTarget * 0.8 ? 'warning' : 'critical'
      },
      {
        name: 'Customer Carbon Ledger',
        owner: 'ESG Reporting',
        freshness: 'Data disclosure pelanggan premium lengkap',
        latency: 'Batch harian 02.00 WIB',
        health: 'ok'
      },
      {
        name: 'Product Lifecycle LCA',
        owner: 'Product Sustainability',
        freshness: 'Model intensitas karbon v2.4',
        latency: 'Update mingguan',
        health: 'ok'
      }
    ];

    container.innerHTML = '';
    let warningCount = 0;
    integrations.forEach((integration) => {
      if (integration.health !== 'ok') warningCount += 1;
      const div = document.createElement('div');
      div.classList.add('integration-item');
      if (integration.health === 'warning') {
        div.classList.add('status-warning');
      }
      if (integration.health === 'critical') {
        div.classList.add('status-critical');
      }
      const pillClass = integration.health === 'ok' ? 'status-ok' : integration.health === 'warning' ? 'status-warning' : 'status-critical';
      div.innerHTML = `
        <h4>${integration.name}</h4>
        <p>Owner: ${integration.owner}</p>
        <p>${integration.freshness}</p>
        <p>${integration.latency}</p>
        <span class="status-pill ${pillClass}">${integration.health === 'ok' ? 'Healthy' : integration.health === 'warning' ? 'Warning' : 'Critical'}</span>
      `;
      container.appendChild(div);
    });

    summary.textContent = `${integrations.length} sumber data • ${warningCount} butuh perhatian`;
  }

  function buildNotifications({ currentEmission, deltaToTarget, progress2030, progress2025, topRiskRecord, fleetInsights }) {
    const notifications = [];
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    if (deltaToTarget >= 0) {
      notifications.push({
        severity: 'critical',
        icon: '!',
        title: 'Emisi menyentuh batas atas target 2030',
        message: `Emisi saat ini ${formatNumber(currentEmission, 2)} mtCO₂e telah ${deltaToTarget > 0 ? 'melewati' : 'mencapai'} target 29 mtCO₂e. Aktifkan langkah mitigasi tambahan.`,
        timestamp
      });
    } else if (progress2030 < 0.8) {
      notifications.push({
        severity: 'warning',
        icon: '⚠',
        title: 'Progress 2030 masih di bawah 80%',
        message: `Progress menuju target 2030 baru ${formatNumber(progress2030 * 100, 1)}%. Pertimbangkan percepatan inisiatif dekarbonisasi.`,
        timestamp
      });
    }

    if (progress2025 < 0.9) {
      notifications.push({
        severity: 'warning',
        icon: '⚠',
        title: 'Net Zero 2025 membutuhkan percepatan',
        message: `Tambahan reduksi ${formatNumber(currentEmission, 2)} mtCO₂e masih dibutuhkan untuk mencapai Net Zero 2025.`,
        timestamp
      });
    }

    if (topRiskRecord) {
      notifications.push({
        severity: topRiskRecord.variance > 1.2 ? 'critical' : 'warning',
        icon: topRiskRecord.variance > 1.2 ? '!' : '⚠',
        title: `Variance tinggi di ${topRiskRecord.source}`,
        message: `Variance ${formatNumber(topRiskRecord.variance, 2)} mtCO₂e pada ${topRiskRecord.location} (${topRiskRecord.scope}) melampaui ambang batas.`,
        timestamp
      });
    }

    if (fleetInsights.adoptionRate < fleetInsights.adoptionTarget * 0.75) {
      notifications.push({
        severity: 'critical',
        icon: '!',
        title: 'Adopsi EV tertinggal dari target',
        message: `Rasio adopsi EV ${formatNumber(fleetInsights.adoptionRate, 1)}% < target ${formatNumber(fleetInsights.adoptionTarget, 0)}%.`,
        timestamp
      });
    }

    notifications.push({
      severity: 'ok',
      icon: '✓',
      title: 'CDIP sinkron penuh',
      message: 'Integrasi Carbon Data Integrations Platform berjalan normal tanpa backlog.',
      timestamp
    });

    return notifications;
  }

  function renderNotifications(notifications) {
    const container = document.getElementById('notificationFeed');
    const badge = document.getElementById('notificationCount');
    if (!container || !badge) return;
    container.innerHTML = '';

    notifications.forEach((notification) => {
      const li = document.createElement('li');
      li.classList.add('notification-item');
      li.innerHTML = `
        <div class="notification-icon notification-${notification.severity}">${notification.icon}</div>
        <div>
          <strong>${notification.title}</strong>
          <span class="muted">${notification.message}</span>
          <p class="tiny-text">${notification.timestamp}</p>
        </div>
      `;
      container.appendChild(li);
    });

    badge.textContent = `${notifications.length} Alerts`;
  }

  function initNavigation(onAfterChange) {
    const links = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.view');

    links.forEach((link) => {
      link.addEventListener('click', () => {
        const target = link.dataset.target;
        if (!target) return;

        links.forEach((item) => item.classList.remove('active'));
        link.classList.add('active');

        views.forEach((view) => {
          if (view.id === target) {
            view.classList.add('active');
          } else {
            view.classList.remove('active');
          }
        });

        if (typeof onAfterChange === 'function') {
          onAfterChange(target);
        }
      });
    });
  }

  function generateEmissionSeries(points, target) {
    const data = [];
    const baseline = 82 + Math.random() * 6;
    const start = new Date('2020-01-01T00:00:00Z');
    const trend = (baseline - (target - 3)) / points;
    let current = baseline;

    for (let i = 0; i < points; i += 1) {
      if (i > 0) {
        const noise = (Math.random() - 0.5) * 0.8;
        current -= trend + noise;
        current = Math.max(target + 1.2, Math.min(baseline + 1, current));
      }
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      data.push({
        label: date.toISOString().split('T')[0],
        value: Number(current.toFixed(2))
      });
    }

    return data;
  }

  function generateCarbonRecords(count) {
    const layers = [
      {
        layer: 'Building',
        prefix: 'Building',
        base: 2.4,
        variance: 1.6,
        names: ['HQ Jakarta', 'Distribution Hub Surabaya', 'Warehouse Medan', 'Transit Center Makassar']
      },
      {
        layer: 'Energy',
        prefix: 'Energy Plant',
        base: 3.2,
        variance: 1.9,
        names: ['Cogen Facility Java', 'Solar Rooftop Bali', 'Renewable PPAs Kalimantan']
      },
      {
        layer: 'Fleet',
        prefix: 'Fleet Depot',
        base: 4.8,
        variance: 2.6,
        names: ['Jakarta Timur', 'Bandung Raya', 'Jabodetabek', 'Surabaya Barat']
      },
      {
        layer: 'Customer',
        prefix: 'Customer Portfolio',
        base: 1.8,
        variance: 1.2,
        names: ['Ritel Nasional', 'Industri Makanan', 'Teknologi', 'Farmasi']
      },
      {
        layer: 'Product',
        prefix: 'Product Line',
        base: 1.5,
        variance: 1,
        names: ['Pendingin', 'Material Kemasan', 'Elektrifikasi', 'Suku Cadang']
      }
    ];

    const scopes = ['Scope 1', 'Scope 2', 'Scope 3'];
    const locations = ['Jakarta', 'Surabaya', 'Medan', 'Singapore', 'Tokyo', 'Sydney', 'Rotterdam', 'Dubai', 'Bangkok', 'Ho Chi Minh']
      .map((city) => `${city} Campus`);
    const initiatives = ['Retrofit HVAC', 'Renewable PPA', 'Fleet Electrification', 'Sustainable Fuel', 'Digital Twin', 'Circular Packaging'];

    const records = [];
    for (let i = 0; i < count; i += 1) {
      const blueprint = layers[i % layers.length];
      const scope = scopes[Math.floor(Math.random() * scopes.length)];
      const target = clamp(Number((blueprint.base + Math.random() * blueprint.variance).toFixed(2)), 0.1, 12);
      const varianceRaw = Number(((Math.random() * 2.6) - 0.6).toFixed(2));
      const emission = clamp(Number((target + varianceRaw).toFixed(2)), 0.05, 16);
      const variance = Number((emission - target).toFixed(2));
      const location = locations[Math.floor(Math.random() * locations.length)];
      const source = `${blueprint.prefix} ${blueprint.names[i % blueprint.names.length]} ${Math.floor(i / layers.length) + 1}`;

      records.push({
        id: i + 1,
        layer: blueprint.layer,
        scope,
        location,
        source,
        emission,
        target,
        variance,
        initiative: initiatives[Math.floor(Math.random() * initiatives.length)]
      });
    }

    return records;
  }

  function generateAssetSites() {
    return [
      { name: 'Jakarta Logistics Hub', layer: 'Fleet', emission: 4.8, reduction: 1.6, status: 'Critical', lat: -6.2, lng: 106.816 },
      { name: 'Surabaya Green Warehouse', layer: 'Building', emission: 2.4, reduction: 1.1, status: 'Warning', lat: -7.2575, lng: 112.7521 },
      { name: 'Balikpapan Sustainable Fuel Terminal', layer: 'Energy', emission: 1.8, reduction: 0.9, status: 'OK', lat: -1.2765, lng: 116.8289 },
      { name: 'Singapore Data Center', layer: 'Energy', emission: 2.9, reduction: 1.7, status: 'Warning', lat: 1.3521, lng: 103.8198 },
      { name: 'Sydney EV Fleet Hub', layer: 'Fleet', emission: 3.1, reduction: 1.9, status: 'OK', lat: -33.8688, lng: 151.2093 },
      { name: 'Dubai Regional Warehousing', layer: 'Building', emission: 2.1, reduction: 0.7, status: 'Warning', lat: 25.2048, lng: 55.2708 },
      { name: 'Rotterdam Clean Energy Port', layer: 'Energy', emission: 3.6, reduction: 2.2, status: 'OK', lat: 51.9244, lng: 4.4777 },
      { name: 'Tokyo Smart Distribution', layer: 'Product', emission: 1.4, reduction: 0.9, status: 'OK', lat: 35.6762, lng: 139.6503 }
    ];
  }

  function createInitiatives() {
    return [
      { index: 120, title: 'Fleet Electrification Wave 1', subtitle: 'Peluncuran 300 EV logistics', impact: 1.8 },
      { index: 420, title: 'Renewable PPA Signed', subtitle: 'Power Purchase Agreement 45 GWh', impact: 2.6 },
      { index: 960, title: 'Sustainable Fuel Procurement', subtitle: 'Campuran biofuel 35%', impact: 1.1 },
      { index: 1380, title: 'Building Efficiency Retrofit', subtitle: 'IoT & otomasi HVAC', impact: 1.4 }
    ];
  }

  function summarizeScopes(records) {
    const scopeTotals = {
      'Scope 1': { actual: 0, target: 0 },
      'Scope 2': { actual: 0, target: 0 },
      'Scope 3': { actual: 0, target: 0 }
    };
    records.forEach((record) => {
      const scope = scopeTotals[record.scope];
      if (!scope) return;
      scope.actual += record.emission;
      scope.target += record.target;
    });
    return {
      actual: Object.keys(scopeTotals).map((key) => Number(scopeTotals[key].actual.toFixed(2))),
      target: Object.keys(scopeTotals).map((key) => Number(scopeTotals[key].target.toFixed(2)))
    };
  }

  function computeFleetInsights(records) {
    const fleetRecords = records.filter((record) => record.layer === 'Fleet');
    const totalEmission = fleetRecords.reduce((sum, record) => sum + record.emission, 0);
    const totalTarget = fleetRecords.reduce((sum, record) => sum + record.target, 0);
    const impact = Number(Math.max(0, totalTarget - totalEmission).toFixed(2));
    const adoptionRate = 58 + Math.random() * 18;
    const adoptionTarget = 80;
    const sustainableBlend = 32 + Math.random() * 12;
    const sustainableTarget = 48;
    const energyIntensity = (totalEmission / (fleetRecords.length || 1)) * 2;

    const topRisk = fleetRecords.reduce((worst, record) => {
      if (!worst) return record;
      return record.variance > worst.variance ? record : worst;
    }, null);

    return {
      impact,
      adoptionRate,
      adoptionTarget,
      sustainableBlend,
      sustainableTarget,
      energyIntensity: Number(energyIntensity.toFixed(2)),
      riskScore: Math.max(0, (topRisk?.variance || 0) * 40),
      topRisk: topRisk || { location: '-', layer: '-' },
      metrics: [
        { label: 'EV aktif', value: `${Math.round(480 + Math.random() * 120)}/${Math.round(720 + Math.random() * 160)} unit` },
        { label: 'Konsumsi energi/kilometer', value: `${formatNumber(energyIntensity, 2)} kWh` },
        { label: 'Penghematan bahan bakar', value: `${formatNumber(impact * 1.4, 2)} mtCO₂e` }
      ],
      impacts: {
        fleetImpactBadge: impact * 0.6,
        fuelImpactBadge: impact * 0.3,
        buildingImpactBadge: impact * 0.4
      }
    };
  }

  function assessStatus(value, thresholds) {
    if (value <= thresholds.ok) return { severity: 'ok', label: 'OK' };
    if (value <= thresholds.warning) return { severity: 'warning', label: 'Warning' };
    return { severity: 'critical', label: 'Critical' };
  }


  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined && text !== null) {
      el.innerHTML = text;
    }
  }

  function setStatusPill(id, severity, label) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('status-ok', 'status-warning', 'status-critical');
    if (severity) {
      el.classList.add(`status-${severity}`);
    }
    el.textContent = label;
  }

  function formatNumber(value, digits = 1) {
    return Number(value).toLocaleString('id-ID', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();

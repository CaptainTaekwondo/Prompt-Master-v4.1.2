



import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { PerformanceReportData, PlatformReportData, ReportSample } from '../types.ts';
import type { translations } from '../translations.ts';
import { Card } from './Card.tsx';

type Translations = typeof translations['en'];

interface PerformanceReportProps {
  onBack: () => void;
  t: Translations;
  mode: 'text' | 'image' | 'video';
}

// === HELPER FUNCTIONS ===
const getStatusColor = (score: number): string => {
  if (score >= 90) return '#4ade80'; // green-400
  if (score >= 70) return '#fb923c'; // orange-400
  return '#f87171'; // red-400
};

// === SUB-COMPONENTS ===
const KpiCard: React.FC<{ title: string, value: string, icon: string }> = ({ title, value, icon }) => (
    <div className="print-card flex-1 bg-white/10 dark:bg-black/20 p-4 rounded-lg flex items-center gap-4">
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-sm text-white/70 print-text">{title}</p>
        <p className="text-2xl font-bold print-kpi-value">{value}</p>
      </div>
    </div>
);

const DualMetricBarChart: React.FC<{ reports: PlatformReportData[], t: Translations }> = ({ reports, t }) => {
    const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const handleMouseOver = (e: React.MouseEvent, content: string) => {
        const { clientX, clientY } = e;
        setTooltip({ content, x: clientX, y: clientY });
    };
    
    const handleMouseOut = () => setTooltip(null);
    
    useEffect(() => {
        if (tooltip && tooltipRef.current) {
            tooltipRef.current.style.left = `${tooltip.x + 10}px`;
            tooltipRef.current.style.top = `${tooltip.y + 10}px`;
            tooltipRef.current.style.opacity = '1';
            tooltipRef.current.style.transform = 'translateY(0)';
        }
    }, [tooltip]);

    const chartHeight = 450; // Increased height for better text visibility
    const chartPaddingTop = 40;
    const chartPaddingBottom = 40;
    const maxBarHeight = chartHeight - chartPaddingTop - chartPaddingBottom;
    
    const barWidth = 45; // Wider bars to fit text
    const barGap = 6; 
    const groupGap = 40;
    const groupWidth = (barWidth * 2) + barGap;
    const totalWidth = 60 + (groupWidth + groupGap) * reports.length;

    return (
        <Card title={t.report?.combinedChartTitle || 'Instruction Following & Professionalism (Comparison)'} icon="📊" className="print-card !bg-black/40 border border-white/10">
            <div className="w-full overflow-x-auto pb-4">
                {/* Legend */}
                <div className="flex justify-center gap-8 mb-6 text-sm font-semibold">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-b from-cyan-400 to-cyan-600 shadow-sm"></div>
                        <span className="text-white/90">{t.report?.compliance || 'Instruction Following'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="w-4 h-4 rounded bg-gradient-to-b from-purple-400 to-purple-600 shadow-sm"></div>
                        <span className="text-white/90">{t.report?.professionalism || 'Professionalism'}</span>
                    </div>
                </div>

                <svg width={totalWidth} height={chartHeight} aria-labelledby="dual-chart-title">
                    <title id="dual-chart-title">{t.report?.combinedChartTitle || 'Combined Performance Chart'}</title>
                    
                    <defs>
                        <linearGradient id="gradient-compliance" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                        <linearGradient id="gradient-professionalism" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                        <filter id="text-shadow">
                            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="black" floodOpacity="0.5" />
                        </filter>
                    </defs>
                    
                    {/* Y-Axis Grid Lines */}
                    {[0, 25, 50, 75, 100].map(val => (
                        <g key={val}>
                            <text x="35" y={chartHeight - chartPaddingBottom - (val/100 * maxBarHeight) + 4} textAnchor="end" className="text-xs fill-current text-white/60 print-text">{val}%</text>
                            <line x1="40" x2={totalWidth} y1={chartHeight - chartPaddingBottom - (val/100 * maxBarHeight)} y2={chartHeight - chartPaddingBottom - (val/100 * maxBarHeight)} className="stroke-current text-white/10 print-text" strokeDasharray="4 4" />
                        </g>
                    ))}

                    {reports.map((report, index) => {
                        const x = 60 + index * (groupWidth + groupGap);
                        
                        const complianceHeight = Math.max((report.compliance / 100) * maxBarHeight, 1);
                        const profHeight = Math.max((report.professionalism / 100) * maxBarHeight, 1);
                        
                        const complianceY = chartHeight - chartPaddingBottom - complianceHeight;
                        const profY = chartHeight - chartPaddingBottom - profHeight;

                        return (
                            <g key={report.platformName} className="group" onMouseOut={handleMouseOut}>
                                {/* Compliance Bar Group */}
                                <g transform={`translate(${x}, ${complianceY})`}>
                                    <rect 
                                        width={barWidth} 
                                        height={complianceHeight} 
                                        rx="6"
                                        className="hover:opacity-100 opacity-90 transition-opacity cursor-pointer"
                                        style={{ fill: `url(#gradient-compliance)` }}
                                        onMouseOver={(e) => handleMouseOver(e, `<strong>${report.platformName}</strong><br/>Compliance: ${report.compliance.toFixed(1)}%`)}
                                    />
                                    {/* Text Inside Compliance Bar */}
                                    {complianceHeight > 60 && (
                                        <g>
                                            {/* Percentage at top */}
                                            <text 
                                                x={barWidth/2} 
                                                y={25} 
                                                textAnchor="middle" 
                                                className="text-[12px] font-black fill-white pointer-events-none"
                                                style={{ filter: 'url(#text-shadow)' }}
                                            >
                                                {report.compliance.toFixed(1)}%
                                            </text>
                                            {/* Name at bottom (Vertical) */}
                                            {complianceHeight > 160 && (
                                                <text 
                                                    x={barWidth/2} 
                                                    y={complianceHeight - 15} 
                                                    textAnchor="end" 
                                                    transform={`rotate(-90, ${barWidth/2}, ${complianceHeight - 15})`}
                                                    className="text-[11px] font-bold fill-white/90 uppercase pointer-events-none"
                                                    style={{ letterSpacing: '1px', filter: 'url(#text-shadow)' }}
                                                >
                                                    {report.platformName}
                                                </text>
                                            )}
                                        </g>
                                    )}
                                </g>

                                {/* Professionalism Bar Group */}
                                <g transform={`translate(${x + barWidth + barGap}, ${profY})`}>
                                     <rect 
                                        width={barWidth} 
                                        height={profHeight} 
                                        rx="6"
                                        className="hover:opacity-100 opacity-90 transition-opacity cursor-pointer"
                                        style={{ fill: `url(#gradient-professionalism)` }}
                                        onMouseOver={(e) => handleMouseOver(e, `<strong>${report.platformName}</strong><br/>Professionalism: ${report.professionalism.toFixed(1)}%`)}
                                    />
                                    {/* Text Inside Professionalism Bar */}
                                    {profHeight > 60 && (
                                        <g>
                                             {/* Percentage at top */}
                                            <text 
                                                x={barWidth/2} 
                                                y={25} 
                                                textAnchor="middle" 
                                                className="text-[12px] font-black fill-white pointer-events-none"
                                                style={{ filter: 'url(#text-shadow)' }}
                                            >
                                                {report.professionalism.toFixed(1)}%
                                            </text>
                                            {/* Name at bottom (Vertical) */}
                                            {profHeight > 160 && (
                                                <text 
                                                    x={barWidth/2} 
                                                    y={profHeight - 15} 
                                                    textAnchor="end" 
                                                    transform={`rotate(-90, ${barWidth/2}, ${profHeight - 15})`}
                                                    className="text-[11px] font-bold fill-white/90 uppercase pointer-events-none"
                                                    style={{ letterSpacing: '1px', filter: 'url(#text-shadow)' }}
                                                >
                                                    {report.platformName}
                                                </text>
                                            )}
                                        </g>
                                    )}
                                </g>
                                
                                {/* Fallback Label if bars are too short to show name */}
                                {(complianceHeight <= 160 && profHeight <= 160) && (
                                    <text 
                                        x={x + groupWidth / 2} 
                                        y={chartHeight - 15} 
                                        textAnchor="middle" 
                                        className="text-[10px] font-semibold fill-white/40 print-text"
                                    >
                                        {report.platformName}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
            {tooltip && <div ref={tooltipRef} className="bar-tooltip" dangerouslySetInnerHTML={{ __html: tooltip.content }} />}
        </Card>
    );
};


// === MAIN COMPONENT ===
export const PerformanceReport: React.FC<PerformanceReportProps> = ({ onBack, t, mode }) => {
  const [reportData, setReportData] = useState<PerformanceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const reportFile = `../data/${
        mode === 'text' ? 'professional_text_test_report.json' :
        mode === 'image' ? 'image_prompt_test_report.json' :
        'video_prompt_test_report.json'
    }`;
    fetch(reportFile)
      .then(res => res.json())
      .then(data => {
        setReportData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(`Failed to load report data from ${reportFile}:`, err);
        setLoading(false);
      });
  }, [mode]);

  const sortedAndFilteredReports = useMemo(() => {
      if (!reportData) return [];
      return reportData.platformReports
        .filter(report => report.platformName.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => b.overallStrength - a.overallStrength);
  }, [reportData, filter]);

  const reportTitle =
      mode === 'text' ? t.report.reportTitle :
      mode === 'image' ? t.report.imageReportTitle :
      t.report.videoReportTitle;


  const handlePrint = () => window.print();

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadJSON = () => {
    if (!reportData) return;
    downloadFile(JSON.stringify(reportData, null, 2), `${mode}_performance_report.json`, "application/json");
  };

  const downloadCSV = () => {
    if (!reportData) return;
    const headers = ["Platform", "Compliance", "Professionalism", "Overall Strength", "Issues"];
    const rows = sortedAndFilteredReports.map(r => 
        [r.platformName, r.compliance, r.professionalism, r.overallStrength, `"${r.issues.join(', ')}"`].join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadFile(csvContent, `${mode}_performance_report.csv`, "text/csv");
  };

  if (loading) return <div className="text-center p-10">{t.report?.loading || 'Loading Report...'}</div>;
  if (!reportData) return <div className="text-center p-10 text-red-400">{t.report?.error || 'Failed to load report.'}</div>;

  return (
    <div className="print-container animate-fade-in">
      <div className="no-print flex justify-between items-center mb-6">
        <button onClick={onBack} className="font-semibold hover:text-purple-300 transition-colors">&larr; {t.backToMainPage}</button>
        <div className="flex gap-2">
            <button onClick={handlePrint} className="px-3 py-1.5 bg-white/10 text-xs font-semibold rounded-md hover:bg-white/20">🖨️ {t.report.exportPDF}</button>
            <button onClick={downloadCSV} className="px-3 py-1.5 bg-white/10 text-xs font-semibold rounded-md hover:bg-white/20">📄 {t.report.exportCSV}</button>
            <button onClick={downloadJSON} className="px-3 py-1.5 bg-white/10 text-xs font-semibold rounded-md hover:bg-white/20">💾 {t.report.exportJSON}</button>
        </div>
      </div>
      <h1 className="print-title text-4xl font-bold text-center mb-2">{reportTitle}</h1>
      <p className="text-center text-orange-500 dark:text-orange-400 mb-8 print-text font-bold text-lg">{(t.report?.reportSubtitle || 'Analysis of {count} scenarios.').replace('{count}', reportData.summary.totalTests.toLocaleString())}</p>

      {/* Executive Summary */}
      <h2 className="print-title text-2xl font-bold mb-4">{t.report.summaryTitle}</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-10">
          <KpiCard title={t.report.successRate} value={`${reportData.summary.overallSuccessRate.toFixed(1)}%`} icon="🎯" />
          <KpiCard title={t.report.compliance} value={`${reportData.summary.averageCompliance.toFixed(1)}%`} icon="✅" />
          <KpiCard title={t.report.professionalism} value={`${reportData.summary.averageProfessionalism.toFixed(1)}%`} icon="👔" />
      </div>

       {/* Combined Bar Chart */}
       <div className="space-y-8 mb-10">
            <DualMetricBarChart reports={sortedAndFilteredReports} t={t} />
       </div>

      {/* Main Table */}
      <div className="print-card bg-white/10 dark:bg-black/20 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="print-title text-2xl font-bold">{t.report?.platformReportsTitle || 'Platform-Specific Analysis'}</h2>
            <input 
                type="text"
                placeholder={t.report?.filterPlaceholder || 'Filter by platform...'}
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="no-print w-1/3 p-2 bg-black/30 border border-white/20 rounded-md text-sm"
            />
        </div>
        <div className="overflow-x-auto">
            <table className="print-table w-full text-sm text-left">
                <thead className="bg-white/5 dark:bg-black/20">
                    <tr>
                        <th className="p-3">{t.platformLabel}</th>
                        <th className="p-3 text-center">{t.report?.compliance || 'Instruction Following'}</th>
                        <th className="p-3 text-center">{t.report?.professionalism || 'Professionalism'}</th>
                        <th className="p-3 text-center">{t.report?.overallStrength || 'Overall Strength'}</th>
                        <th className="p-3">{t.report?.issuesAlerts || 'Issues / Alerts'}</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAndFilteredReports.map(report => (
                        <PlatformTableRow key={report.platformName} report={report} t={t} mode={mode} />
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const PlatformTableRow: React.FC<{ report: PlatformReportData, t: Translations, mode: 'text' | 'image' | 'video' }> = ({ report, t, mode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const settingsLabels: Record<string, string> = {
        // Text
        writingIdentity: t.proText.writingIdentity,
        purpose: t.proText.purpose,
        audience: t.proText.audience,
        formality: t.proText.formality,
        citationStyle: t.proText.citationStyle,
        aiPlatform: t.proText.aiPlatform,
        // Image
        imagePurpose: t.imagePurposeLabel,
        style: t.styleLabel,
        lighting: t.lightingLabel,
        composition: t.compositionLabel,
        cameraAngle: t.cameraAngleLabel,
        mood: t.moodLabel,
        colorPalette: t.colorPaletteLabel,
        // Video
        videoPurpose: t.videoPurposeLabel,
        videoDuration: t.videoDurationLabel,
        cameraShot: t.cameraShotLabel,
        fashionEra: t.fashionEraLabel,
        videoEffect: t.videoEffectLabel,
        // Common
        length: t.report?.length || 'Length',
        quality: t.qualityLabel,
        aspectRatio: t.aspectRatioLabel,
    };
    
    return (
        <>
            <tr onClick={() => setIsExpanded(!isExpanded)} className="border-b border-white/10 hover:bg-white/10 cursor-pointer transition-colors" title={t.report?.showSamples || 'Show Samples'}>
                <td className="p-3 font-semibold print-text">{report.platformName}</td>
                <td className={`p-3 font-semibold text-center`} style={{color: getStatusColor(report.compliance)}}>{report.compliance.toFixed(1)}%</td>
                <td className={`p-3 font-semibold text-center`} style={{color: getStatusColor(report.professionalism)}}>{report.professionalism.toFixed(1)}%</td>
                <td className={`p-3 font-bold text-center`} style={{color: getStatusColor(report.overallStrength)}}>{report.overallStrength.toFixed(1)}%</td>
                <td className="p-3 text-xs text-orange-300 print-text">{report.issues.join(', ')}</td>
            </tr>
            {isExpanded && (
                <tr className="bg-black/20 dark:bg-black/40">
                    <td colSpan={5} className="p-4">
                        <div className="space-y-4 animate-fade-in">
                            {report.samples.map((sample, i) => (
                                <div key={i} className="text-xs bg-black/30 p-3 rounded">
                                    <p className="font-bold text-sm print-text">
                                        {t.report?.case || 'Case'} #{sample.caseNumber}: <span className="font-normal text-white/90 print-text">{sample.description}</span>
                                    </p>
                                    <div className="mt-2 text-white/80 print-text">
                                        <strong className="text-white/90 print-title">{t.report?.options || 'Options'}:</strong> 
                                        <div className="pl-4 text-white/70 print-text">
                                            {Object.entries(sample.settings).map(([key, value]) => (
                                                <div key={key}>- {settingsLabels[key] || key}: {value}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="mt-2 print-text"><strong className="text-white/90 print-title">{t.report?.output || 'Output'}:</strong> <span className="text-white/70 italic">"{sample.output}"</span></p>
                                    <p className={`mt-2 font-bold ${sample.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>{t.report?.status || 'Status'}: {t.report?.[sample.status.toLowerCase() as 'success' | 'failure'] || sample.status}</p>
                                </div>
                            ))}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};
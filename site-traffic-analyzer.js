/**
 * Site Traffic Analyzer
 * 
 * Este script coleta dados básicos de tráfego do site e os armazena em localStorage.
 * Também fornece uma interface simples para visualizar as estatísticas coletadas.
 * 
 * Como usar:
 * 1. Adicione este script ao seu site (preferencialmente antes da tag </body>)
 * 2. Acesse a página de estatísticas visitando: seu-site.com/stats.html (ou crie essa página)
 * 3. Use a senha definida abaixo para visualizar os dados
 */

// Configurações
const TRAFFIC_ANALYZER = {
    storageKey: 'site_traffic_data',
    password: 'metamorfose2025', // Altere esta senha
    daysToKeep: 30, // Quantos dias de dados manter
};

// Objeto principal do analisador
const TrafficAnalyzer = {
    // Inicializa o analisador
    init: function() {
        // Verifique se estamos na página de estatísticas
        if (window.location.pathname.includes('stats.html') || 
            window.location.search.includes('stats=true')) {
            this.renderStatsPage();
            return;
        }
        
        // Caso contrário, colete dados do visitante atual
        this.collectVisitorData();
    },
    
    // Coleta dados do visitante atual
    collectVisitorData: function() {
        // Dados básicos do visitante
        const visitorData = {
            timestamp: Date.now(),
            date: new Date().toISOString().split('T')[0],
            referrer: document.referrer || 'direct',
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            path: window.location.pathname,
            queryParams: window.location.search,
            loadTime: 0
        };
        
        // Calcular tempo de carregamento da página
        window.addEventListener('load', () => {
            if (performance && performance.timing) {
                visitorData.loadTime = 
                    performance.timing.domContentLoadedEventEnd - 
                    performance.timing.navigationStart;
            }
            
            // Salvar os dados
            this.saveVisitorData(visitorData);
        });
        
        // Registrar tempo gasto na página ao sair
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            visitorData.timeOnPage = Math.floor((Date.now() - startTime) / 1000);
            this.saveVisitorData(visitorData);
        });
    },
    
    // Salva os dados do visitante
    saveVisitorData: function(visitorData) {
        // Obter dados existentes ou inicializar um array vazio
        let trafficData = JSON.parse(localStorage.getItem(TRAFFIC_ANALYZER.storageKey) || '[]');
        
        // Adicionar novos dados
        trafficData.push(visitorData);
        
        // Limpar dados antigos (manter apenas os últimos X dias)
        const oldestDate = new Date();
        oldestDate.setDate(oldestDate.getDate() - TRAFFIC_ANALYZER.daysToKeep);
        trafficData = trafficData.filter(item => new Date(item.timestamp) >= oldestDate);
        
        // Salvar dados atualizados
        localStorage.setItem(TRAFFIC_ANALYZER.storageKey, JSON.stringify(trafficData));
    },
    
    // Renderiza a página de estatísticas
    renderStatsPage: function() {
        // Verificar senha primeiro
        const password = prompt('Digite a senha para acessar as estatísticas:');
        if (password !== TRAFFIC_ANALYZER.password) {
            alert('Senha incorreta!');
            return;
        }
        
        // Obter dados de tráfego
        const trafficData = JSON.parse(localStorage.getItem(TRAFFIC_ANALYZER.storageKey) || '[]');
        
        // Se não houver dados, exibir mensagem
        if (trafficData.length === 0) {
            document.body.innerHTML = '<h1>Análise de Tráfego</h1><p>Nenhum dado coletado ainda.</p>';
            return;
        }
        
        // Calcular estatísticas
        const stats = this.calculateStats(trafficData);
        
        // Renderizar página de estatísticas
        document.body.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h1>Análise de Tráfego - ${stats.totalVisits} visitas nos últimos ${TRAFFIC_ANALYZER.daysToKeep} dias</h1>
                
                <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px;">
                    <div style="flex: 1; min-width: 200px; background: #f5f5f5; padding: 15px; border-radius: 8px;">
                        <h3>Visitas Diárias (Média)</h3>
                        <p style="font-size: 24px; font-weight: bold;">${stats.averageDailyVisits.toFixed(1)}</p>
                    </div>
                    <div style="flex: 1; min-width: 200px; background: #f5f5f5; padding: 15px; border-radius: 8px;">
                        <h3>Tempo Médio na Página</h3>
                        <p style="font-size: 24px; font-weight: bold;">${stats.averageTimeOnPage.toFixed(1)} segundos</p>
                    </div>
                    <div style="flex: 1; min-width: 200px; background: #f5f5f5; padding: 15px; border-radius: 8px;">
                        <h3>Tempo de Carregamento</h3>
                        <p style="font-size: 24px; font-weight: bold;">${stats.averageLoadTime.toFixed(0)} ms</p>
                    </div>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                    <div style="flex: 1; min-width: 300px;">
                        <h2>Visitas por Dia</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Data</th>
                                <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Visitas</th>
                            </tr>
                            ${Object.entries(stats.visitsByDate).map(([date, count]) => `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${date}</td>
                                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">${count}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                    
                    <div style="flex: 1; min-width: 300px;">
                        <h2>Fontes de Tráfego</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Fonte</th>
                                <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Visitas</th>
                                <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">%</th>
                            </tr>
                            ${Object.entries(stats.referrers).map(([referrer, count]) => `
                                <tr>
                                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${this.formatReferrer(referrer)}</td>
                                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">${count}</td>
                                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">${(count / stats.totalVisits * 100).toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h2>Páginas Mais Visitadas</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Página</th>
                            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Visitas</th>
                            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">%</th>
                        </tr>
                        ${Object.entries(stats.pages).map(([page, count]) => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${page}</td>
                                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">${count}</td>
                                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">${(count / stats.totalVisits * 100).toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
                
                <div style="margin-top: 30px;">
                    <h2>Dispositivos e Navegadores</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Tipo</th>
                            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Visitas</th>
                            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">%</th>
                        </tr>
                        ${Object.entries(stats.devices).map(([device, count]) => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${device}</td>
                                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">${count}</td>
                                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">${(count / stats.totalVisits * 100).toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
                
                <div style="margin-top: 30px;">
                    <button onclick="localStorage.removeItem('${TRAFFIC_ANALYZER.storageKey}'); location.reload();" 
                            style="padding: 10px 20px; background: #ff5555; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Limpar Todos os Dados
                    </button>
                    <button onclick="downloadTrafficData();" 
                            style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                        Exportar Dados (CSV)
                    </button>
                </div>
            </div>
            
            <script>
                function downloadTrafficData() {
                    const data = JSON.parse(localStorage.getItem('${TRAFFIC_ANALYZER.storageKey}') || '[]');
                    if (data.length === 0) return;
                    
                    // Converter para CSV
                    const headers = Object.keys(data[0]).join(',');
                    const rows = data.map(item => {
                        return Object.values(item).map(val => {
                            // Escapar strings com vírgulas
                            if (typeof val === 'string' && val.includes(',')) {
                                return '"' + val + '"';
                            }
                            return val;
                        }).join(',');
                    });
                    
                    const csv = [headers, ...rows].join('\\n');
                    
                    // Criar arquivo para download
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('href', url);
                    a.setAttribute('download', 'traffic_data_' + new Date().toISOString().split('T')[0] + '.csv');
                    a.click();
                }
            </script>
        `;
    },
    
    // Calcula estatísticas a partir dos dados brutos
    calculateStats: function(trafficData) {
        const stats = {
            totalVisits: trafficData.length,
            visitsByDate: {},
            referrers: {},
            pages: {},
            devices: {},
            averageTimeOnPage: 0,
            averageLoadTime: 0,
            averageDailyVisits: 0
        };
        
        // Total de tempo na página e tempo de carregamento
        let totalTimeOnPage = 0;
        let totalLoadTime = 0;
        let timeOnPageCount = 0;
        let loadTimeCount = 0;
        
        // Calcular estatísticas
        trafficData.forEach(visit => {
            // Visitas por data
            if (!stats.visitsByDate[visit.date]) {
                stats.visitsByDate[visit.date] = 0;
            }
            stats.visitsByDate[visit.date]++;
            
            // Referenciadores
            const referrerDomain = this.extractDomain(visit.referrer);
            if (!stats.referrers[referrerDomain]) {
                stats.referrers[referrerDomain] = 0;
            }
            stats.referrers[referrerDomain]++;
            
            // Páginas
            if (!stats.pages[visit.path]) {
                stats.pages[visit.path] = 0;
            }
            stats.pages[visit.path]++;
            
            // Dispositivos e navegadores
            const deviceType = this.detectDevice(visit.userAgent);
            if (!stats.devices[deviceType]) {
                stats.devices[deviceType] = 0;
            }
            stats.devices[deviceType]++;
            
            // Tempo na página
            if (visit.timeOnPage) {
                totalTimeOnPage += visit.timeOnPage;
                timeOnPageCount++;
            }
            
            // Tempo de carregamento
            if (visit.loadTime) {
                totalLoadTime += visit.loadTime;
                loadTimeCount++;
            }
        });
        
        // Ordenar resultados
        stats.visitsByDate = Object.fromEntries(
            Object.entries(stats.visitsByDate).sort().reverse()
        );
        
        stats.referrers = Object.fromEntries(
            Object.entries(stats.referrers).sort((a, b) => b[1] - a[1])
        );
        
        stats.pages = Object.fromEntries(
            Object.entries(stats.pages).sort((a, b) => b[1] - a[1])
        );
        
        stats.devices = Object.fromEntries(
            Object.entries(stats.devices).sort((a, b) => b[1] - a[1])
        );
        
        // Calcular médias
        stats.averageTimeOnPage = timeOnPageCount > 0 ? totalTimeOnPage / timeOnPageCount : 0;
        stats.averageLoadTime = loadTimeCount > 0 ? totalLoadTime / loadTimeCount : 0;
        
        // Calcular média diária de visitas
        const uniqueDays = Object.keys(stats.visitsByDate).length;
        stats.averageDailyVisits = uniqueDays > 0 ? stats.totalVisits / uniqueDays : stats.totalVisits;
        
        return stats;
    },
    
    // Formata a URL do referenciador para exibição
    formatReferrer: function(referrer) {
        if (referrer === 'direct') return 'Acesso Direto';
        if (referrer.includes('google')) return 'Google';
        if (referrer.includes('bing')) return 'Bing';
        if (referrer.includes('facebook')) return 'Facebook';
        if (referrer.includes('instagram')) return 'Instagram';
        if (referrer.includes('twitter') || referrer.includes('x.com')) return 'Twitter/X';
        if (referrer.includes('linkedin')) return 'LinkedIn';
        if (referrer.includes('youtube')) return 'YouTube';
        return referrer;
    },
    
    // Extrai o domínio de uma URL
    extractDomain: function(url) {
        if (!url || url === 'direct') return 'direct';
        
        try {
            const domain = new URL(url).hostname;
            return domain;
        } catch (e) {
            return url;
        }
    },
    
    // Detecta o tipo de dispositivo a partir do User Agent
    detectDevice: function(userAgent) {
        const ua = userAgent.toLowerCase();
        
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return 'Mobile';
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }
};

// Inicializar o analisador quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    TrafficAnalyzer.init();
});

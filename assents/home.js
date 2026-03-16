document.addEventListener('DOMContentLoaded', function() {
    const ctxFat = document.getElementById('faturamentoChart').getContext('2d');
    new Chart(ctxFat, {
        type: 'line',
        data: {
            labels: dataFaturamento.labels,
            datasets: [{
                label: 'Vendas',
                data: dataFaturamento.valores,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });

    const ctxOrc = document.getElementById('orcamentoChart').getContext('2d');
    new Chart(ctxOrc, {
        type: 'doughnut',
        data: {
            labels: dataOrcamento.labels,
            datasets: [{
                data: dataOrcamento.qtds,
                backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            cutout: '65%'
        }
    });

    function atualizarRelogio() {
        const agora = new Date();
        document.getElementById('relogio').innerText = agora.toLocaleTimeString('pt-BR');
    }

    setInterval(atualizarRelogio, 1000);
    atualizarRelogio();
});
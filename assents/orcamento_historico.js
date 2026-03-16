document.addEventListener('DOMContentLoaded', function() {
    let orcamentoAtualId = null;
    const modal = document.getElementById('modalDetalhes');
    const conteudo = document.getElementById('conteudoModal');
    const btnFechar = document.getElementById('btn-fechar-js');
    const btnImprimir = document.getElementById('btn-imprimir-js');
    const btnsView = document.querySelectorAll('.btn-view');

    btnsView.forEach(btn => {
        btn.onclick = function() {
            const id = this.getAttribute('data-id');
            verDetalhes(id);
        };
    });

    function verDetalhes(id) {
        orcamentoAtualId = id;
        modal.style.display = 'block';
        conteudo.innerHTML = '<p style="text-align:center;">Carregando detalhes...</p>';
        
        fetch('get_orcamento_detalhes.php?id=' + id)
        .then(r => r.text())
        .then(html => {
            conteudo.innerHTML = html;
        })
        .catch(err => {
            conteudo.innerHTML = '<p style="color:red">Erro ao carregar dados.</p>';
        });
    }

    btnFechar.onclick = function() {
        modal.style.display = 'none';
        orcamentoAtualId = null;
    };

    btnImprimir.onclick = function() {
        if(orcamentoAtualId) {
            window.open('imprimir_orcamento.php?id=' + orcamentoAtualId, '_blank');
        }
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});
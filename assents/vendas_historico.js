document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modalDetalhes');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.querySelector('.close');

    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            modal.style.display = 'flex';
            modalBody.innerHTML = 'Carregando...';

            fetch('api/get_venda_detalhes.php?id=' + id)
                .then(r => r.text())
                .then(html => { modalBody.innerHTML = html; })
                .catch(() => { modalBody.innerHTML = 'Erro ao carregar.'; });
        });
    });

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; };
});
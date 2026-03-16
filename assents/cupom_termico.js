window.onload = function() {
    window.print();
};

document.getElementById('btn-imprimir').addEventListener('click', function() {
    window.print();
});

document.getElementById('btn-fechar').addEventListener('click', function() {
    window.close();
});
function mascaraMoeda(campo) {
    let valor = campo.value.replace(/\D/g, "");
    if (valor === "") valor = "0";
    let valorDecimal = (parseFloat(valor) / 100).toFixed(2);
    let resultado = valorDecimal.replace(".", ",");
    resultado = resultado.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    campo.value = resultado;
}

document.querySelectorAll('.money-mask').forEach(input => {
    input.addEventListener('input', function() {
        mascaraMoeda(this);
    });
    
    input.addEventListener('focus', function() {
        this.select();
    });
});
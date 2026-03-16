function alternarCampos(tipo) {
    const labelNome = document.getElementById('label_nome');
    const labelDoc = document.getElementById('label_doc');
    if(tipo === 'PF') {
        labelNome.innerText = 'Nome Completo *';
        labelDoc.innerText = 'CPF *';
    } else {
        labelNome.innerText = 'Razão Social *';
        labelDoc.innerText = 'CNPJ *';
    }
}

function buscarEndereco(cep) {
    cep = cep.replace(/\D/g, '');
    if(cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(r => r.json())
        .then(d => {
            if(!d.erro) {
                document.getElementById('rua').value = d.logradouro;
                document.getElementById('bairro').value = d.bairro;
                document.getElementById('cidade').value = d.localidade;
                document.getElementById('uf').value = d.uf;
            }
        });
    }
}
const formulario = document.getElementById("formulario-login");
const mensagem = document.getElementById("mensagem-login");

if (localStorage.getItem("usuarioLogado")) {
    window.location.href = "index.html";
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const id = document.getElementById("id-professor").value.trim();
    const senha = document.getElementById("senha-professor").value.trim();

    if (!id || !senha) {
        mensagem.textContent = "Preencha o ID e a senha.";
        mensagem.style.color = "red";
        return;
    }

    if (id === "professor" && senha === "1234") {
        localStorage.setItem("usuarioLogado", id);
        window.location.href = "index.html";
        return;
    }

    mensagem.textContent = "ID ou senha inválidos.";
    mensagem.style.color = "red";
    formulario.reset();
    document.getElementById("id-professor").focus();

});
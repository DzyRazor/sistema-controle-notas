if (!localStorage.getItem("usuarioLogado")) {
    window.location.replace("login.html");
}

const alunos = JSON.parse(localStorage.getItem("alunos")) || [];
const camposNotas = ["nota1", "nota2", "nota3", "nota4"];
let alunoSelecionadoIndex = null;

alunos.forEach(function (aluno) {
    if (!Array.isArray(aluno.notas)) {
        aluno.notas = [];
    }
});

function salvarAlunos() {
    localStorage.setItem("alunos", JSON.stringify(alunos));
}

function lerNotasDaFicha() {
    return camposNotas.map(function (id) {
        const valor = document.getElementById(id).value.trim();
        return valor === "" ? null : Number(valor);
    });
}

function notasSaoValidas(notas) {
    return notas.every(function (nota) {
        return nota === null || (Number.isFinite(nota) && nota >= 0 && nota <= 10);
    });
}

function abrirFichaAluno(index) {
    const aluno = alunos[index];
    alunoSelecionadoIndex = index;

    document.getElementById("nome-selecionado").textContent = aluno.nome;
    document.getElementById("turma-selecionada").textContent = aluno.turma;

    camposNotas.forEach(function (id, notaIndex) {
        const nota = aluno.notas[notaIndex];
        document.getElementById(id).value = nota ?? "";
    });

    document.getElementById("ficha-aluno").hidden = false;
}

function renderizarAlunosEmCurso() {
    const listaTurmas = document.getElementById("lista-alunos");
    listaTurmas.innerHTML = "";

    const alunosEmCurso = alunos
        .map(function (aluno, index) {
            return { aluno: aluno, index: index };
        })
        .filter(function (registro) {
            return !registro.aluno.status;
        });

    const turmas = [...new Set(alunosEmCurso.map(function (registro) {
        return registro.aluno.turma;
    }))].sort(function (a, b) {
        return a.localeCompare(b, "pt-BR", { numeric: true });
    });

    if (turmas.length === 0) {
        listaTurmas.textContent = "Não há alunos em curso.";
        return;
    }

    turmas.forEach(function (turma) {
        const cardTurma = document.createElement("section");
        cardTurma.className = "card-turma";

        const titulo = document.createElement("h3");
        titulo.textContent = turma;
        cardTurma.appendChild(titulo);

        const lista = document.createElement("ul");

        alunosEmCurso
            .filter(function (registro) {
                return registro.aluno.turma === turma;
            })
            .forEach(function (registro) {
                const item = document.createElement("li");
                const botao = document.createElement("button");
                botao.type = "button";
                botao.className = "botao-aluno";
                botao.textContent = registro.aluno.nome;
                botao.addEventListener("click", function () {
                    abrirFichaAluno(registro.index);
                });
                item.appendChild(botao);
                lista.appendChild(item);
            });

        cardTurma.appendChild(lista);
        listaTurmas.appendChild(cardTurma);
    });
}

function renderizarResultados() {
    const listas = {
        Aprovado: document.getElementById("lista-aprovados"),
        Recuperação: document.getElementById("lista-recuperacao"),
        Reprovado: document.getElementById("lista-reprovados")
    };

    Object.values(listas).forEach(function (lista) {
        lista.innerHTML = "";
    });

    alunos.forEach(function (aluno) {
        if (!aluno.status || !listas[aluno.status]) {
            return;
        }

        const item = document.createElement("li");
        item.textContent = `${aluno.nome} - ${aluno.turma} - Média: ${aluno.media.toFixed(2)}`;
        listas[aluno.status].appendChild(item);
    });
}

function salvarNotasSelecionadas() {
    if (alunoSelecionadoIndex === null) {
        alert("Selecione um aluno primeiro.");
        return;
    }

    const notas = lerNotasDaFicha();

    if (!notasSaoValidas(notas)) {
        alert("Cada nota deve ser um número entre 0 e 10.");
        return;
    }

    if (notas.every(function (nota) {
        return nota === null;
    })) {
        alert("Preencha ao menos uma nota para salvar.");
        return;
    }

    alunos[alunoSelecionadoIndex].notas = notas;
    salvarAlunos();
    renderizarAlunosEmCurso();
    document.getElementById("ficha-aluno").hidden = true;
    alunoSelecionadoIndex = null;

    alert("Notas salvas na turma do aluno. Para classificá-lo, abra a ficha e calcule a média.");
}

function calcularMediaAlunoSelecionado() {
    if (alunoSelecionadoIndex === null) {
        alert("Selecione um aluno primeiro.");
        return;
    }

    const notas = lerNotasDaFicha();

    if (!notasSaoValidas(notas)) {
        alert("Cada nota deve ser um número entre 0 e 10.");
        return;
    }

    if (notas.some(function (nota) {
        return nota === null;
    })) {
        alert("Preencha as quatro notas antes de calcular a média.");
        return;
    }

    const aluno = alunos[alunoSelecionadoIndex];
    const media = notas.reduce(function (soma, nota) {
        return soma + nota;
    }, 0) / notas.length;

    aluno.notas = notas;
    aluno.media = media;

    if (media >= 7) {
        aluno.status = "Aprovado";
    } else if (media >= 5) {
        aluno.status = "Recuperação";
    } else {
        aluno.status = "Reprovado";
    }

    salvarAlunos();
    renderizarAlunosEmCurso();
    renderizarResultados();
    document.getElementById("ficha-aluno").hidden = true;
    alunoSelecionadoIndex = null;

    alert(`${aluno.nome} foi para a lista ${aluno.status}, com média ${media.toFixed(2)}.`);
}

function adicionarAluno() {
    const campoNome = document.getElementById("nome");
    const nome = campoNome.value.trim();
    const turma = document.getElementById("turma").value;

    if (!nome || !turma) {
        alert("Preencha o nome e selecione a turma.");
        return;
    }

    alunos.push({
        nome: nome,
        turma: turma,
        notas: []
    });

    salvarAlunos();
    renderizarAlunosEmCurso();
    renderizarResultados();
    campoNome.value = "";
    document.getElementById("turma").value = "";
    campoNome.focus();
}

document.getElementById("adicionar-aluno").addEventListener("click", adicionarAluno);

document.getElementById("mostrar-alunos").addEventListener("click", function () {
    const card = document.getElementById("card-alunos-curso");
    card.hidden = !card.hidden;
    this.setAttribute("aria-expanded", String(!card.hidden));

    if (!card.hidden) {
        renderizarAlunosEmCurso();
    }
});

document.getElementById("salvar-notas").addEventListener("click", salvarNotasSelecionadas);
document.getElementById("calcular-media").addEventListener("click", calcularMediaAlunoSelecionado);
document.getElementById("logout").addEventListener("click", function () {
    localStorage.removeItem("usuarioLogado");
    window.location.replace("login.html");
});

renderizarAlunosEmCurso();
renderizarResultados();

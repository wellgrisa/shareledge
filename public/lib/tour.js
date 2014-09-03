$(document).ready(function() {
    i18n.init(function(t) {
      var pageguide = tl.pg.init({ pg_caption : i18n.t("main-page.tour.page-help")});
    });
});

function initialiseTour(){
  var tour = new Tour({
    onEnd: finishTour,
    backdrop: true,
    steps: [
    {
      element: "#nav-input-wonder",
      title: "Questionamento",
      content: "Essa área é responsável tanto pela busca de questões já realizadas quanto para registrar uma nova pergunta.",
      placement: "bottom"
    },
    {
      element: "#nav-input-wonder",
      title: "Busca automatizada",
      content: "A busca de questões é realizada automaticamente ao digitar qualquer letra, o sistema irá realizar uma busca pela palavra/frase digitada.",
      placement: "bottom"
    },
    {
      element: "#nav-input-wonder",
      title: "Registrar uma nova Pergunta",
      content: "Para realizar uma pergunta basta apenas escrevê-la e em seguida clicar no botão ASK, que irá abrir uma janela com uma confirmação.",
      placement: "bottom"
    },
    {
      element: "#outstandingQuestions",
      title: "Questões Pendentes",
      content: "Este ícone traz todas as questões pendentes no momento, mostrando um número referente à sua quantidade.",
      placement: "bottom"
    },
    {
      element: "#outstandingQuestionsByUser",
      title: "Questões do usuário logado",
      content: "Este ícone traz todas as questões do usuário logado. O número aqui mostrado é referente as questões feitas pelo usuário que possuem uma nova resposta.",
      placement: "bottom"
    },
    {
      element: "#accordion",
      title: "Área de questões e respostas",
      content: "Essa área é responsável por exibir as questões existentes, de acordo com a pesquisa realizada, ou filtro executado.",
      placement: "bottom"
    },
    {
      element: "#accordion",
      title: "Área de questões e respostas",
      content: "Essa área também é responsável por mostrar as respostas mais votadas em uma pré-visualizaçao logo em baixo da Pergunta.",
      placement: "bottom"
    },
    {
      element: "#accordion",
      title: "Área de questões e respostas",
      content: "Ao clicar em uma pergunta, o sistema exibe as respostas de uma maneira mais detalhada. Juntamente com uma área para também registrar uma resposta.",
      placement: "bottom"
    },
    {
      element: "#accordion",
      title: "Área de questões e respostas",
      content: "Juntamente com as respostas existentes, temos duas ações no canto superior direito do painel, utilizados registrar se a resposta foi útil ou não.",
      placement: "bottom"
    },
    ]});

  tour.init(true);

  tour.start();
}
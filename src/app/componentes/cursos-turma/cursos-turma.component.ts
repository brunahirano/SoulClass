import { LoginService } from 'src/app/servicos/login.service';
import { CursosTurmaService } from './../../servicos/cursos-turma.service';
import { AlunosService } from 'src/app/servicos/alunos.service';
import { TurmasService } from 'src/app/servicos/turmas.service';
import { AulasService } from 'src/app/servicos/aulas.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Aula } from 'src/app/shared/aula';
import { MatSidenav } from '@angular/material/sidenav';
import { Modulo } from 'src/app/shared/modulo';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-cursos-turma',
  templateUrl: './cursos-turma.component.html',
  styleUrls: ['./cursos-turma.component.css']
})
export class CursosTurmaComponent implements OnInit {
  // Variaveis para o modal do angular material
  closeResult = '';

  //Variável para botão ficar dinâmico
  botao = "Adicionar"

  // Variáveis para o select posição do documento no formAula
  selectTipoDoc = ""

  // Variáveis para o select da posição do módulo no form
  selectPosicaoModulo = -2

  // Variáveis para o select de posição da aula no form
  selectPosicaoAula = -2

  // variavel para controlar o upload de um arquivo
  progresso: boolean = false

  // formulários para o módulo e para a aula do módulo
  form!: FormGroup
  formAula!: FormGroup

  // id do curso e da turma que está vindo como parâmetro no link
  paramsCurso = ""
  paramsTurma = ""

  //nome da Turma preenchido através da função que usa como parametro o id na URL
  nomeTurma =""

  // variavel do tipo lista de modulo que armazenará todas os modulos do curso que está sendo visualizado no momento
  vetorModulos: Modulo[] = []

  // variavel para guardar as aulas existentes em um módulo em determinado momento
  vetorAulas: Aula[] = []

  //variável para que o nome do curso e nome da aula fique dinâmico
  nomeCurso = ""
  nomeAula: string = ''

  // controla se o modal será uma edição ou exclusão
  verificacaoKey: boolean = false

  keyModulo: string = ""

  // variaveis para controlar a exibição de elementos no front
  linkDocumento: any
  tipoDocumento: any
  imgDefault: string = '../../assets/img/fotoPadrao.png'

  // variavel para guardar a informação do documento que estava anteriormente anexado e sabermos se podemos excluir o documento anteriormente anexado
  documentoAnterior = ""

  // pega o modulo em que a aula que está sendo modificada está inserida
  moduloEdit = ""

  // guarda a key da aula que está sendo editada no momento
  keyAulaEdit = ""


  // sidebar
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(private modalService: NgbModal,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private cursosturmaService: CursosTurmaService,
    private aulasService: AulasService,
    private turmaService: TurmasService,
    private alunoService: AlunosService,
    private loginservice: LoginService,
    private route: Router,
    private observer: BreakpointObserver){
    //Validações do form
    this.form = this.fb.group({
      nome: ["", [Validators.required]],
      descricao: ["", [Validators.required]],
      posicao: ['-1']
    })
    //Validações do form
    this.formAula = this.fb.group({
      nome: ["", [Validators.required]],
      tipoDocumento: ["", [Validators.required]],
      linkDocumento: [""],
      posicao: ["-1"]
    })

    // variaveis para controlar a exibição de elementos no front
    this.linkDocumento = undefined
    this.tipoDocumento = this.formAula.value.tipoDocumento
  }//constructor

  ngOnInit(): void {
    // id do curso e da turma que está vindo como parâmetro no link
    this.paramsCurso = this.activatedRoute.snapshot.params['curso']
    this.paramsTurma = this.activatedRoute.snapshot.params['turma']

    //pega o nome da Turma através do ID da URL e preenche a variavel nomeTurma
    this.pegarNomeTurma(this.paramsTurma)


    // lista os modulos que estão dentro do curso que está dentro da turma
    this.listarModulos(this.paramsTurma, this.paramsCurso)
  }

  // responsividade do sidebar
  ngAfterViewInit() {
    this.observer
      .observe(['(max-width: 1024px)'])
      .pipe(delay(1))
      .subscribe((res) => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });
  }

  //Função para abri o mat-modal
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }//open

  // modal
  openLg(content: any) {
    this.modalService.open(content, { size: 'lg', scrollable: true });
  }//open

  // função do front para saber a forma de fechamento do modal
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }//getDismissReason

  //função que preenche a variavel 'nomeTurma' com o nome da turma a partir do id do banco de dados passado como parâmetro
  pegarNomeTurma(id:string){
    this.turmaService.pegaNomeTurma(id).then(()=>{
      this.nomeTurma=this.turmaService.nomeTurma
    })
  }

  // função para adicionar um novo módulo dentro da turma. Esse módulo estará apto a receber aulas.
  // @@entrada: extrai os dados de dentro do modal e cria um objeto que será inserido no banco de dados
  // @@saida: insere os dados no banco por intermédio do service
  adicionarModulo() {
    // valida os dados do formulario
    if (this.form.value.nome == "" || this.form.value.descricao == "") {
      this.alunoService.mensagem("Algum ou todos os campos estão inválidos.")
    } else {
      // o módulos podem ser inseridos em diversas posições, no inicio, no fim ou entre outros módulos. Essas variáveis controlam as posições setando o index. O index será utilizado na lógica para reorganizá-los e dessa forma ajustar a ordem para exibição.
      var pos = -1
      if (this.form.value.posicao == -2) {
        pos = this.vetorModulos.length
      } else if (this.form.value.posicao == -1) {
        pos = 0
      }
      else {
        pos = this.form.value.posicao + 1
      }
      const modulo: Modulo = {
        nome: this.form.value.nome,
        descricao: this.form.value.descricao,
        index: pos,
        keyModulo: "",
        dataCriacao: new Date(),
        dataModificacao: new Date(),
        aulas: []
      }
      // função que faz a ordenação dos módulos mediante seus indices
      this.cursosturmaService.organizaModulo(this.paramsTurma, this.paramsCurso, pos, this.vetorModulos, 1)
        .then(() => {
          this.cursosturmaService.adicionarModulo(this.paramsTurma, this.paramsCurso, modulo)
          this.alunoService.mensagem("Módulo adicionado com sucesso.")
        })
    }
  }//adicionarModulo

  // lista os modulos dentro da turma junto de seu conteúdo, uma vez que a o módulo encapsula as aulas
  // @@entrada: id da turma e id do curso para fazer a listagem
  // @@saida: retorna os módulos do curso com as aulas inseridas dentro da propriedade aulas
  listarModulos(keyTurma: string, keyCurso: string) {
    this.cursosturmaService.listarModulos(keyTurma, keyCurso).subscribe((modulos) => {
      // listando todos os modulos
      modulos.forEach((element: any) => {
        // pra cada modulo eu preciso pegar suas Aulas
        // listando as aulas do modulo da atual iteração
        this.cursosturmaService.listarConteudo(this.paramsTurma, this.paramsCurso, element.keyModulo).subscribe((aulas) => {
          // coloca as aulas dentro do módulo
          element.aulas = aulas
        })
      });
      this.vetorModulos = modulos
    })
    this.cursosturmaService.pegarNomeCurso(keyTurma, keyCurso).then(() => {
      this.nomeCurso = this.cursosturmaService.nomeCurso
    }
    )
  }//listarModulos

  // preenche o modal de edição com os dados do modulo clicado na listagem
  // @@entrada: pega o objeto do tipo modulo que foi clicado
  // @@saida: envia os dados para preencher o modal que permite a edição
  preencheEditarModulo(modulo: Modulo) {
    this.botao = "Editar"
    this.verificacaoKey = true

    this.form.patchValue({
      nome: modulo.nome,
      descricao: modulo.descricao
    })
    this.keyModulo = modulo.keyModulo
  }//preencheEditarModulo

  // função que decide se será feita uma edição ou adição e chama as respectivas funções
  // @@entrada: nenhuma
  // @@saida: chama as funções que fazem a edição ou adição
  salvarModulo() {
    if (this.verificacaoKey === false) {
      this.adicionarModulo()
    } else {
      this.SalvarEdicaoModulo(this.keyModulo)
    }
  }//salvarModulo

  // função para persistir as alterações realizadas por meio do modal
  // @@entrada: id do modulo que foi editado
  // @@saida: chama o service para que os novos dados sejam salvos no banco
  SalvarEdicaoModulo(keyModulo: string) {
    if (this.form.value.nome == "" || this.form.value.descricao == "") {
      console.log("campos inválidos")

      //Mensagem Toast de retorno
      this.alunoService.mensagem("Algum ou todos os campos estão inválidos.")
    } else {
      const MODULO: any = {
        nome: this.form.value.nome,
        descricao: this.form.value.descricao,
        dataModificacao: new Date(),
      }
      console.log(this.paramsCurso, MODULO, keyModulo)
      this.cursosturmaService.editarModulo(this.paramsTurma, this.paramsCurso, MODULO, keyModulo)
      this.alunoService.mensagem("Módulo editado com sucesso.")

      this.form.reset()
      this.botao = "Cadastrar"
    }
  }//SalvarEdicaoModulo

  // função para excluir o modulo
  // @@entrada: objeto do modulo que será excluído
  // @@saida: chamada o service para fazer a deleção do modulo, ele tbm exclui as aulas, uma vez que não faz sentido ter aulas sem módulo
  excluirModulo(modulo: any) {
    this.cursosturmaService.excluirModulo(this.paramsTurma, modulo.keyModulo, modulo.index, this.paramsCurso, this.vetorModulos, -1)

    this.alunoService.mensagem("Módulo excluído com sucesso.")
  }//excluirModulo

  // função para limpar o modal e preparar as variaveis que controlam o comportamento de adição e edição, uma vez que o mesmo modal é utilizado para realizar as duas ações
  // @@entrada: nenhuma
  // @@saida: toggle nas variáveis
  resetModal() {
    this.botao = "Cadastrar"
    this.form.reset()
    this.formAula.reset()
    this.verificacaoKey = false
  }

    // função para limpar o modal e preparar as variaveis que controlam o comportamento de adição e edição, uma vez que o mesmo modal é utilizado para realizar as duas ações
  // @@entrada: nenhuma
  // @@saida: toggle nas variáveis
  resetModal2(modulo: Modulo) {
    this.botao = "Cadastrar"
    this.form.reset()
    this.formAula.reset()
    this.selectTipoDoc = ''
    this.verificacaoKey = false
    this.keyModulo = modulo.keyModulo

    this.cursosturmaService.listarConteudo(this.paramsTurma, this.paramsCurso, this.keyModulo).subscribe(result => {
      this.vetorAulas = result
    })
    this.linkDocumento = ''
    this.tipoDocumento = ''
    this.nomeAula = ''
  }

  // função que faz a criação de novas aulas mediante o preenchimento do formulário
  // @@entrada: informações vindas do modal de formulário
  // @@saida: dados para o banco de dados
  addAula() {
    if (this.formAula.value.nome == "" || this.formAula.value.tipoDocumento == "") {
      this.alunoService.mensagem("Algum ou todos os campos estão inválidos.")
    }
    // controla a posição das aulas da mesma forma que ocorre com os módulos, a variavel index recebe um valor inicial dependendo da seleção do usuário. Esse index é posteriormente ajustado, ordenando a exibição para o usuário
    else {
      var pos = -1
      if (this.formAula.value.posicao == -2) {
        pos = this.vetorAulas.length
        console.log('if 1', pos)
      } else if (this.formAula.value.posicao == -1) {
        pos = 0
        console.log('if 2', pos)
      }
      else {
        pos = parseInt(this.formAula.value.posicao) + 1
        console.log('if 3', pos)
        console.log(this.formAula.value.posicao)
      }

      const AULA = new Aula()
      AULA.nome = this.formAula.value.nome
      AULA.tipo = this.formAula.value.tipoDocumento
      AULA.link = this.linkDocumento
      AULA.index = pos

      // organiza os indices e adiciona a aula ao banco
      this.cursosturmaService.organizaAula(this.paramsTurma, this.paramsCurso, this.keyModulo, pos, this.vetorAulas, 1).then(() => {
        this.cursosturmaService.AdicionarAula(this.paramsTurma, this.keyModulo, this.paramsCurso, AULA).then(() => {
          this.alunoService.mensagem("Aula adicionada com sucesso.")
        })
      })
    }
  }//addAula

  // função para efetuar a edição de aula e inserir a alteração no banco por meio do service
  // @@entrada: dados vindos do formulário dentro do modal
  // @@saida: dados para serem salvados no banco de dados
  editarAula() {
    if (this.formAula.value.nome == "" || this.formAula.value.tipoDocumento == "") {
      console.log("campos inválidos")
      this.alunoService.mensagem("Algum ou todos os campos estão inválidos.")
    } else {

      // se o arquivo anexado mudar temos que excluir o antigo
      if (this.linkDocumento != this.documentoAnterior && this.linkDocumento != "") {
        this.turmaService.excluirDadoStorage(this.documentoAnterior)
      }
      // criação do objeto para inserção
      const Aula = {
        nome: this.formAula.value.nome,
        tipo: this.formAula.value.tipoDocumento,
        link: this.linkDocumento,
        dataModificacao: new Date()
      }

      // chama o service para efetuar a atualização dos dados no banco de dados
      this.cursosturmaService.updateAula(this.paramsTurma, Aula, this.paramsCurso, this.moduloEdit, this.keyAulaEdit).then(() => {
        this.alunoService.mensagem("Aula editada com sucesso.")
      })
    }
  }

  // função para consultar a key e decidir se será uma adição ou edição
  // @@entrada: nenhuma
  // @@saida: chama as funções que fazem a edição ou salvamento dos dados do modal
  verificaSalvamento() {
    if (this.verificacaoKey == false) {
      this.addAula()
    } else {
      this.editarAula()
    }
  }//verificaSalvamento

  // função que efetua a exclusão das aulas
  // @@entrada: vetor contendo as aulas, o objeto da aula, o objeto do modulo que contém a aula
  // @@saida: chama o service que faz a exclusão
  excluirAula(vetorAula: any, aula: any, modulo: any) {
    // excluindo o conteúdo vinculado à aula do storage
    if (aula.link != "") {
      this.turmaService.excluirDadoStorage(aula.link)
    }
    // organiza os indices e faz a exclusão da aula
    this.cursosturmaService.organizaAula(this.paramsTurma, this.paramsCurso, modulo.keyModulo, aula.index, vetorAula, -1).then(() => {
      this.cursosturmaService.excluirAula(this.paramsTurma, this.paramsCurso, modulo.keyModulo, aula.keyAula)
      this.alunoService.mensagem("Aula excluída com sucesso.")
    })
  }//excluirAula

  // função que pega o evento de anexo do arquivo e chama o service para enviar a imagem para o storage
  // @@entrada: evento do upload do arquivo
  // @@saida: coloca na variavel linkDocumento a url da imagem no storage
  carregarDocumento(event: any) {
    let arquivo = event.target.files;
    // função para fazer a leitura do arquivo
    let reader = new FileReader();
    this.progresso = true

    // função para ler o aquivo
    reader.readAsDataURL(arquivo[0]);
    // quando terminar de carregar a foto
    var nomeAula = 'Aula' + Date.now();
    reader.onloadend = () => {
      // this.imagem = reader.result
      this.aulasService.carregarAula(nomeAula, reader.result).then((documento) => {
        this.linkDocumento = documento;
        this.progresso = false
      });
    };
  }//carregarDocumento

    // evento que é disparado quando ocorre uma mudança no modal de seleção do formato de arquivo. Isso filtra os documentos que aparecem no explorer
  changeDocumento(event: any) {
    this.linkDocumento = '';
    this.tipoDocumento = this.formAula.value.tipoDocumento
  }//changeDocumento

  // preenche os dados da aula selecionada no modal e preenche as variáveis que controlam o funcionamento dos modais
  preencherModalAula(aula: any, modulo: any) {
    this.linkDocumento = aula.link
    // pegando o documento que estava antes de começar a edição, caso o link mude temos que excluir o antigo
    this.documentoAnterior = aula.link
    this.tipoDocumento = aula.tipo
    this.verificacaoKey = true
    this.selectTipoDoc = aula.tipo

    this.formAula.patchValue({
      nome: aula.nome,
      tipoDocumento: aula.tipo,
      posicao: aula.posicao,
    })
    // pegando o documento que estava antes de começar a edição, caso o link mude temos que excluir o antigo

    this.botao = "Editar"
    this.nomeAula = aula.nome
    // pega o modulo em que a aula que está sendo modificada está inserida
    this.moduloEdit = modulo
    // pega a key da aula que está sendo editada no momento
    this.keyAulaEdit = aula.keyAula
  }//preencherModalAula

   // logout da aplicação
   logout() {
    this.loginservice.doLogout();
    this.route.navigate(['/']);
  }//logout

}//classe

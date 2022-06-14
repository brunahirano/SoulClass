import { Router } from '@angular/router';
import { LoginService } from './../../servicos/login.service';
import { AlunosService } from './../../servicos/alunos.service';
import { TurmasService } from 'src/app/servicos/turmas.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CursosService } from 'src/app/servicos/cursos.service.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Curso } from 'src/app/shared/cursos';
import { Injectable } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MatSidenav } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css'],
})
export class CursosComponent implements OnInit {
  // usada para armazenar a url da imagem que foi/será upada no storage
  urlImagem: string = '';

  // usada para controlar a aparição da barra de progresso
  progresso: boolean = false;

  // usado para controlar se os modais e funções serão ativados para edição ou para adição
  id: any = undefined;

  // Ação btn (HTML)
  acaoBtn: string = 'Salvar';

  // usado para trazer os dados do formulario do HTML
  form: FormGroup;

  // usado para armazenar os cursos presentes no banco
  cursos: Curso[] = [];

  //variavel para o material
  closeResult = '';

  // URL da imagem padrão (placeholder)
  imagemPlaceHolder = './src/assets/img/fotoPadrao.png';

  // variável para utilizar a biblioteca de filtro
  filterTerm: string = '';

  // sidebar
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(
    private cursoService: CursosService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private alunoservice: AlunosService,
    private turmaService: TurmasService,
    private observer: BreakpointObserver,
    private loginservice: LoginService,
    private route: Router
  ) {
    //validações de form
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: ['', [Validators.required]],
      foto: [''],
    });
  }

  ngOnInit(): void {
    // traz os cursos que devem ser mostrados na página
    this.listarCursos();
  }

  // Funçao para criar um novo curso e inseri-lo no banco
  // @@entrada: tira os dados diretamente do formulário os encapsula em um objeto
  // @@saida: faz o acesso ao banco por meio do serviço. Esse acesso gera uma adição no banco na collection Cursos
  criarCurso(): void {
    // condicional para validação dos campos obrigatórios no backend
    if (this.form.value.nome == '' || this.form.value.descricao == '') {
      console.log('campos inválidos');
      this.alunoservice.mensagem('Algum ou todos os campos estão inválidos.');
    } else {
      // objeto do curso que será enviado ao banco
      const CURSO = {
        nome: this.form.value.nome,
        descricao: this.form.value.descricao,
        foto: this.urlImagem,
        dataCriacao: new Date(),
        dataModificacao: new Date()
      };
      // chamada do service para que ele acesse o banco e faça a adição desse novo registro
      this.cursoService.inserirCurso(CURSO).then(
        () => {
          console.log('curso add com sucesso');
          this.alunoservice.mensagem('Curso incluído com sucesso');
        },
        (error) => {
          console.log(error);
        }
      );
    }
  } //criarCurso

  //Lista os cursos do banco de dados e guarda na variável cursos (array)
  // @@entrada: nenhuma
  // @@saida: coloca os documentos presentes na collection Cursos dentro da variável cursos
  listarCursos() {
    this.cursoService.listarCursos().subscribe((doc) => {
      console.log(doc);
      this.cursos = doc;
    });
  } //listarCursos

  //Pega as informações do modal e as envia para serem alteradas no banco
  // @@entrada: pega os dados diretamente do formulario dentro do modal
  // @@saida: envia o objeto com os dados para serem alterados e o identificador do curso para que o service faça a consulta ao banco e consequente atualização
  editarCurso() {
    // condicional para validação dos campos obrigatórios no backend
    if (this.form.value.nome == '' || this.form.value.descricao == '') {
      console.log('campos inválidos');
      this.alunoservice.mensagem('Algum ou todos os campos estão inválidos.');
    } else {
      // objeto para ser atualizado no banco
      const CURSO = {
        nome: this.form.value.nome,
        descricao: this.form.value.descricao,
        foto: this.urlImagem,
        dataModificacao: new Date(),
      };
      // acesso ao service
      this.cursoService.update(CURSO, this.id);

      this.alunoservice.mensagem('Curso editado com sucesso');
      // modal usado para diferenciar a adição da edição
      this.id = undefined;
    }
  } //editarCurso

  //Função para abrir modal material
  open(content: any) {
    this.modalService.open(content, { size: 'md' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  } //modal

  //Configurações para modal do material
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  } //getDismissReason

  //função que controla ao comportamento do modal. Diferencia se o modal será de adição ou edição, chamando a função de acordo.
  // @@entrada: nenhuma
  // @@saida: as chamadas das respectivas funções
  acaoBotaoSalvar() {
    if (this.id === undefined) {
      this.criarCurso();
    } else {
      this.editarCurso();
    }
  } //acaoBotaoSalvar

  //Função para resetar Modal
  reseteModal() {
    this.form.reset();
    this.acaoBtn = 'Adicionar';
    this.urlImagem = '../../assets/img/fotoPadrao.png';
  } //reseteModal

  //Função para deletar um curso do banco de dados e da plataforma. Faz a deleção de todas os módulos e aulas inseridas dentro de um curso
  // @@entrada: um objeto de um curso contendo os dados necessários para efetuar a exclusão
  // @@saida: acesso ao service que fará a exclusão
  deletarCursos(curso: any) {
    // excluindo a imagem do curso que está no storage
    this.cursoService.deletarCursos(curso.key);
    if (curso.foto != '' && curso.foto != '../../assets/img/fotoPadrao.png') {
      this.turmaService.excluirDadoStorage(curso.foto);
    }
    this.alunoservice.mensagem('Curso excluído com sucesso');
  } //deletarCursos

  //Preenche o formulário do modal de edição com as infos do Curso que vai ser editado, ou seja, com as infos que já estão no banco de dados
  // @@entrada: pega os dados da lista
  // @@saida: coloca os dados dentro do modal
  verificaEdicao(Modelo: Curso) {
    this.acaoBtn = 'Editar';
    this.form.patchValue({
      nome: Modelo.nome,
      descricao: Modelo.descricao,
    });
    this.urlImagem = Modelo.foto;
    this.id = Modelo.key;
  } //verificaEdicao

  //Carrega uma imagem no storage e coloca a url dessa na variavel valorImg
  // @@entrada: o evento de inserção de arquivo
  // @@saida: coloca a url de imagem proveninente da imagem dentro da variavel valorImg para colocar no banco
  carregarImagem(event: any) {
    // pegando o arquivo que está vindo do evento (o upload da foto)
    let arquivo = event.target.files;
    // função para fazer a leitura do arquivo
    let reader = new FileReader();
    this.progresso = true;
    // função para ler o aquivo
    reader.readAsDataURL(arquivo[0]);
    // quando terminar de carregar a foto
    reader.onloadend = () => {
      this.cursoService
        .carregarImagem('thumbTurma' + Date.now(), reader.result)
        .then((urlImagem) => {
          this.urlImagem = urlImagem;
          console.log('urlImage', this.urlImagem);
          this.progresso = false;
        });
    };
  } //carregarImagem

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
  // logout da aplicação
  logout() {
    this.loginservice.doLogout();
    this.route.navigate(['/login']);
  }
} //classe

import { AlunosService } from 'src/app/servicos/alunos.service';
import { Component, OnInit } from '@angular/core';
import { TurmasService } from 'src/app/servicos/turmas.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-turmas',
  templateUrl: './turmas.component.html',
  styleUrls: ['./turmas.component.css']
})
export class TurmasComponent implements OnInit {
  // variavel para checar se uma nova imagem deve ser inserida no registro da turma
  imagem:any =""

  // variavel do form, para trazer os dados do front
  form: FormGroup;

  // variavel para armazenar o link da imagem que será inserida no storage e representará a turma (thumbdaTurma)
  urlImagem: string

  // variavel para controlar a exibição da barra de progresso quando houver um upload de arquivo
  progresso:boolean = false

  constructor(private fb: FormBuilder, private serviceTurma: TurmasService, public dialog: MatDialogRef<TurmasComponent>, @Inject(MAT_DIALOG_DATA) public msg: string, private alunoservice: AlunosService, private turmaservice: TurmasService) {
    // variavel que guarda a imagem que será anexada junto ao registro da turma
    this.urlImagem = ''

    // validação do formulario
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      foto: ['']
    })
  }//constructor

  ngOnInit(): void {
    // gera uma imagem de placeholder, para caso nenhuma imagem seja vinculada
    this.urlImagem = '../../assets/img/fotoPadrao.png'
  }//ngOnInit

  // função para criar uma nova turma pegando os dados do formulario de criação da turma
  // @@entrada: pega os dados do formulário de cadastro
  // @@saida: envia os dados para que o service faça o acesso ao banco, criando um novo registro na collection
  criarTurma(): void {
    if (this.form.value.nome == "" || this.form.value.descricao == "") {
      this.alunoservice.mensagem("Algum ou todos os campos estão inválidos.")
    } else {
      // objeto com os dados para salvamento no banco
      const TURMA = {
        nome: this.form.value.nome,
        descricao: this.form.value.descricao,
        foto: this.urlImagem,
        dataCriacao: new Date(),
        dataModificacao: new Date()
      }
      // chamada do service para criar a turma
      this.serviceTurma.criarTurma(TURMA).then(resultado => console.log(resultado))
      this.alunoservice.mensagem("Turma criada com sucesso")
      this.dialog.close()
    }
  }//criarTurma

  // carrega uma imagem no storage e coloca a url dessa na variavel this.urlImagem
  // pega o evento do onchange do input, ou seja, pega o arquivo que foi inserido no input e faz o upload pro storage
  // @@entrada: o evento da anexação do arquivo
  carregarImagem(event:any){
    // pegando o arquivo que está vindo do evento (o upload da foto)
    let arquivo = event.target.files
    // função para fazer a leitura do arquivo
    let reader = new FileReader()
    this.progresso = true
    // função para ler o aquivo
    reader.readAsDataURL(arquivo[0])
    // quando terminar de carregar a foto
    reader.onloadend = () => {
      this.imagem = reader.result
      this.serviceTurma.carregarImagem("thumbTurma" + Date.now(), reader.result).then(urlImagem => {
        this.urlImagem = urlImagem
        this.progresso = false
      })
    }
  }//carregarImagem
}//classe

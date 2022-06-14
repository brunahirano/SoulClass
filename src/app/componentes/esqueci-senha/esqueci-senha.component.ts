import { AlunosService } from './../../servicos/alunos.service';
import { Component, OnInit } from '@angular/core';
import { getAuth, sendEmailVerification } from "firebase/auth";
import { LoginComponent } from '../login/login.component';
import { LoginService } from 'src/app/servicos/login.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-esqueci-senha',
  templateUrl: './esqueci-senha.component.html',
  styleUrls: ['./esqueci-senha.component.css']
})
export class EsqueciSenhaComponent implements OnInit {

  registroForm!: FormGroup;
  erroMensagem!: string;
  sucessoMensagem!: string;
  span!: string;

  mModal: boolean = false

  constructor(private loginService:LoginService, private route: Router, private alunoService: AlunosService) { }

  ngOnInit(): void {
    this.registroForm = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    })
  }
  //Função para redefinição da senha do usuário
  senha(value: any){
    this.loginService.Resetarsenha(value).then((res:any)=>{
      console.log(res);
      // this.sucessoMensagem = "Email para redefinição de senha enviado com sucesso"
      this.alunoService.mensagem("Email para redefinição de senha enviado com sucesso.")
    },
    (err:any) => {
      console.log(err);
      // this.erroMensagem = err.message;
      // this.sucessoMensagem = '';

      // Caso e-mail ou senha não sejam encontrados no BD, irá aparecer mensagem de erro e o form será resetado.
      this.alunoService.mensagem("E-mail não cadastrado.")
      this.registroForm.reset()
    })
  }



  //mostrar modal com mensagem de sucesso
  // mostrarModal(){
  //   this.mModal = true
  // }

}

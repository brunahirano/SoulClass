import { AlunosService } from './../../servicos/alunos.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginService } from 'src/app/servicos/login.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  erroMensagem!: string;

  constructor(private loginService:LoginService, private route: Router, private alunoService: AlunosService) {
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(),
      password: new FormControl(),
    })
  }

//Função para validar o login do usuário
  login(value: any) {
    this.loginService.doLogin(value).then(
      (res) => {
        this.erroMensagem= '';
        this.route.navigate(['/cardsTurmas']);
      },
      (err) => {
        // this.erroMensagem = err.message;
        // this.erroMensagem= 'Email ou senha estão incorretos.';

        // Caso e-mail ou senha não sejam encontrados no BD, irá aparecer mensagem de erro e o form será resetado.
        this.alunoService.mensagem("Email ou senha estão incorretos.")
        this.loginForm.reset()
      }
    );
  }

}

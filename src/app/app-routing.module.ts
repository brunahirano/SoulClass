import { EsqueciSenhaComponent } from './componentes/esqueci-senha/esqueci-senha.component';
import { LoginComponent } from './componentes/login/login.component';
import { CursosTurmaComponent } from './componentes/cursos-turma/cursos-turma.component';
import { TesteComponent } from './componentes/teste/teste.component';
import { ModulosComponent } from './componentes/modulos/modulos.component';
import { CardsTurmasComponent } from './componentes/cards-turmas/cards-turmas.component';
import { ConteudoTurmaComponent } from './componentes/conteudo-turma/conteudo-turma.component';
import { CursosComponent } from './componentes/cursos/cursos.component';
import { TurmasComponent } from './componentes/turmas/turmas.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AngularFireAuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/compat/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['/cardsTurmas']);


const routes: Routes = [
  {path: '', redirectTo: '/login',pathMatch: 'full', data: { authGuardPipe: redirectLoggedInToHome }},
  {path: 'login', component: LoginComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectLoggedInToHome }},
  {path: 'senha',component:EsqueciSenhaComponent},
  {path: 'aluno/:turma', component: ConteudoTurmaComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin}},
  {path: 'cardsTurmas', component: CardsTurmasComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin}},
  {path: 'cursos', component: CursosComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin}},
  {path: 'modulo/:curso', component: ModulosComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin}},
  {path: 'curso/:turma/:curso', component: CursosTurmaComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

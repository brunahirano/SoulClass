import { LoginComponent } from './componentes/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { CursosComponent } from './componentes/cursos/cursos.component';
import { TurmasComponent } from './componentes/turmas/turmas.component';
import { ConteudoTurmaComponent } from './componentes/conteudo-turma/conteudo-turma.component';
import { CardsTurmasComponent } from './componentes/cards-turmas/cards-turmas.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CursosTurmaComponent } from './componentes/cursos-turma/cursos-turma.component';
import { TesteComponent } from './componentes/teste/teste.component';
import { traduzirLegendas } from './componentes/conteudo-turma/traducaoPag';
import { ModulosComponent } from './componentes/modulos/modulos.component';
import { EsqueciSenhaComponent } from './componentes/esqueci-senha/esqueci-senha.component';

//APIS externas
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

//Modules para formulário
import { FormsModule } from '@angular/forms';

// Importando componentes do material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

//Componentes do Bootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    CursosComponent,
    TurmasComponent,
    ConteudoTurmaComponent,
    CardsTurmasComponent,
    ModulosComponent,
    TesteComponent,
    CursosTurmaComponent,
    LoginComponent,
    EsqueciSenhaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    ReactiveFormsModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatProgressBarModule,
    MatMenuModule,
    NgbModule,
    NgbModalModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatTableModule,
    MatSelectModule,
    NgxDocViewerModule,
    Ng2SearchPipeModule,
    MatAutocompleteModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useValue: traduzirLegendas() }],
  bootstrap: [AppComponent],
})
export class AppModule {}

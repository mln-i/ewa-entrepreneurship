import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule, Routes } from "@angular/router";
// import { RoleGuard } from "./services/roleguard.service";
import { AuthGuard } from "./services/authguard.service";

import { AppComponent } from "./app.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { ProfilepageComponent } from "./profilepage/profilepage.component";
import { NotfoundpageComponent } from "./notfoundpage/notfoundpage.component";
import { TeacherhomepageComponent } from "./teacherhomepage/teacherhomepage.component";
import { StudenthomepageComponent } from "./studenthomepage/studenthomepage.component";
import { AdminhomepageComponent } from "./adminhomepage/adminhomepage.component";
import { LoginComponent } from "./login/login.component";
import { RegistrationpageComponent } from "./registrationpage/registrationpage.component";
import { CompetencetestpageComponent } from "./competencetestpage/competencetestpage.component";
import { CompetenceresultpageComponent } from "./competenceresultpage/competenceresultpage.component";

import { FilterTable } from "./pipes/filtertable.pipe";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from "ngx-toastr";
import { NgxPaginationModule } from "ngx-pagination";

const appRoutes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "registration", component: RegistrationpageComponent },
  {
    path: "adminhome",
    component: AdminhomepageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "studenthome",
    component: StudenthomepageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "teacherhome",
    component: TeacherhomepageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "profile",
    component: ProfilepageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "competencetest",
    component: CompetencetestpageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "competenceresults",
    component: CompetenceresultpageComponent,
    canActivate: [AuthGuard]
  },
  // { path: "competenceresults/:id", component: CompetenceresultpageComponent, canActivate: [AuthGuard]},
  { path: "**", component: NotfoundpageComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ProfilepageComponent,
    NotfoundpageComponent,
    TeacherhomepageComponent,
    StudenthomepageComponent,
    AdminhomepageComponent,
    LoginComponent,
    RegistrationpageComponent,
    CompetencetestpageComponent,
    CompetenceresultpageComponent,
    FilterTable
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule, // required animations module
    NgxPaginationModule,
    ToastrModule.forRoot({
      timeOut: 2500,
      positionClass: "toast-top-right",
      preventDuplicates: true,
      maxOpened: 1
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { ToastrService } from "ngx-toastr";
import { TokenService } from "../services/token.service";
import { NavbarService } from "../services/navbar.service";

import { Userdata } from "../models/userdata";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit {
  user = new Userdata(
    null, //firstname
    null, //lastname
    null, //email
    null, //classname
    null, //role
    null, //teacher
    null //class
  );

  constructor(
    public navbar: NavbarService,
    private _http: HttpClient,
    private toastr: ToastrService,
    private token: TokenService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getUserData();
  }

  getUserData() {
    let token = this.token.getToken();

    if (token !== null) {
      let jwtData = token.split(".")[1];
      let decodedJwtJsonData = window.atob(jwtData);
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      let email = decodedJwtData.sub;
      var _getUserIdUrl = "http://localhost:8080/api/users/user/id/" + email;

      this._http.get<any>(_getUserIdUrl).subscribe(response => {
        var _getUserUrl = "http://localhost:8080/api/users/user/" + response;

        this._http.get<any>(_getUserUrl).subscribe(response => {
          this.user.first_name = response.first_name;
          this.user.last_name = response.last_name;
          this.user.role = response.role;
        });
      });
    }
  }

  redirectHome(role: string) {
    switch (role) {
      case "Student":
        this.router.navigateByUrl("/studenthome");
        break;
      case "Teacher":
        this.router.navigateByUrl("/teacherhome");
        break;
      case "Admin":
        this.router.navigateByUrl("/adminhome");
        break;
      default:
        this.router.navigateByUrl("/login");
        break;
    }
  }

  logOut() {
    localStorage.removeItem("currentUser");
  }
}

import { Component, OnInit } from "@angular/core";
import { Userlogin } from "../models/userlogin";
import { Router } from "@angular/router";
import {
  HttpClient,
  HttpHeaders,
  HttpResponse
} from "@angular/common/http";

import { ToastrService } from "ngx-toastr";
import { TokenService } from "../services/token.service";
import { NavbarService } from "../services/navbar.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  userLoginModel = new Userlogin("", "", "");

  constructor(
    private token: TokenService,
    private router: Router,
    public navbar: NavbarService,
    private toastr: ToastrService,
    private _http: HttpClient
  ) {}

  ngOnInit() {
    this.navbar.hide();
  }

  onLoginSubmit() {
    var _loginUrl = "http://localhost:8080/login";
    var promise = this._http.post(_loginUrl, this.userLoginModel);

    if (this.userLoginModel.email === "") {
      this.toastr.error("Email address field is empty!", "Login failed!");
    }
    if (this.userLoginModel.password === "") {
      this.toastr.error("Password field is empty!", "Login failed!");
    } else {
      this._http
        .post<any>(
          _loginUrl,
          JSON.stringify({
            email: this.userLoginModel.email,
            password: this.userLoginModel.password
          }),
          {
            headers: new HttpHeaders({ "Content-Type": "application/json" }),
            observe: "response" as "response"
          }
        )
        .subscribe(
          (resp: HttpResponse<any>) => {
            //console.log(resp.headers.get('Authorization'))
            let jwt = resp.headers.get("Authorization");
            let jwtData = jwt.split(".")[1];
            let jwtDecode = window.atob(jwtData);
            let jwtJSONData = JSON.parse(jwtDecode);
            let auth = jwtJSONData.authorities;
            let email = jwtJSONData.sub;
            var _getUserId = "http://localhost:8080/api/users/user/id/" + email;

            this._http.get<any>(_getUserId).subscribe(response => {
              var _resultsUrl =
                "http://localhost:8080/api/results/user/" + response;

              if (resp.headers.get("Authorization")) {
                this.token.setToken(resp.headers.get("Authorization"));
              } else {
                this.toastr.error("Something went wrong...", "Login failed!");
              }

              if (auth == "Student") {
                this._http
                  .get<any>(_resultsUrl, {
                    observe: "response" as "response"
                  })
                  .subscribe(
                    (response: any) => {
                      // console.log(response);

                      if (response) {
                        this.router.navigateByUrl("/studenthome");
                        location.reload();
                      }
                    },
                    error => {
                      if (error.status === 404) {
                        this.router.navigateByUrl("/competencetest");
                      }
                    }
                  );
              }
              if (auth == "Teacher") {
                this.router.navigateByUrl("/teacherhome");
                location.reload();
              } else if (auth == "Admin") {
                this.router.navigateByUrl("/adminhome");
                location.reload();
              }
            });
          },
          error =>
            this.toastr.error(
              "The email or password you’ve entered doesn’t match any account.",
              "Login failed!"
            )
        );
    }
  }
}

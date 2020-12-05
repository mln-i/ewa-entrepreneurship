import { Component, OnInit, ElementRef } from "@angular/core";
import { User } from "../models/user";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

import { ToastrService } from "ngx-toastr";
import { NavbarService } from "../services/navbar.service";

@Component({
  selector: "app-registrationpage",
  templateUrl: "./registrationpage.component.html",
  styleUrls: ["./registrationpage.component.scss"]
})
export class RegistrationpageComponent implements OnInit {
  accountRoles = ["Student", "Teacher"];

  registerUserModel = new User(
    null,
    null,
    null,
    null,
    null,
    "Student",
    null,
    null,
    0
  );

  constructor(
    private router: Router,
    public navbar: NavbarService,
    private toastr: ToastrService,
    private _http: HttpClient,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.navbar.hide();
  }

  onKey(event: any) {
    var id = event.target.id;

    if (event.target.value != "") {
      document.getElementById(id).style.backgroundColor = "#66BB6A";
      document.getElementById(id).style.color = "white";
    } else {
      document.getElementById(id).style.backgroundColor = "white";
      document.getElementById(id).style.color = "black";
    }
  }

  onKeyPassword(event: any) {
    var id = event.target.id;

    if (event.target.value.length >= 6) {
      document.getElementById(id).style.backgroundColor = "#66BB6A";
      document.getElementById(id).style.color = "white";
    } else {
      document.getElementById(id).style.backgroundColor = "white";
      document.getElementById(id).style.color = "black";
    }
  }

  onKeyEmail(event: any) {
    var id = event.target.id;

    if (
      event.target.value.match(
        "[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}"
      )
    ) {
      document.getElementById(id).style.backgroundColor = "#66BB6A";
      document.getElementById(id).style.color = "white";
    } else {
      document.getElementById(id).style.backgroundColor = "white";
      document.getElementById(id).style.color = "black";
    }
  }

  registrationFail() {
    this.toastr.error(
      "Please fill in all the required fields.",
      "Registration failed!"
    );
  }

  doRegistration() {
    var _registrationUrl = "http://localhost:8080/api/users";
    var promise = this._http.post(_registrationUrl, this.registerUserModel);

    promise
      .toPromise()
      .then(response => {
        this.toastr.success(
          "You have successfully registered! Redirecting...",
          "Success!"
        );
        setTimeout(() => {
          this.router.navigateByUrl("/login");
        }, 3000);
      })
      .catch(error => {
        this.toastr.error(
          "Another account is using " + this.registerUserModel.email,
          "Registration fail!"
        );
      });
  }
}

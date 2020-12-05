import { Component, OnInit } from "@angular/core";
import { NavbarService } from "./services/navbar.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "EWA-Entrepreneurship";

  p: number = 1;

  constructor(public navbar: NavbarService) {}

  ngOnInit() {
    this.navbar.show();
  }
}

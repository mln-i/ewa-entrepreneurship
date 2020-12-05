import { Component, OnInit } from "@angular/core";
import { Chart } from "chart.js";

import { TokenService } from "../services/token.service";
import { HttpClient } from "@angular/common/http";

import { Result } from "../models/result";
import { Userdata } from "../models/userdata";
import * as jsPDF from "jspdf";
import "chartjs-plugin-datalabels";

@Component({
  selector: "app-profilepage",
  templateUrl: "./profilepage.component.html",
  styleUrls: ["./profilepage.component.scss"]
})
export class ProfilepageComponent implements OnInit {
  User = new Userdata(
    null, //id
    null, //email
    null, //firstname
    null, //lastname
    null, //role
    null, //teacher
    null //class
  );

  // All Arrays
  userResults: Result[] = new Array();
  score: number[] = new Array();
  scoreCompareResults: number[] = new Array();
  subCompetences: String[] = new Array();
  resultDates: string[] = new Array();

  selectedTestDateFirstDropdown: string = "Select Test Result Date";
  selectedTestDateSecondDropdown: string = "Select Test Result Date";
  myChart: any;

  constructor(private token: TokenService, private _http: HttpClient) {}

  ngOnInit() {
    this.getSubCompetences();
    this.getUserData();

    var ctx = document.getElementById("myChart");

    this.myChart = new Chart(ctx, {
      type: "horizontalBar",
      data: {
        labels: this.subCompetences,
        datasets: [
          {
            label: "Competence Score",
            backgroundColor: [
              "rgba(54, 162, 225, 1.0)",
              "rgba(54, 162, 225, 1.0)",
              "rgba(54, 162, 225, 1.0)",
              "rgba(54, 162, 225, 1.0)",
              "rgba(54, 162, 225, 1.0)",
              "rgba(153, 102, 225, 1.0)",
              "rgba(153, 102, 225, 1.0)",
              "rgba(153, 102, 225, 1.0)",
              "rgba(153, 102, 225, 1.0)",
              "rgba(153, 102, 225, 1.0)",
              "rgba(225, 159, 64, 1.0)",
              "rgba(225, 159, 64, 1.0)",
              "rgba(225, 159, 64, 1.0)",
              "rgba(225, 159, 64, 1.0)",
              "rgba(225, 159, 64, 1.0)"
            ],
            data: this.score
          },
          {
            label: "Competence Score",
            backgroundColor: [
              "rgba(54, 162, 225, 0.5)",
              "rgba(54, 162, 225, 0.5)",
              "rgba(54, 162, 225, 0.5)",
              "rgba(54, 162, 225, 0.5)",
              "rgba(54, 162, 225, 0.5)",
              "rgba(153, 102, 225, 0.5)",
              "rgba(153, 102, 225, 0.5)",
              "rgba(153, 102, 225, 0.5)",
              "rgba(153, 102, 225, 0.5)",
              "rgba(153, 102, 225, 0.5)",
              "rgba(225, 159, 64, 0.5)",
              "rgba(225, 159, 64, 0.5)",
              "rgba(225, 159, 64, 0.5)",
              "rgba(225, 159, 64, 0.5)",
              "rgba(225, 159, 64, 0.5)"
            ],
            data: this.scoreCompareResults
          }
        ]
      },
      options: {
        plugins: {
          datalabels: {
            display: false,
            align: "center",
            anchor: "center",
            color: "#FFFFFF",
            font: {
              style: "bold"
            }
          }
        },
        legend: { display: false },
        title: {
          display: true,
          text: "Progress Overview"
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ],
          xAxes: [
            {
              // barPercentage: 1.0,
              // categoryPercentage: 0.7,
              ticks: {
                display: true,
                min: 0
              }
            }
          ],
        },
        responsive: true
        // maintainAspectRatio: false
      }
    });
  }

  getSubCompetences() {
    var _getSubCompetencesUrl =
      "http://localhost:8080/api/competences/sub-competences";

    this._http.get<any>(_getSubCompetencesUrl).subscribe(response => {
      for (var i = 0; i < response.length; i++) {
        this.subCompetences.push(response[i][1]);
      }
    });
  }

  getUserData() {
    let token = this.token.getToken();
    let jwtData = token.split(".")[1];
    let decodedJwtJsonData = window.atob(jwtData);
    let decodedJwtData = JSON.parse(decodedJwtJsonData);
    let email = decodedJwtData.sub;
    var _getUserIdUrl = "http://localhost:8080/api/users/user/id/" + email;

    this._http.get<any>(_getUserIdUrl).subscribe(response => {
      var _getUserUrl = "http://localhost:8080/api/users/user/" + response;

      this._http.get<any>(_getUserUrl).subscribe(response => {
        this.User.first_name = response.first_name;
        this.User.last_name = response.last_name;
        this.getTestResultsDates(response.id);
      });
    });
  }

  getTestResultsDates(userId: number) {
    var _getResultDates =
      "http://localhost:8080/api/results/dates/user/" + userId;

    this._http.get<any>(_getResultDates).subscribe(response => {
      for (var i = 0; i < response.length; i++) {
        this.resultDates.push(response[i]);
      }
      // On page load, load the most recent results
      this.getResultsSelectedDateDropdownOne(this.resultDates[0]);
    });
  }

  getResultsSelectedDateDropdownOne(dateFinished: string) {
    while (this.score.length > 0) {
      this.score.pop();
    }
    this.selectedTestDateFirstDropdown = dateFinished;

    const TOTAL_MAIN_COMPETENCES = 3;
    let token = this.token.getToken();
    let jwtData = token.split(".")[1];
    let decodedJwtJsonData = window.atob(jwtData);
    let decodedJwtData = JSON.parse(decodedJwtJsonData);
    let email = decodedJwtData.sub;
    var _getUserIdUrl = "http://localhost:8080/api/users/user/id/" + email;

    this._http.get<any>(_getUserIdUrl).subscribe(response => {
      var _getUserResultsUrl = "http://localhost:8080/api/results/dates/date/" + dateFinished +
        "/user/" + response;

      this._http.get<any>(_getUserResultsUrl).subscribe(response => {
        for (var i = 0; i < response.length; i++) {
          if (i >= TOTAL_MAIN_COMPETENCES) {
            this.score.push(response[i][2]);
          }
        }
        this.myChart.update();
      });
    });
  }

  getResultsSelectedDateDropdownTwo(dateFinished: string) {
    while (this.scoreCompareResults.length > 0) {
      this.scoreCompareResults.pop();
    }
    this.selectedTestDateSecondDropdown = dateFinished;

    const TOTAL_MAIN_COMPETENCES = 3;
    let token = this.token.getToken();
    let jwtData = token.split(".")[1];
    let decodedJwtJsonData = window.atob(jwtData);
    let decodedJwtData = JSON.parse(decodedJwtJsonData);
    let email = decodedJwtData.sub;
    var _getUserIdUrl = "http://localhost:8080/api/users/user/id/" + email;

    this._http.get<any>(_getUserIdUrl).subscribe(response => {
      var _getUserResultsUrl = "http://localhost:8080/api/results/dates/date/" + dateFinished +
        "/user/" + response;

      this._http.get<any>(_getUserResultsUrl).subscribe(response => {
        for (var i = 0; i < response.length; i++) {
          if (i >= TOTAL_MAIN_COMPETENCES) {
            this.scoreCompareResults.push(response[i][2]);
          }
        }
        this.myChart.update();
      });
    });
  }

  exportCompetenceResults() {
    const elementToPrint = document.getElementById("testResults"); // The html element to become a PDF
    const pdf = new jsPDF();

    pdf.addHTML(elementToPrint, () => {
      pdf.save("Competence_TestResults.pdf"); // Name of the PDF file
    });
  }
}

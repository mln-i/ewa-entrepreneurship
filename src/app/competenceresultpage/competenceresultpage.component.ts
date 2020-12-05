import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Chart } from "chart.js";
import * as _ from "underscore";
import "chart.piecelabel.js";
import "chartjs-plugin-datalabels";

import { ToastrService } from "ngx-toastr";
import { TokenService } from "../services/token.service";
import { NavbarService } from "../services/navbar.service";

import { Competence } from "../models/competence";

@Component({
  selector: "app-competenceresultpage",
  templateUrl: "./competenceresultpage.component.html",
  styleUrls: ["./competenceresultpage.component.scss"]
})
export class CompetenceresultpageComponent implements OnInit {
  mainCompetences: Competence[] = new Array();
  subCompetences: Competence[] = new Array();
  mainCompetencesPoints: number[] = new Array();
  subCompetencesPoints: number[] = new Array();
  competenceNamesChart: string[] = new Array();
  mainCompetenceNamesChart: string[] = new Array();

  bestCompetences: String[] = new Array();
  bestCompetencesPoints: number[] = new Array();
  worstCompetences: String[] = new Array();
  worstCompetencesPoints: number[] = new Array();

  constructor(
    public navbar: NavbarService,
    private _http: HttpClient,
    private toastr: ToastrService,
    private token: TokenService
  ) {}

  ngOnInit() {
    this.navbar.show();

    this.getUserIdFromDatabase();
    this.loadAllCompetences();

    new Chart(document.getElementById("pie-chart"), {
      type: "pie",
      data: {
        datasets: [
          {
            labels: this.competenceNamesChart,
            backgroundColor: [
              "rgba(54, 162, 225, 0.9)",
              "rgba(54, 162, 225, 0.9)",
              "rgba(54, 162, 225, 0.9)",
              "rgba(54, 162, 225, 0.9)",
              "rgba(54, 162, 225, 0.9)",
              "rgba(153, 102, 225, 0.9)",
              "rgba(153, 102, 225, 0.9)",
              "rgba(153, 102, 225, 0.9)",
              "rgba(153, 102, 225, 0.9)",
              "rgba(153, 102, 225, 0.9)",
              "rgba(225, 159, 64, 0.9)",
              "rgba(225, 159, 64, 0.9)",
              "rgba(225, 159, 64, 0.9)",
              "rgba(225, 159, 64, 0.9)",
              "rgba(225, 159, 64, 0.9)"
            ],
            data: this.subCompetencesPoints
          }
        ],
        labels: this.competenceNamesChart
      },
      options: {
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              var dataset = data.datasets[tooltipItem.datasetIndex];
              var index = tooltipItem.index;
              return dataset.labels[index] + ": " + dataset.data[index];
            }
          }
        },
        pieceLabel: {
          render: function(args) {
            var string = args.label;
            var centeredString = string.replace(/\s/g, "\n");
            return centeredString;
          },
          fontSize: 8,
          textAlign: "center",
          fontColor: "white",
          position: "border"
        },
        plugins: {
          datalabels: {
            display: false
          }
        },
        title: {
          display: true,
          text: "Average scores for each sub competence. (1-5 scale)"
        },
        legend: {
          display: false,
          position: "top"
        }
      }
    });

    new Chart(document.getElementById("double-pie-chart"), {
      type: "doughnut",
      data: {
        labels: this.mainCompetenceNamesChart,
        datasets: [
          {
            data: [2, 2, 2]
          }
        ]
      },
      options: {
        pieceLabel: {
          render: "label",
          fontSize: 10,
          fontColor: "black",
          position: "outside",
          textMargin: 11
        },
        plugins: {
          datalabels: {
            display: false
          }
        },
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        cutoutPercentage: 95
      }
    });
  }

  loadAllCompetences() {
    var _getMainCompetencesUrl =
      "http://localhost:8080/api/competences/main-competences";
    var _getCompetencesUrl =
      "http://localhost:8080/api/competences/sub-competences";

    var promiseMainCompetence = this._http.get<any>(_getMainCompetencesUrl);
    var promiseSubCompetence = this._http.get<any>(_getCompetencesUrl);

    promiseMainCompetence
      .toPromise()
      .then(response => {
        // Get first three competences (main competences)
        for (let index = 0; index < response.length; index++) {
          let mainCompetenceObject = new Competence(
            response[index][0],
            response[index][1],
            response[index][2]
          );
          this.mainCompetences.push(mainCompetenceObject);
          this.mainCompetenceNamesChart.push(response[index][1]);
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });

    promiseSubCompetence
      .toPromise()
      .then(response => {
        // Only get the sub competences, skip first three competences (main competences)
        for (let index = 0; index < response.length; index++) {
          let subCompetenceObject = new Competence(
            response[index][0],
            response[index][1],
            response[index][2]
          );
          this.subCompetences.push(subCompetenceObject);
          this.competenceNamesChart.push(response[index][1]);
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  getResultsOfUser(userId: number) {
    var _getResultsOfTheUser =
      "http://localhost:8080/api/results/user/" + userId;
    var _getResultsScores =
      "http://localhost:8080/api/results/scores/user/" + userId;
    var promise = this._http.get<any>(_getResultsOfTheUser);
    var promiseScore = this._http.get<any>(_getResultsScores);

    const TOTAL_MAIN_COMPETENCES = 3;
    const TOTAL_BEST_WORST_SCORE = 3;

    promise
      .toPromise()
      .then(response => {
        // Get first three competences (main competences)
        for (let index = 0; index < response.length; index++) {
          if (index < TOTAL_MAIN_COMPETENCES) {
            this.mainCompetencesPoints.push(response[index][2]);
          } else {
            this.subCompetencesPoints.push(response[index][2]);
          }
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });

    promiseScore
      .toPromise()
      .then(response => {
        let lastIndexes = response.length - 1;
        let bestCompetenceName, worstCompetenceName;

        // Get top 3 best competences
        for (let index = 0; index < TOTAL_BEST_WORST_SCORE; index++) {
          this.subCompetences.forEach(element => {
            if (element.competence_id === response[index][1]) {
              bestCompetenceName = element.competence;
            }
            if (element.competence_id === response[lastIndexes][1]) {
              worstCompetenceName = element.competence;
            }
          });
          // Save best competence
          this.bestCompetences.push(bestCompetenceName);
          this.bestCompetencesPoints.push(response[index][2]);
          // Save worst competence
          this.worstCompetences.push(worstCompetenceName);
          this.worstCompetencesPoints.push(response[lastIndexes][2]);
          lastIndexes -= 1;
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  getUserIdFromDatabase() {
    let token = this.token.getToken();
    let jwtData = token.split(".")[1];
    let decodedJwtJsonData = window.atob(jwtData);
    let decodedJwtData = JSON.parse(decodedJwtJsonData);
    let isEmail = decodedJwtData.sub;

    var _getUserId = "http://localhost:8080/api/users/user/id/" + isEmail;
    var promise = this._http.get<any>(_getUserId);

    promise
      .toPromise()
      .then(response => {
        this.getResultsOfUser(response);
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }
}

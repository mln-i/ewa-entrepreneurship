import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import * as _ from "underscore";

import { ToastrService } from "ngx-toastr";
import { TokenService } from "../services/token.service";
import { NavbarService } from "../services/navbar.service";

import { Result } from "../models/result";
import { Question } from "../models/question";
import { Testanswer } from "../models/testanswer";
import { Competence } from "../models/competence";

@Component({
  selector: "app-competencetestpage",
  templateUrl: "./competencetestpage.component.html",
  styleUrls: ["./competencetestpage.component.scss"]
})
export class CompetencetestpageComponent implements OnInit {
  @ViewChild("infoBtn") infoBtn: ElementRef;

  // All Arrays
  questionList: Question[] = new Array();
  questionAnswerList: Testanswer[] = new Array();
  questionAnswerTempList: Testanswer[] = new Array();
  mainCompetences: Competence[] = new Array();
  subCompetences: Competence[] = new Array();
  mainCompetencesPoints: number[] = new Array();
  subIdLinkedToPoints: number[] = new Array();
  subCompetencesPoints: number[] = new Array();

  // All Models
  resultsModel = new Result(null, null, null, null);
  competenceModel = new Competence(null, null, null);
  questionAnswerModel = new Testanswer(null, null, null, null);

  questionDescription: String;
  questionCounter: number = 1;
  questionsTotal: number;
  questionShowId: number = 0;

  nextQuestionBtn: boolean = true;
  nextQuestionBtnText: String = "Next Question";
  submitBtn: boolean = false;
  submitBtnClicked: boolean = false;

  progressBarStatus: number = 0;
  subCompetenceGroupId: number = 4;  // Start id of the sub competence group

  scoreIdeasAndOpp: any = 0;
  scoreResources: any = 0;
  scoreIntoAction: any = 0;

  userId: number;

  constructor(
    public navbar: NavbarService,
    private _http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private token: TokenService
  ) {}

  ngOnInit() {
    this.navbar.hide();
    this.infoBtn.nativeElement.click();

    var _getQuestionsUrl =
      "http://localhost:8080/api/questions/shuffled-questions";
    var promise = this._http.get<any>(_getQuestionsUrl);
    const MAX_TEST_QUESTIONS = 59;

    promise
      .toPromise()
      .then(response => {
        for (let index = 0; index < response.length; index++) {
          // Restrict maximum of questions
          if (index >= MAX_TEST_QUESTIONS) {
            break;
          }

          let questionObject = new Question(
            response[index].question_id,
            response[index].description_text,
            response[index].competence_id
          );
          this.questionList.push(questionObject);
        }

        // Set question total number in view
        this.questionsTotal = this.questionList.length;
        // Show first question
        this.questionDescription =
          response[this.questionShowId].description_text;
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });

    this.loadAllTypeCompetences();
    this.getUserIdFromDatabase();
  }

  previousQuestion() {
    this.questionAnswerList.pop();

    if (this.questionShowId === this.questionList.length - 1) {
      this.nextQuestionBtnText = "Next Question";
    }

    // Set answer of previous question
    this.questionAnswerModel.score = this.questionAnswerTempList[
      this.questionShowId - 1
    ].score;

    // Decrease question id to give previous question
    this.questionShowId = this.questionShowId - 1;

    // Decrease question counter to display test progress
    this.questionCounter = this.questionCounter - 1;

    // Calculate progress bar value
    var progressBarCalculation = (
      (this.questionCounter / this.questionsTotal) *
      100
    ).toFixed(2);
    this.progressBarStatus = Number(progressBarCalculation);

    if (this.questionCounter === 0) {
      // Do nothing
    } else {
      // Display previous question
      this.questionDescription = this.questionList[
        this.questionShowId
      ].description_text;
    }

    // All data of the previous question is loaded now remove it
    this.questionAnswerTempList.pop();
  }

  nextQuestion() {
    // console.log(this.questionAnswerModel.score);

    if (this.questionAnswerModel.score === null) {
      this.toastr.error("", "Please select one answer!");
    } else {
      if (this.questionCounter === this.questionsTotal) {
        // Save last question
        let questionAnswerObject = new Testanswer(
          this.questionList[this.questionShowId].question_id,
          this.questionList[this.questionShowId].description_text,
          this.questionList[this.questionShowId].competence_id,
          this.questionAnswerModel.score
        );

        // Push last question
        this.questionAnswerList.push(questionAnswerObject);

        // Hide next question btn and show submit btn
        this.nextQuestionBtn = false;
        this.submitBtn = true;
      } else {
        // Create object to put score in for each question
        let questionAnswerObject = new Testanswer(
          this.questionList[this.questionShowId].question_id,
          this.questionList[this.questionShowId].description_text,
          this.questionList[this.questionShowId].competence_id,
          this.questionAnswerModel.score
        );
        // Push object with answer and related question to questionAnswerList
        this.questionAnswerList.push(questionAnswerObject);
        this.questionAnswerTempList.push(questionAnswerObject);

        // Reset score
        this.questionAnswerModel.score = null;

        // Increase question id to give next question
        this.questionShowId = this.questionShowId + 1;

        // Increase question counter to display test progress
        this.questionCounter = this.questionCounter + 1;

        // Calculate progress bar value
        var progressBarCalculation = (
          (this.questionCounter / this.questionsTotal) *
          100
        ).toFixed(2);
        this.progressBarStatus = Number(progressBarCalculation);

        // Change text of next question btn if last question
        if (this.questionCounter === this.questionsTotal) {
          this.nextQuestionBtnText = "Save Last Question";
        }

        // Display next question
        this.questionDescription = this.questionList[
          this.questionShowId
        ].description_text;
      }
    }
  }

  onSubmit() {
    var objectCount = 0, sum = 0;
    var finalCalculation;

    this.submitBtnClicked = true;

    // Group all question with the same competence id together
    let subCompetencesGroup = _.groupBy(this.questionAnswerList, function(
      object
    ) {
      return object.competence_id;
    });

    // Count total keys
    var countTotalGroups = _.keys(subCompetencesGroup).length;

    // Calculate for each sub competence the average score
    for (let index = 0; index < countTotalGroups; index++) {
      subCompetencesGroup[this.subCompetenceGroupId].forEach(element => {
        objectCount += 1;
        sum += element.score;
        finalCalculation = (sum / objectCount).toFixed(2);
        this.subIdLinkedToPoints[index] = this.subCompetenceGroupId; // Set competence id at same index as the score
        this.subCompetencesPoints[index] = Number(finalCalculation);
      });

      // Reset variables
      objectCount = 0;
      sum = 0;
      // Increase id to get the next group
      this.subCompetenceGroupId += 1;
    }

    this.calculateMainCompetences();
    this.sendResultsToDatabase();

    // Redirect to results overview page
    setTimeout(() => {
      this.router.navigate(["/competenceresults"]);
    }, 3000);
  }

  calculateMainCompetences(){
    // Ideas & opportunities
    let countSubCompSpotOpp = 0, countSubCompResources = 0, countSubCompIntoAction = 0;
    this.subCompetences.forEach(element => {
      if (["Spotting opportunities","Creativity","Vision", "Valuing ideas", "Ethical & sustainable thinking"].indexOf(element.competence) > -1){
        countSubCompSpotOpp += 1;
        let indexOfObject = element.competence_id;
        let findCorrectPointsIndex = this.subIdLinkedToPoints.indexOf(indexOfObject);
        this.scoreIdeasAndOpp += this.subCompetencesPoints[findCorrectPointsIndex];
        this.mainCompetencesPoints[0] = Number((this.scoreIdeasAndOpp / countSubCompSpotOpp).toFixed(2));
      } 
    });

    // Resources
    this.subCompetences.forEach(element => {
    if (["Self-awareness & self-efficacy", "Motivation & perseverance", "Mobilising resources", "Financial & economic literacy", "Mobilising others"].indexOf(element.competence) > -1){
      countSubCompResources += 1;
      let indexOfObject = element.competence_id;
      let findCorrectPointsIndex = this.subIdLinkedToPoints.indexOf(indexOfObject);
      this.scoreResources += this.subCompetencesPoints[findCorrectPointsIndex];
      this.mainCompetencesPoints[1] = Number((this.scoreResources / countSubCompResources).toFixed(2));
      }
    });

    // Into Action
    this.subCompetences.forEach(element => {
    if (["Taking the initiative", "Planning & management", "Coping with ambiguity, uncertainty & risk", "Working with others", "Learning through experience"].indexOf(element.competence) > -1){
      countSubCompIntoAction += 1;
      let indexOfObject = element.competence_id;
      let findCorrectPointsIndex = this.subIdLinkedToPoints.indexOf(indexOfObject);
      this.scoreIntoAction += this.subCompetencesPoints[findCorrectPointsIndex];
      this.mainCompetencesPoints[2] = Number((this.scoreIntoAction / countSubCompIntoAction).toFixed(2));
      }
    });
  }

  loadAllTypeCompetences() {
    var _getMainCompetencesUrl =
      "http://localhost:8080/api/competences/main-competences";
    var _getCompetencesUrl =
      "http://localhost:8080/api/competences/sub-competences";

    var promiseMainCompetence = this._http.get<any>(_getMainCompetencesUrl);
    var promiseSubCompetence = this._http.get<any>(_getCompetencesUrl);

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
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });

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
        }
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }

  sendResultsToDatabase() {
    var _submitResults = "http://localhost:8080/api/results";
    var promise = this._http.post<any>(_submitResults, this.resultsModel);

    // Get all competence ids from all main competences and put into array
    var allMainCompIds = _.pluck(this.mainCompetences, "competence_id");

    var date = new Date();
    var dateToday = date.toLocaleString("en-GB", { timeZone: "UTC" });
    var dateConvertComma = dateToday.replace(",", "");
    var dateConvertSlash = dateConvertComma.split("/").join("-");

    // Send all results main competences
    for (let index = 0; index < this.mainCompetencesPoints.length; index++) {
      this.resultsModel.user_id = this.userId;
      this.resultsModel.competence_id = allMainCompIds[index];
      this.resultsModel.score = this.mainCompetencesPoints[index];
      this.resultsModel.date_finished = dateConvertSlash;

      promise
        .toPromise()
        .then(response => {
          this.toastr.success("Redirecting, please wait...", "Success!");
        })
        .catch(error => {
          this.toastr.error(
            "Something went wrong...",
            "Results not submitted!"
          );
        });
    }

    // Send all results sub competences
    for (let index = 0; index < this.subCompetencesPoints.length; index++) {
      this.resultsModel.user_id = this.userId;
      this.resultsModel.competence_id = this.subIdLinkedToPoints[index];
      this.resultsModel.score = this.subCompetencesPoints[index];
      this.resultsModel.date_finished = dateConvertSlash;

      promise
        .toPromise()
        .then(response => {
          this.toastr.success("Redirecting, please wait...", "Success!");
        })
        .catch(error => {
          this.toastr.error(
            "Something went wrong...",
            "Results not submitted!"
          );
        });
    }
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
        this.userId = response;
      })
      .catch(error => {
        this.toastr.error("No response from the server.", "Response fail!");
      });
  }
}

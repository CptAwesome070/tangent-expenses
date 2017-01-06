import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { HomePage } from '../home/home';
import {Http, Headers} from '@angular/http';
import {ExpensesPage} from "../expenses/expenses";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [AuthService]
})
export class LoginPage {
  private loginservice;
  private nav;
  private usercreds;
  private error;
  private isLoggedin;
  private http;

  static get parameters() {
    return [[Http],[AuthService],[NavController]];
  }

  constructor(http, authservice, navcontroller) {
    this.loginservice = authservice;
    this.http = http;
    this.nav = navcontroller;
    this.usercreds = {
      name: '',
      password: ''
    }
    this.error = this.loginservice.checkAuth();
  }

  login(usercreds) {

    var headers = new Headers();
    var creds = "username=" + usercreds.name + "&password=" + usercreds.password;
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    return new Promise(resolve => {

      this.http.post('http://userservice.staging.tangentmicroservices.com:80/api-token-auth/', creds, {headers: headers}).subscribe(data => {
          console.log(data);
          if (data.status === 200) {
            window.localStorage.setItem('token', data.json().token);

            this.isLoggedin = true;
            this.nav.setRoot(HomePage);
          }
          if(data.status === 200){
            return "error";
          }
          resolve(this.isLoggedin);

        },
        err => {
          // Log errors if any
          console.log(err);
          this.error = "invalid login or password";
        }
      );
    });
  }
}

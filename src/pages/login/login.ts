import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { HomePage } from '../home/home';
import {ExpensesPage} from "../expenses/expenses";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [AuthService]
})
export class LoginPage {
  private myservice;
  private nav;
  private usercreds;
  private error;

  static get parameters() {
    return [[AuthService],[NavController]];
  }

  constructor(authservice, navcontroller) {
    this.myservice = authservice;
    this.nav = navcontroller;
    this.usercreds = {
      name: '',
      password: ''
    }
  }

  login(usercreds) {
    //console.log(usercreds);
    this.myservice.login(usercreds).then(data => {
      if(data){
        this.nav.setRoot(ExpensesPage);
      }
      else{
        this.error = "Incorrect username or password";
      }

    })
  }
}

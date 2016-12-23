import { Injectable } from '@angular/core';
import {Http, RequestOptions, Headers, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import "rxjs";
import { EmailComposer } from 'ionic-native';

@Injectable()
export class MailService {


  constructor(public http: Http) {

  }


  sendExpense(expense) {
    EmailComposer.isAvailable().then((available: boolean) =>{
      if(available) {
        //Now we know we can send
      }
    });
    var body = expense.descirption + "</br>";
    for(let item of expense.items.items){
      body += item.description +": R"+ item.total + "</br>";
    }
    body += expense.items.total;

    let email = {
      to: 'jono.greve@gmail.com',
      //cc: 'erika@mustermann.de',
      //bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        expense.image
      ],
      subject: 'JGreve Expense',
      body: body,
      isHtml: true
    };

    EmailComposer.open(email);

  }
}

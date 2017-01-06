import { Component} from '@angular/core';
import { NavController } from 'ionic-angular';
import {Camera} from 'ionic-native';
import {BillService} from "../../providers/bill-service";
import "rxjs/Rx";
import { AlertController, FabContainer } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import {AuthService} from "../../providers/auth-service";
import {LoginPage} from "../login/login";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [BillService, AuthService]

})
export class HomePage {

    public base64Image: string;
    public results: string;
    public result;
    public image: string;
    public contentType: string;
    public canvas: HTMLCanvasElement;
    public regions: any[];
    private lines = [];
    private lineItems = [];
    private people = [];
    private expenseDescription: String;
    private newText = [];
    private selPerson = null;
    private selLineItem = null;
    private loadingPopup;
    private action = null;
    private total = {descirption: "total", value: 0, colour: "#FF0000"};

    constructor(private billService: BillService, private authService: AuthService, private nav: NavController, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
        this.contentType = "image/png";
        this.canvas = <HTMLCanvasElement>document.getElementById('tempCanvas');
        this.loadingPopup = this.loadingCtrl.create({
          content: 'Decoding the Matrix...'
        });

      if(!authService.checkAuth()){
        this.nav.setRoot(LoginPage);
      }


    }

    fabPicture(fab: FabContainer) {
      fab.close();
      this.takePicture();
    }

    takePicture(){
        Camera.EncodingType.PNG;
        Camera.getPicture({
            destinationType: Camera.DestinationType.DATA_URL,
            targetWidth: 800,
            targetHeight: 600,
            quality: 60,
            correctOrientation: true,
            allowEdit: true,
        }).then((imageData) => {
          this.base64Image = imageData;
          //var image = "images/1.png";
          this.image = "data:image/jpeg;base64," +this.base64Image;
          let canvas = <HTMLCanvasElement> document.getElementById('tempCanvas');
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
          var image = new Image();
          var dataString = null;
          image.onload = () => {
            ctx.beginPath();
            //ctx.translate(canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            //ctx.rotate(180 * Math.PI / 180);
            //ctx.drawImage(image, 0, 0);
            var dataURL = canvas.toDataURL();
            dataString = dataURL.split(",").pop();
            var blob = this.b64toBlob(dataString, this.contentType, 512);
            this.loadingPopup.present();
            this.billService.postImage(blob).subscribe(
              data => this.result = data,
              err => console.log('ERROR!!!'),
              () => this.setCanvas(),
            );
          }
          image.src =this.image;
        });
    }

    performOCR(fab: FabContainer) {
      fab.close();
      this.base64Image = "";
        //var image = "images/1.png";
        this.image = "data:image/jpeg;base64," +this.base64Image;
        let canvas = <HTMLCanvasElement> document.getElementById('tempCanvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        var image = new Image();
        var dataString = null;
        image.onload = () => {
          ctx.beginPath();
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          var dataURL = canvas.toDataURL();
          dataString = dataURL.split(",").pop();
          var blob = this.b64toBlob(dataString, this.contentType, 512);
          this.loadingPopup.present();
          this.billService.postImage(blob).subscribe(
            data => this.result = data,
            err => console.log('ERROR!!!'),
            () => this.setCanvas(),
          );
        }
      image.src =this.image;
    }

    setCanvas(){
      this.loadingPopup.dismiss();
      this.promptDescription();
      var regions = this.result.regions;
      this.canvas = <HTMLCanvasElement> document.getElementById('tempCanvas');
      this.canvas.width  = window.innerWidth;
      this.canvas.height = window.innerHeight;
      let ctx: CanvasRenderingContext2D = this.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.beginPath();
      var image = new Image();
      var templines = this.lines;
      var canvas = this.canvas;
      image.onload = function() {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        for(let region of regions){
          for(let line of region.lines) {
            var tmpBounds = line.boundingBox;
            var boundries = tmpBounds.split(',');
            ctx.beginPath();
            ctx.strokeRect(boundries[0],boundries[1],boundries[2],boundries[3]);
          }
        }
      };
      image.src ="data:image/jpeg;base64," +this.base64Image;
    }

    //compileRegions(){

    //}

    b64toBlob(b64Data, contentType,  sliceSize=512) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    promptItem(fab: FabContainer) {
      fab.close();
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      this.selLineItem = {description:null, total:0, colour: color};
      this.lineItems.push( this.selLineItem);
      this.action = "description";
    }

  selectItem(lineItem, fab: FabContainer){
    fab.close();
    this.selLineItem = lineItem;
    this.action = "description";

  }
  selectTotal( fab: FabContainer){
    fab.close();
    this.selLineItem = null;
    this.action = "total";

  }

    tapEvent(e) {
      var centerX = e.center.x;
      var centerY = e.center.y;
      var foundText = false;
      if(this.result != null){
        let ctx: CanvasRenderingContext2D = this.canvas.getContext("2d");
        for(let region of this.result.regions) {
          for (let line of region.lines) {
            var lineBounds = line.boundingBox;
            var lineBoundries = lineBounds.split(',');
            // if click is within the boundries
            if(centerX>=parseInt(lineBoundries[0]) && centerX<= (parseInt(lineBoundries[0])+parseInt(lineBoundries[2])) && centerY>=parseInt(lineBoundries[1]) && centerY<= (parseInt(lineBoundries[1])+parseInt(lineBoundries[3]))){
              ctx.beginPath();
              if(this.action != null){
                if(this.selLineItem != null){
                  ctx.strokeStyle = this.selLineItem.colour;
                }else{
                  ctx.strokeStyle = this.total.colour;
                }
              }
              else {
                ctx.strokeStyle = "blue";
              }
              ctx.lineWidth = 3;
              ctx.strokeRect(lineBoundries[0],lineBoundries[1],lineBoundries[2],lineBoundries[3]);
              foundText = true;
              if(this.action != null && this.action === "description"){
                this.selLineItem.description = "";
                for (let word of line.words) {
                  this.selLineItem.description += word.text +" ";
                }
                this.action="value";
                break;
              }
              if(this.action != null && this.action === "value")
                for (let word of line.words) {
                  if (parseFloat(word.text) != null) {
                    //console.log(parseFloat(word.text));
                    if (this.selLineItem != null) {
                      if (!isNaN(parseFloat(word.text))) {
                        this.selLineItem.total = parseFloat(word.text);
                        this.selLineItem = null;
                        this.action = null;
                        break;
                      }
                    }
                  }
                }
              }
              if(this.action != null && this.action === "total")
                for (let word of line.words) {
                  if (parseFloat(word.text) != null) {
                    //console.log(parseFloat(word.text));
                    if (this.selLineItem != null) {
                      if (!isNaN(parseFloat(word.text))) {
                        this.total.value = parseFloat(word.text);
                        //this.selLineItem = null;
                        this.action = null;
                      }
                    }
                  }
                }

            }
          }
        }
      if(!foundText ==true ){
        console.log("notfound");
      }
      else{
        console.log("found text here");
        foundText = false;
      }
    }

    pressEvent(e){
      var centerX = e.center.x;
      var centerY = e.center.y;
      var foundText = false;
      if(this.result != null){
        let ctx: CanvasRenderingContext2D = this.canvas.getContext("2d");
        for(let region of this.result.regions) {
          for (let line of region.lines) {
            var lineBounds = line.boundingBox;
            var lineBoundries = lineBounds.split(',');
            if(centerX>=parseInt(lineBoundries[0]) && centerX<= (parseInt(lineBoundries[0])+parseInt(lineBoundries[2])) && centerY>=parseInt(lineBoundries[1]) && centerY<= (parseInt(lineBoundries[1])+parseInt(lineBoundries[3]))){
              ctx.beginPath();
              if(this.selPerson != null){
                ctx.strokeStyle = this.selPerson.colour;
              }
              else {
                ctx.strokeStyle = "blue";
              }
              ctx.lineWidth = 3;
              ctx.strokeRect(lineBoundries[0],lineBoundries[1],lineBoundries[2],lineBoundries[3]);
              foundText = true;
              for (let word of line.words) {
                if(!isNaN(word.text)){
                  console.log(parseFloat(word.text));
                }
              }
            }
          }
        }
      }
      if(!foundText ==true ){
        this.promptInput(e);
      }
      else{
        foundText = false;
      }
    }

  promptInput(e) {
    let prompt = this.alertCtrl.create({
      title: 'New Value',
      message: "The value",
      inputs: [
        {
          name: 'value',
          placeholder: '00.00',
          type: 'number'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            let ctx: CanvasRenderingContext2D = this.canvas.getContext("2d");
            ctx.font = "18pt Arial";
            var width = ctx.measureText(data.value).width;
            if(this.selLineItem != null && this.action === "value"){
              console.log("value");
              ctx.strokeStyle = this.selLineItem.colour;
              console.log(this.selLineItem.colour);
              this.selLineItem.total = parseFloat(data.value);
              this.action = null;
            }
            if(this.action === "total"){
              this.total.value = parseFloat(data.value);
              ctx.strokeStyle = this.total.colour;
              this.action = null;
            }
            if(this.action === "null") {
              ctx.strokeStyle = "#000";
            }
            ctx.lineWidth = 0.1;
            ctx.fillText(data.value, e.center.x, e.center.y);
            console.log("shoudl be drawing rectangle");
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeRect(e.center.x,e.center.y-23,width,25);
            this.newText.push({text:data.value, x: e.center.x, y: e.center.y, width: width, height:15});
          }
        }
      ]
    });
    prompt.present();
  }

  promptDescription() {
    let prompt = this.alertCtrl.create({
      title: 'Description',
      message: "A description for this expense",
      inputs: [
        {
          name: 'description',
          placeholder: 'Brief Description'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            this.expenseDescription = data.value;
          }
        }
      ]
    });
    prompt.present();
  }


  itemAlert(item) {
    var subtitle = "";
    var total = 0;

    let alert = this.alertCtrl.create({
      //title: item.description,
      subTitle: item.description+ " = "+item.total,
      buttons: ['OK', 'MODIFY']
    });
    alert.present();
  }

  totalAlert() {
    var subtitle = "";
    var total = 0;

    let alert = this.alertCtrl.create({
      title: 'Total',
      subTitle: this.total.value + "",
      buttons: ['OK', 'MODIFY']
    });
    alert.present();
  }

  sendExpense(fab: FabContainer){
    fab.close();
  }

}

import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {IHour} from "../models/IHour";
import {IWeek} from "../models/IWeek";
import moment from 'moment';

@Component({
  selector: 'app-calculate',
  templateUrl: './calculate.component.html',
  styleUrls: ['./calculate.component.css']
})
export class CalculateComponent implements OnInit {
  @ViewChildren('startHourInput') startHourInputs: ElementRef[];
  @ViewChildren('endHourInput') endHourInputs: ElementRef[];

  public dayWeek: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  public week = [{name: 'Semaine 1'}, {name: 'Semaine 2'}, {name: 'Semaine 3'}, {name: 'Semaine 4'}];
  public hourData: IHour[] = [];
  public regroupedByWeek: IWeek[] = [];
  public isOverHours: boolean = false;
  public classicStartHour: string = "09:00";
  public classicEndHour: string = "18:00";
  public overWorkedHours: string;

  ngOnInit(): void {

  }


  public saveStartHour(event: HTMLInputElement, day: string, nbWeek: string) {
    const eventValue: string = event.value;
    if (eventValue) {
      const index = this.hourData.findIndex(item => item.day === day && item.week === nbWeek);

      const test: IHour = {
        day: day,
        week: nbWeek,
        startHour: eventValue,
        endHour: ''
      }

      if (index !== -1) {
        this.hourData[index].startHour = eventValue;
      } else {
        this.hourData.push(test);
      }
    }
  }

  public saveEndHour(event: HTMLInputElement, day: string, nbWeek: string) {
    const eventValue: string = event.value;
    if (eventValue) {
      const index = this.hourData.findIndex(item => item.day === day && item.week === nbWeek);
      const test: IHour = {
        day: day,
        week: nbWeek,
        endHour: eventValue,
        startHour: ''
      }

      if (index !== -1) {
        this.hourData[index].endHour = eventValue;
      } else {
        this.hourData.push(test);
      }
    }
  }

  public calculate() {
    this.regroupedByWeek = this.groupByWeek(this.hourData).sort((a, b) => a.week.localeCompare(b.week));
    let workExtraHours: number = 0;
    const calc = (arr: IWeek[]) => {
      arr.forEach(el => {
        const dayWeek = el.dayWeek;
        dayWeek.forEach(el => {
          if (el.startHour && el.endHour) {
            workExtraHours += this.convertExtraHourToSeconds(el.endHour, el.startHour);
          }
        })
      })
      if (workExtraHours < 0) {
        this.overWorkedHours = "Aucune heure supplémentaire ce mois-ci"

      } else {
        this.overWorkedHours = "Il y a: " + this.convertToNormalDisplayTime(workExtraHours) + " supplémentaires ce mois-ci";
      }
    }
    calc(this.regroupedByWeek);
  }

  private groupByWeek(data: IHour[]): IWeek[] {
    return data.reduce((acc: IWeek[], curr: IHour) => {
      const week = curr.week;
      // Chercher si la semaine existe déjà dans le résultat
      const existingWeek = acc.find(item => item.week === week);
      if (existingWeek) {
        existingWeek.dayWeek.push(curr);
      } else {
        acc.push({week: week, dayWeek: [curr]});
      }
      return acc;
    }, []);
  }

  private convertExtraHourToSeconds(endHour: string, startHour: string): number {
    let extraHour: number = 0;

    const [startH, startMin] = startHour.split(':').map(Number)
    const [endH, endMin] = endHour.split(':').map(Number);
    const [classicStartH, classicStartMin] = this.classicStartHour.split(':').map(Number);
    const [classicEndH, classicEndMin] = this.classicEndHour.split(':').map(Number);
    const classicStartHInSec = classicStartH * 3600 + classicStartMin * 60;
    const classicEndHInSec = classicEndH * 3600 + classicEndMin * 60;
    const startHourInSec = startH * 3600 + startMin * 60;
    const endHourInSec = endH * 3600 + endMin * 60

    if (startHourInSec < classicStartHInSec) {
      extraHour += classicStartHInSec - startHourInSec;
    }

    if (endHourInSec > classicEndHInSec) {
      extraHour += endHourInSec - classicEndHInSec;
    }

    return extraHour;
  }

  public reset() {
    this.overWorkedHours = "";
    this.startHourInputs.forEach(input => input.nativeElement.value = "");
    this.endHourInputs.forEach(input => input.nativeElement.value = "");
    this.hourData = [];
    this.regroupedByWeek = [];
  }


  private convertToNormalDisplayTime(suppHours: number): string {
    return moment.utc(1000 * suppHours).format('H[h] mm[m]');
  }
}

import {Component, ElementRef, OnInit, signal, ViewChildren} from '@angular/core';
import {IHour} from "../models/IHour";
import {IWeek} from "../models/IWeek";
import moment from 'moment';
import 'moment/locale/fr';

@Component({
  selector: 'app-calculate',
  templateUrl: './calculate.component.html',
  styleUrls: ['./calculate.component.css']
})
export class CalculateComponent implements OnInit {
  @ViewChildren('startHourInput') startHourInputs: ElementRef[];
  @ViewChildren('endHourInput') endHourInputs: ElementRef[];

  public dayWeek  = signal<{ week: string; days: string[] }[]>([]);
  public hourData: IHour[] = [];
  public regroupedByWeek: IWeek[] = [];
  public classicStartHour: string = "09:00";
  public classicEndHour: string = "18:00";
  public overWorkedHours: string;

  ngOnInit(): void {
    const daysWeeks : { week: string; days: string[] }[] = []
    let dayWeekName: string[] = [];
    let count = 1;
    let currentWeekday = 1
    for(let i = 1; i <= moment().daysInMonth(); i ++) {

      let currentDate = moment().date(i);
      let dayName = currentDate.format('dddd');
      if (dayName !== 'samedi' && dayName !== 'dimanche') {
        const formatDate = `${dayName} ${i}`;
        dayWeekName.push(formatDate);
        if (currentWeekday === 5 || i === moment().daysInMonth()) {
          daysWeeks.push({ week: `Semaine ${count}`, days: dayWeekName });
          dayWeekName = [];
          count++;
          currentWeekday = 0;
        }
        currentWeekday++;
      }
    }
    this.dayWeek.set(daysWeeks);
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
      arr.forEach(day => {
        const dayWeek = day.dayWeek;
        dayWeek.forEach(day => {
          if (!day.startHour && !day.endHour) {
            day.startHour = this.classicStartHour
            day.endHour = this.classicEndHour
          }
          workExtraHours += this.convertExtraHourToSeconds(day.endHour, day.startHour);
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

  private computeOtherTask() {

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
    this.startHourInputs.forEach(input => input.nativeElement.value = this.classicStartHour);
    this.endHourInputs.forEach(input => input.nativeElement.value = this.classicEndHour);
    this.hourData = [];
    this.regroupedByWeek = [];
  }


  private convertToNormalDisplayTime(suppHours: number): string {
    return moment.utc(1000 * suppHours).format('H[h] mm[m]');
  }
}

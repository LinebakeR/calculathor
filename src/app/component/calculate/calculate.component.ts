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
    let suppH: number = 0;
    let classicDayWorkedInSec = 32400;
    const calc = (arr: IWeek[]) => {
      arr.forEach(el => {
        const dayWeek = el.dayWeek;
        dayWeek.forEach(el => {
          const workH = this.convertToSeconds(el.endHour, el.startHour);

          if (workH > classicDayWorkedInSec) {
            suppH += workH - classicDayWorkedInSec
          } else {
            this.overWorkedHours = "Aucune heure supplémentaire ce mois-ci"
          }
        })
      })
      this.overWorkedHours = "Il y a: " + this.convertToNormalDisplayTime(suppH) + " supplémentaires ce mois-ci";

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

  private convertToSeconds(endHour: string, startHour: string): number {
    const [startH, startMin] = startHour.split(':').map(Number)
    const [endH, endMin] = endHour.split(':').map(Number);
    const startHourInSec = startH * 3600 + startMin * 60;
    const endHourInSec = endH * 3600 + endMin * 60

    return endHourInSec - startHourInSec;
  }

  private convertToNormalDisplayTime(suppHours: number): string {
    return moment.utc(1000 * suppHours).format('H[h] mm[m]');
  }

  public reset() {
    this.overWorkedHours = "";
    this.startHourInputs.forEach(input => input.nativeElement.value = "");
    this.endHourInputs.forEach(input => input.nativeElement.value = "");
  }
}

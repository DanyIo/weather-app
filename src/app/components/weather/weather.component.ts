import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { CommonModule, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  providers: [DatePipe],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.css',
})
export class WeatherComponent implements OnInit {
  dailyWeather!: any;
  hourlyWeather!: any;
  weekWeather!: any;
  selectedDay!: any;
  selectedDayWeather!: any;

  errorOccurred: boolean = false;

  navbarItems = ['Today', '5-day forecast'];
  activeIndex!: number;
  currentDate: string = '';
  searchLocation: string = '';

  hours: string[] = [];
  forecasts: string[] = [];
  temps: string[] = [];
  realFeels: string[] = [];
  winds: string[] = [];
  icons: string[] = [];

  wHours: string[] = [];
  wForecasts: string[] = [];
  wTemps: string[] = [];
  wRealFeels: string[] = [];
  wWinds: string[] = [];
  wIcons: string[] = [];

  constructor(private _weatherService: WeatherService) {}

  ngOnInit() {
    this.setStoredActiveIndex();
    this.getWeather('London');
    this.currentDate = this.formatDate(new Date());
  }

  getWeather(cityName: string) {
    this.resetArrays(); // Reset arrays before fetching new data
    this.errorOccurred = false;

    this._weatherService.getDailyWeather(cityName).subscribe({
      next: (response) => {
        this.dailyWeather = response;
      },
      error: (error) => {
        this.dailyWeather = null;
        this.errorOccurred = true; // Set the error flag
      },
    });

    this._weatherService.getHourlyWeather(cityName).subscribe({
      next: (response) => {
        this.hourlyWeather = response;
        this.processWeatherData();
        this.processWeaklyWeatherData();
      },
      error: (error) => {
        this.hourlyWeather = null;
        this.errorOccurred = true;
      },
    });
  }

  searchWeather() {
    if (this.searchLocation.trim() !== '') {
      this.getWeather(this.searchLocation);
    }
    console.log(this.errorOccurred);
  }
  setActive(index: number) {
    this.activeIndex = index;
    this.storeActiveIndex(index);
  }
  storeActiveIndex(index: number): void {
    localStorage.setItem('activeIndex', index.toString());
  }
  setStoredActiveIndex() {
    const storedIndex = localStorage.getItem('activeIndex');
    if (storedIndex) {
      this.activeIndex = Number(storedIndex);
    } else {
      this.activeIndex = 0;
    }
  }

  formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString().slice(-2);
    return `${day}.${month}.${year}`;
  }
  processWeatherData(): void {
    this.hourlyWeather.list.slice(0, 6).forEach((entry: any) => {
      const date = new Date(entry.dt * 1000);
      const hours = date.getHours() + ':00';

      this.hours.push(hours);
      this.forecasts.push(entry.weather[0].main);
      this.icons.push(entry.weather[0].icon);
      this.temps.push((entry.main.temp - 273.15).toFixed(2) + '°C');
      this.realFeels.push((entry.main.temp - 273.15).toFixed(2) + '°C');
      this.winds.push(entry.wind.speed + ' m/s');
    });
  }
  processWeaklyWeatherData(): void {
    const entries = [];
    for (let item of this.hourlyWeather.list) {
      if (item.dt_txt.includes('12:00:00')) {
        entries.push(item);
        if (entries.length === 5) {
          break;
        }
      }
    }
    this.weekWeather = entries.map((entry: any) => {
      const date = new Date(entry.dt * 1000);
      const dayOfWeek = this.getDayOfWeek(date);
      const formattedDate = this.formatDate(date);
      return {
        dayOfWeek,
        date: formattedDate,
        forecast: entry.weather[0].main,
        icon: entry.weather[0].icon,
        temp: (entry.main.temp - 273.15).toFixed(2) + '°C',
        realFeel: (entry.main.feels_like - 273.15).toFixed(2) + '°C',
        wind: entry.wind.speed + ' m/s',
      };
    });
  }
  getDayOfWeek(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
  selectDay(day: any): void {
    this.selectedDay = day;
    this.showDayDetails(day);
  }
  showDayDetails(day: any): void {
    const dateParts = day.date.split('.');
    const formattedDate = `20${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    const selectedDate = new Date(formattedDate);

    this.selectedDayWeather = this.hourlyWeather.list
      .filter((entry: any) => {
        const entryDate = new Date(entry.dt * 1000);
        return (
          entryDate.getDate() === selectedDate.getDate() &&
          entryDate.getMonth() === selectedDate.getMonth() &&
          entryDate.getFullYear() === selectedDate.getFullYear() &&
          entryDate.getHours() >= 8
        );
      })
      .map((entry: any) => {
        const date = new Date(entry.dt * 1000);
        return {
          time: date.getHours() + ':00',
          forecast: entry.weather[0].main,
          icon: entry.weather[0].icon,
          temp: (entry.main.temp - 273.15).toFixed(2) + '°C',
          realFeel: (entry.main.feels_like - 273.15).toFixed(2) + '°C',
          wind: entry.wind.speed + ' m/s',
        };
      });

    this.updateTableData();
  }

  updateTableData(): void {
    this.wHours = this.selectedDayWeather.map((entry: any) => entry.time);
    this.wForecasts = this.selectedDayWeather.map(
      (entry: any) => entry.forecast
    );
    this.wIcons = this.selectedDayWeather.map((entry: any) => entry.icon);
    this.wTemps = this.selectedDayWeather.map((entry: any) => entry.temp);
    this.wRealFeels = this.selectedDayWeather.map(
      (entry: any) => entry.realFeel
    );
    this.wWinds = this.selectedDayWeather.map((entry: any) => entry.wind);
  }
  resetArrays() {
    this.selectedDayWeather = null;
    this.selectedDay = null;

    this.hours = [];
    this.forecasts = [];
    this.temps = [];
    this.realFeels = [];
    this.winds = [];
    this.icons = [];

    this.wHours = [];
    this.wForecasts = [];
    this.wTemps = [];
    this.wRealFeels = [];
    this.wWinds = [];
    this.wIcons = [];
  }
}

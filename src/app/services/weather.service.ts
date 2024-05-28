import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey: string = 'f4abb4222defebdab7cbb1acaacc322d';
  private apiUrl: string = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private _httpService: HttpClient) {}

  public getDailyWeather(location: string): Observable<any> {
    return this._httpService.get(
      `${this.apiUrl}?q=${location}&appid=${this.apiKey}&units=metric`
    );
  }
  public getHourlyWeather(location: string) {
    return this._httpService.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${this.apiKey}`
    );
  }
}

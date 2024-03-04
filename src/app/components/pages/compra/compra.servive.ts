import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TotalNetoService {
  totalNeto: number = 0;

  constructor() { }
}

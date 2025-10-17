// src/app/app.component.ts (Rename from app.ts)
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  // REMOVED: standalone: true (Resolves NG8001/router-outlet conflict)
  template: `<router-outlet></router-outlet>`, 
})
export class App {}
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from './components/ui-button/ui-button.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UiButtonComponent
  ],
  exports: [
    UiButtonComponent
  ]
})
export class SharedModule { }

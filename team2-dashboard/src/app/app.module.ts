import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule }      from './app-routing.module';
import { AppComponent }          from './app.component';
import { SharedModule }          from './shared/shared.module';
import { AppLayoutComponent }    from './layout/app-layout/app-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { NotFoundComponent }     from './pages/not-found/not-found.component';
import { ForbiddenComponent }    from './pages/forbidden/forbidden.component';
import { AuthInterceptor }       from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    AppLayoutComponent,
    PublicLayoutComponent,
    NotFoundComponent,
    ForbiddenComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  public goHome(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
    } else if (this.authService.hasRole(['ADMIN', 'HR'])) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/profile']);
    }
  }
}

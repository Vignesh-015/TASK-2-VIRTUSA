import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forbidden',
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.scss']
})
export class ForbiddenComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  public goToSafeZone(): void {
    if (this.authService.hasRole(['ADMIN', 'HR'])) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  public switchToAdmin(): void {
    this.authService.switchDemoRole('ADMIN');
    this.router.navigate(['/dashboard']);
  }
}

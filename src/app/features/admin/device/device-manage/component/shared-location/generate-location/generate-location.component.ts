import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/features/http-services/notification.service';
import { RefreshCustomerService } from 'src/app/features/shared/services/refresh-customer.service';
import { formatDate } from '@angular/common';
import { DeviceManageService } from '../../../service/device-manage.service';
import { AdminDashboardService } from 'src/app/features/admin/dashboard/dashboard-manage/services/admin-dashboard.service';

@Component({
  selector: 'app-generate-location',
  templateUrl: './generate-location.component.html',
  styleUrls: ['./generate-location.component.scss']
})
export class GenerateLocationComponent {
  locationForm!: FormGroup;
  spinnerLoading: boolean = false
  routePath: any = 'admin/device/shared-location'
  button: any = 'Submit';
  generateData: any;
  selectedVehicle: any;
  vehicleData: any;
  customerId: any;
  dealerId: any;
  expiryDateDisabled: boolean = true;

  selecteDate = [
    { text: '3 Months', value: 3 },
    { text: '6 Months', value: 6 },
    { text: '9 Months', value: 9 },
    { text: '12 Months', value: 12 },
    { text: 'Custom Date', value: 'custom' }
  ];

  constructor(private fb: FormBuilder,
    private refreshCustomerService: RefreshCustomerService,
    private router: Router,
    private notificationService: NotificationService,
    private deviceManageService: DeviceManageService,
    private dashboardService: AdminDashboardService,
    private activeRoute: ActivatedRoute
  ) {
    this.activeRoute.paramMap.subscribe(params => {
      this.dealerId = params.get('id');
      this.customerId = params.get('CustomerId');

      if (this.customerId) {
        this.getVehicleData(this.customerId)
      }
    })
  }

  ngOnInit() {
    this.setInitialValue()
    this.setExpiryDate()
  }

  setInitialValue() {
    const defaultMonths = 3;
    const today = new Date();
    const expiry = new Date(today.getFullYear(), today.getMonth() + defaultMonths, today.getDate());
    this.locationForm = this.fb.group({
      vehicle: [null, [Validators.required]],
      time_period: [3, [Validators.required]], // default '3'
      expiry_date: [{ value: expiry, disabled: true }, [Validators.required]],

    })
  }

  setExpiryDate() {
    this.locationForm.get('expiry_date')?.disable();
    this.locationForm.get('time_period')?.valueChanges.subscribe(value => {
      if (value === 'custom') {
        this.expiryDateDisabled = false;
        this.locationForm.get('expiry_date')?.reset();
        this.locationForm.get('expiry_date')?.enable();
      } else {
        this.expiryDateDisabled = true;
        const monthsToAdd = +value;
        const today = new Date();
        const expiry = new Date(today.setMonth(today.getMonth() + monthsToAdd));
        this.locationForm.get('expiry_date')?.setValue(expiry);
        this.locationForm.get('expiry_date')?.disable();
      }
    });
  }


  submit(formValue: any) {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }
    const rawValue = this.locationForm.getRawValue();
    let payload = {
      "customerId": Number(this.customerId),
      "dId": Number(formValue?.vehicle),
      "vt": formatDate(rawValue.expiry_date, 'yyyy-MM-dd', 'en-Us') + 'T23:59:59'
    }

    this.deviceManageService.generateSharedLocation(payload).subscribe((res: any) => {
      this.generateData = res?.body?.Result;
      if (res?.status == 200) {
        this.notificationService.showSuccess(res?.body?.actionResponse);
        this.router.navigateByUrl('admin/device/shared-location');
        this.refreshCustomerService.announceCustomerAdded();
      } else {
        this.notificationService.showError(res?.body?.actionResponse)
      }
    })
  }

  getVehicleData(id: any) {
    this.vehicleData = []
    this.dashboardService.customerVehicle(id).subscribe((res: any) => {
      let data = res?.body?.Result?.Data;
      this.vehicleData = data.map((item: any) => {
        return {
          value: item?.Device?.Id,
          text: item?.Device?.VehicleNo,
        };
      });
    });
  }

  cancel(event: any) {
    event.preventDefault()
    this.locationForm.reset()
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDashboardService } from 'src/app/features/admin/dashboard/dashboard-manage/services/admin-dashboard.service';
import { NotificationService } from 'src/app/features/http-services/notification.service';
import { RefreshpageService } from 'src/app/features/http-services/refreshpage.service';
import { SharedService } from 'src/app/features/http-services/shared.service';
import { StorageService } from 'src/app/features/http-services/storage.service';

@Component({
  selector: 'shared-location-filter',
  templateUrl: './shared-location-filter.component.html',
  styleUrls: ['./shared-location-filter.component.scss']
})
export class SharedLocationFilterComponent {
 @Output() filterValue = new EventEmitter();
  @Output() generateLocation = new EventEmitter()
  dealerData: any;
  selectedDealer: any;
  selectedDealerId: any;
  customerData: any;
  selectedCustomer:any
  selectDealerCustomer: any;
  vehicleData: any;
  selectedVehicle: any;

  constructor(
    private sharedService: SharedService,
    private dashboardService: AdminDashboardService,
    private router: Router,
    private refreshpage: RefreshpageService,
    private storageService: StorageService,
    private notificationService: NotificationService,

  ) {}
  ngOnInit() {
    this.getDealerlist()
    this.checkDealerCustomer()
  }

  checkDealerCustomer() {
    this.storageService.getItem('adminDealerCustomer').subscribe((res:any) => {
      this.selectDealerCustomer = res
    })
  }

  getDealerlist() {
    this.sharedService.getDealerData().subscribe((res: any) => {
      this.dealerData = res?.body?.Result?.Data;
      if (this.dealerData && this.dealerData.length > 0) {
        this.selectedDealer = this.selectDealerCustomer && this.selectDealerCustomer?.dealer ? this.selectDealerCustomer?.dealer: this.dealerData[0].Id;
        this.getCustomerData(this.selectedDealer);
      }
    })
  }
  onDealerSelect(dealerId: any) {
     this.vehicleData = []
  this.selectedCustomer = null
  this.selectDealerCustomer = null;
  this.selectedVehicle = null
    this.getCustomerData(dealerId);
    this.refreshpage.checkAndRedirect('/admin/device/shared-location');  

    // this.router.navigateByUrl('admin/customer/customer-manage')
  }

  getCustomerData(id: any) {
    this.selectedDealerId = id;
    // this.spinnerLoading = true;
    this.dashboardService.customer(id).subscribe((res: any) => {
      // this.spinnerLoading = false;
      this.customerData = res?.body?.Result?.Data;
      if (this.customerData && this.customerData.length > 0) {
        this.selectedCustomer = this.selectDealerCustomer && this.selectDealerCustomer?.customer ? this.selectDealerCustomer?.customer : this.customerData[0].Id;
        this.filterValue.emit({
          dealerId : this.selectedDealerId,
          customerId : this.selectedCustomer,
        })
         this.getVehicleData(this.selectedCustomer);
      }
    });
  }

   getVehicleData(id: any) {    
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

  onCustomerSelect(customerId:any) {
    this.vehicleData = []
    this.selectedCustomer = customerId; 
    this.selectedVehicle = null
    this.refreshpage.checkAndRedirect('/admin/device/shared-location'); 
    this.getVehicleData(customerId)     
    this.filterValue.emit({
      dealerId : this.selectedDealerId,
      customerId : this.selectedCustomer,
        vehicleId:this.selectedVehicle
    })
  }

   onVehicleSelect(vehicleId:any) {
    this.selectedVehicle = vehicleId;
    this.refreshpage.checkAndRedirect('/admin/device/shared-location');      
    this.filterValue.emit({
      dealerId : this.selectedDealerId,
      customerId : this.selectedCustomer,
        vehicleId:this.selectedVehicle
    })
  }

  redirectTo(path: any) {
      if (!this.selectedDealer || !this.selectedCustomer) {
    this.notificationService.showError('Please select dealer and customer');
    return;
  }

    this.generateLocation.emit(path)
  }
}

import { Component, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { SubUserService } from 'src/app/features/admin/sub-user/sub-user-manage/services/sub-user.service';
import { NotificationService } from 'src/app/features/http-services/notification.service';
import { RefreshpageService } from 'src/app/features/http-services/refreshpage.service';
import { DeleteConfirmationComponent } from 'src/app/features/shared/components/delete-confirmation/delete-confirmation.component';
import { RefreshCustomerService } from 'src/app/features/shared/services/refresh-customer.service';
import { DeviceManageService } from '../../../service/device-manage.service';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'shared-location-list',
  templateUrl: './shared-location-list.component.html',
  styleUrls: ['./shared-location-list.component.scss']
})
export class SharedLocationListComponent {
  selectedDealerId: any;
  selectedCustomerId: any;
  spinnerLoading: boolean = false
  locationData: any;
  columns: any;
  page = 1;
  count = 0;
  tableSize = 10;
  tableSizes = [25, 50, 100];
  urlPath = [
    { name: 'Delete Location', path: 'Delete' },
    // { name: 'Share via WhatsApp', path: 'whatsapp' },
    // { name: 'Share via Email', path: 'email' }
  ];
  bsModelRef!: BsModalRef;
  contextMenuPosition = { x: '0px', y: '0px' };

  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger | any;
  selectedLocation: any;
  selectColor: any;
  selectedVehicleId: any;
  copy: boolean = false;
  index: any;
  showCopyIcon: any
  constructor(
    private router: Router,
    private refreshCustomerService: RefreshCustomerService,
    private bsmodelService: BsModalService,
    private notificationService: NotificationService,
    private refreshpage: RefreshpageService,
    private deviceManageService: DeviceManageService,
    private clipboardService: ClipboardService,
  ) { }

  ngOnInit() {
    this.refreshpage.checkAndRedirect('/admin/device/shared-location');

    this.setInitialValue();
    this.refreshCustomerService.customerAdded$.subscribe(() => {
      this.getLocationList()
    });
  }

  setInitialValue() {
    this.columns = [
      { key: 'Vehicle No', title: 'Vehicle No' },
      { key: 'Url', title: 'Url' },
      { key: 'Issue Date', title: 'Issue Date' },
      { key: 'Expiry Date', title: 'Expiry Date' },
      { key: 'Status', title: 'Status' },
      { key: 'Action', title: 'Action' },
    ]
  }

  confirm(event: any) {
    this.selectedDealerId = event?.dealerId;
    this.selectedCustomerId = event?.customerId
    this.selectedVehicleId = event?.vehicleId
    if (this.selectedCustomerId) {
      console.log('this.selectedCustomerId', this.selectedCustomerId);

      this.getLocationList()

    }
  }

  copyContent(text: any, i: any) {
    this.clipboardService.copyFromContent(text)
    this.copy = true
    this.index = i
    this.notificationService.showSuccess('Copied')
  }

  getValidityStatusText(validityDate: string): string {
    const today = new Date();
    const validity = new Date(validityDate);

    // Remove time for accurate comparison
    today.setHours(0, 0, 0, 0);
    validity.setHours(0, 0, 0, 0);

    if (validity < today) {
      return 'Expired';
    }

    const diffInDays = Math.ceil((validity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 15) {
      return 'Expired Soon';
    }

    return 'Active';
  }

  getValidityStatusClass(validityDate: string): string {
    const today = new Date();
    const validity = new Date(validityDate);

    today.setHours(0, 0, 0, 0);
    validity.setHours(0, 0, 0, 0);

    if (validity < today) {
      return 'badge-expired';
    }

    const diffInDays = Math.ceil((validity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 15) {
      return 'badge-expired-soon';
    }

    return 'badge-active';
  }


  getLocationList() {
    this.spinnerLoading = true
    let payload = {
      "customerId": Number(this.selectedCustomerId),
      "dId": this.selectedVehicleId ? Number(this.selectedVehicleId) : 0
    }
    this.deviceManageService.sharedLocationList(payload).subscribe((res: any) => {
      console.log('res123432', res);

      this.spinnerLoading = false;
      if (res?.status == 200) {
        this.locationData = res?.body?.result || []
      } else {
        this.locationData = []
      }
    })
  }

  /**
  * table data change
  * @param event 
  */
  onTableDataChange(event: any) {
    this.page = event;
  };

  toggleDropdown(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const dropdownContent = target.nextElementSibling;
    const allDropdowns = document.querySelectorAll('.dropdown-content');

    allDropdowns.forEach(dropdown => {
      if (dropdown !== dropdownContent && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
    });

    if (dropdownContent) {
      dropdownContent.classList.toggle('show');
    }

    window.onclick = function (event: any) {
      if (!event.target.matches('.fa.fa-ellipsis-v')) {
        allDropdowns.forEach(dropdown => {
          if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
          }
        });
      }
    };
  }

 redirectTo(path: any) {
  this.selectColor = this.selectedLocation;

  if (path === 'Delete') {
    // const url = `/admin/device/shared-location`;
    // this.router.navigateByUrl(url);
    this.deletLocation(this.selectedLocation);
  } else if (path === 'whatsapp') {
    const shareUrl = this.selectedLocation?.share_url;
    const message = `Please check this location: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  } else if (path === 'email') {
    const shareUrl = encodeURIComponent(this.selectedLocation?.share_url);
    const mailtoUrl = `mailto:?subject=Shared Location&body=${shareUrl}`;
    window.open(mailtoUrl, '_blank');
  }

  this.refreshCustomerService.announceCustomerAdded();
}


  generatelocation(event: any) {
    this.selectedLocation = null;
    this.selectColor = null;
    let url: any;
    if (event == 'generate-location') {
      this.selectedLocation = null;
      this.selectColor = null;
      url = `/admin/device/shared-location/${this.selectedDealerId}/${this.selectedCustomerId}/${event}`
    }
    this.refreshCustomerService.announceCustomerAdded();
    this.router.navigateByUrl(url);
  }

  deletLocation(location: any) {
    this.selectColor = null;
    let payload = {
      "customerId": Number(this.selectedCustomerId),
      "id": Number(location?.id)
    }
    let url = this.deviceManageService.deleteSharedLocation(payload)
    const initialState: ModalOptions = {
      initialState: {
        title: `Vehicle No. :- ${location.vehicle_no}`,
        content: 'Are you sure you want to delete?',
        primaryActionLabel: 'Delete',
        secondaryActionLabel: 'Cancel',
        service: url
      },
    };
    this.bsModelRef = this.bsmodelService.show(
      DeleteConfirmationComponent,
      Object.assign(initialState, {
        id: "confirmation",
        class: "modal-md modal-dialog-centered",
      })
    );

    this.bsModelRef?.content.mapdata.subscribe(
      (value: any) => {
        console.log("value", value);

        if (value?.status == 200) {
          this.refreshCustomerService.announceCustomerAdded();
          this.notificationService.showSuccess(value?.body?.actionResponse)
          this.getLocationList()
        } else {
          this.notificationService.showError(value?.body?.actionResponse)
        }
      }
    );
  }

  onContextMenu(event: MouseEvent, item: any, i: any): void {
    this.selectedLocation = item;
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
}

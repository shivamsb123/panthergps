import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { faRunning } from '@fortawesome/free-solid-svg-icons';
import { CommonService } from 'src/app/features/shared/services/common.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CustomerDeviceDetailsComponent } from '../customer-device-details/customer-device-details.component';
import { StorageService } from 'src/app/features/http-services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss']
})
export class VehicleListComponent implements OnChanges {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger | any;

  @Input() vehicleData: any;
  @Input() vehicleDatacount: any
  @Input() isPageSize: any
  @Output() onConfirm = new EventEmitter();
  @Output() onAdress = new EventEmitter()
  @Output() showlabels = new EventEmitter()
  @Output() groupingByStatus = new EventEmitter();
  @Output() selectVehicleConfirm = new EventEmitter();
  searchLocation: boolean = false
  vehicleCount: any;
  loginUser: any;
  searchKeyword: any
  swiperList: any;
  vehicleListHeight: string = 'auto';
  @ViewChild('card') cardElement!: ElementRef;
  labelvalue: boolean = true;
  contextMenuPosition = { x: '0px', y: '0px' };
  urlPath = [
    {
      type: 'playback',
      name: 'Playback'
    },
    {
      type: 'reports',
      name: 'Reports'
    },
    {
      type: 'commands',
      name: 'Commands'
    },
    {
      type: 'details',
      name: 'Details'
    },
    // {
    //   type: 'geo',
    //   name: 'Geofance'
    // },
    {
      type: 'share',
      name: 'Share'
    },
    {
      type: 'direction',
      name: 'Direction'
    },
  ];
  selectedVehicleValue: any;
  bsModalRef!: BsModalRef
  userDetail: any;
  isBoxShadow: boolean = false;
  @ViewChild('vehicleFollowWrapper') vehicleFollowWrapper!: ElementRef;
  private scrollPositionKey = 'vehicleFollowScrollPosition';

  constructor(
    private CommonService: CommonService,
    private cdr: ChangeDetectorRef,
    private modalService: BsModalService,
    private storageService: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginUser = localStorage.getItem('userName');

    this.storageService.getItem("userDetail").subscribe((res: any) => {
      this.userDetail = res
    })


  }
  ngOnChanges() {
    this.swiperList = this.vehicleDatacount;
    this.updateVehicleListHeight();
    setTimeout(() => {
      this.restoreScrollPosition();
      // if (this.vehicleFollowWrapper) {
      //   this.vehicleFollowWrapper.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
      // }
    }, 100)

  }

  ngAfterViewInit() {
    if (this.vehicleFollowWrapper) {
      this.vehicleFollowWrapper.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy() {
    this.saveScrollPosition();
  }

  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    // Save the scroll position in sessionstorage
    sessionStorage.setItem(this.scrollPositionKey, scrollTop.toString());
  }

  saveScrollPosition() {
    if (this.vehicleFollowWrapper) {
      const scrollTop = this.vehicleFollowWrapper.nativeElement.scrollTop;
      sessionStorage.setItem(this.scrollPositionKey, scrollTop.toString());
    }
  }

  restoreScrollPosition() {
    const savedScrollPosition = sessionStorage.getItem(this.scrollPositionKey);
    if (savedScrollPosition !== null && this.vehicleFollowWrapper) {
      const parsedScrollPosition = parseInt(savedScrollPosition, 10);

      if (!isNaN(parsedScrollPosition)) {
        this.vehicleFollowWrapper.nativeElement.scrollTop = parsedScrollPosition;
      }
    }
  }


  // formatVehicleStatusDuration(vehicle: any) {
  //   if ((vehicle?.ResultCode == 2) || (vehicle?.ResultCode == 3)) {
  //     return `${vehicle.ResultMessage[0]}`
  //   } else {
  //     if (!vehicle || !vehicle?.StatusDuration || vehicle?.StatusDuration == null) return;
  //     const parts = vehicle.StatusDuration.split(' ');
  //     if (parts[0] === 'Never') {
  //       return `${vehicle.StatusDuration}`
  //     }
  //     if (!vehicle || !vehicle.StatusDuration || !vehicle?.Eventdata) {
  //       return '';
  //     }
  //     if (parts[0] === 'Running') {
  //       return `${parts[0]}(${vehicle?.Eventdata?.Speed} Km/h)`
  //     } else {
  //       const formattedTime = this.CommonService.formatTimeValue(parts[2]);
  //       return `${parts[0]}(${formattedTime})`;
  //     }
  //   }
  // }


    formatVehicleStatusDuration(vehicle: any) {
    if ((vehicle?.ResultCode == 2)) {
      return `${vehicle.ResultMessage[0]}`
    } else {
      if (!vehicle || !vehicle?.StatusDuration || vehicle?.StatusDuration == null) return;

      if (vehicle?.ResultCode == 3 && vehicle?.PointValidity?.CurrentPointType == 0) {
        return 'Licence point missing.';
      }else if(vehicle?.ResultCode == 3 && vehicle?.PointValidity?.CurrentPointType == 1){
        return 'Point expired, please recharge the point.';
      }  else if (vehicle?.ResultCode == 4 && vehicle?.PointValidity?.CurrentPointType == 0) {
        return 'Licence point missing.';
      }else if (vehicle?.ResultCode == 4 && vehicle?.PointValidity?.CurrentPointType == 1) {
        return 'Customer validity expired';
      } 
    
      const parts = vehicle.StatusDuration.split(' ');
      if (parts[0] === 'Never') {
        return `${vehicle.StatusDuration}`
      }
      if (!vehicle || !vehicle.StatusDuration || !vehicle?.Eventdata) {
        return '';
      }
      if (parts[0] === 'Running') {
        return `${parts[0]}(${vehicle?.Eventdata?.Speed} Km/h)`
      } else {
        const formattedTime = this.CommonService.formatTimeValue(parts[2]);
        return `${parts[0]}(${formattedTime})`;
      }
      
    }
  }

  
  // formatVehicleStatusDuration(vehicle: any): string | void {
  //   if (vehicle?.ResultCode === 2) {
  //     return `${vehicle.ResultMessage[0]}`;
  //   } 
    
  //   if (!vehicle || !vehicle.StatusDuration) return;
  
  //   const parts = vehicle.StatusDuration.split(' ');
  
  //   if (parts[0] === 'Never') {
  //     return `${vehicle.StatusDuration}`;
  //   }
  
  //   if (!vehicle.Eventdata) {
  //     return '';
  //   }

  //   if (vehicle?.ResultCode == 3 || vehicle?.PointValidity?.CurrentPointType == 0) {
  //     return 'Licence point missing.';
  //   } else if (vehicle?.ResultCode == 4 || vehicle?.PointValidity?.CurrentPointType == 0) {
  //     return 'Licence point missing.';
  //   }else if(vehicle?.ResultCode == 3){
  //     return 'Point expired, please recharge the point.';
  //   } else if (vehicle?.ResultCode == 4) {
  //     return 'Customer validity expired';
  //   } 
  
  //   if (parts[0] === 'Running') {
  //     return `${parts[0]} (${vehicle?.Eventdata?.Speed} Km/h)`;
  //   } else {
  //     const formattedTime = this.CommonService.formatTimeValue(parts[2]);
  //     return `${parts[0]} (${formattedTime})`;
  //   }
  // }
  
  
  


  getVehicleColor(vehicle: any): string {
    if (vehicle?.Status === 1 && vehicle?.SubStatus === 1) {
      return 'status-0';
    } else if (vehicle?.Status === 1 && vehicle?.SubStatus === 2) {
      return 'status-1-substatus-2';
    } else if (vehicle?.Status === 1 && vehicle?.SubStatus === 3) {
      return 'status-2-substatus-3';
    } else if (vehicle?.Status === 1 && vehicle?.SubStatus === 4) {
      return 'status-0-no-substatus';
    }else if (vehicle?.Status === 2) {
      return 'status-2-no-substatus';
    }else if (vehicle?.Status === 0) {
      return 'status-0-no-substatus';
    } else {
      return 'status';
    }
  }

  confirm(event: any) {
    this.vehicleData = [];
    this.vehicleData = event?.data;
    this.selectVehicleConfirm.emit(event?.data)
    this.updateVehicleListHeight();
  }

  onSelectVehicle(vehicle: any) {
    if (
      !vehicle || 
      !vehicle?.StatusDuration || 
      vehicle?.StatusDuration == null || 
      !vehicle?.Eventdata ||  (!vehicle?.Eventdata?.Latitude && !vehicle?.Eventdata?.Longitude) ||
      (vehicle?.ResultCode == 3 && vehicle?.PointValidity?.CurrentPointType == 0) || 
      (vehicle?.ResultCode == 3 && vehicle?.PointValidity?.CurrentPointType == 1) || 
      (vehicle?.ResultCode == 4 && vehicle?.PointValidity?.CurrentPointType == 0) || 
      (vehicle?.ResultCode == 4 && vehicle?.PointValidity?.CurrentPointType == 1)
    ) return;
    const parts = vehicle.StatusDuration.split(' ');
    if (parts[0] === 'Never') {
      return ;
    }
    this.onConfirm.emit(vehicle)
  }
  groupByStatus() {

  }
  showContent = true;

  toggleContent() {
    this.showContent = !this.showContent;
  }

  onSearchMyLocation(type: any) {
    this.searchLocation = true;
    this.onAdress.emit({ type: type })
  }


  // updateVehicleListHeight() {
  //   this.vehicleListHeight = 'auto';    
  //   const windowHeight = window.innerHeight;
  //   const maxEntriesForAutoHeight = 15; 

  //   if (!this.vehicleData || this.vehicleData?.length <= maxEntriesForAutoHeight) {            
  //     this.vehicleListHeight = 'auto';       
  //   } else if(this.vehicleData && this.vehicleData?.length >= maxEntriesForAutoHeight) {
  //     const maxHeightPercentage = 0.62;
  //     this.vehicleListHeight = `${windowHeight * maxHeightPercentage}px`;
  //   }
  // }

  updateVehicleListHeight() {
    this.vehicleListHeight = 'auto';
    let maxEntriesForAutoHeight = 15;

    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    let maxHeightPercentage;

    if (this.vehicleData) {
      const vehicleDataLength = this.vehicleData.length;

      if (vehicleDataLength > 11 && vehicleDataLength <= 15) {
        if (windowWidth >= 1600 && windowHeight >= 900 || windowWidth >= 1024 && windowHeight >= 768) {
          maxHeightPercentage = 0.60;
        } else if (windowWidth >= 1440 && windowHeight >= 900) {
          maxHeightPercentage = 0.60;
        } else if (windowWidth >= 1366 && windowHeight >= 768) {
          maxHeightPercentage = 0.60;
        } else if (windowWidth >= 1024 && windowHeight >= 768) {
          maxHeightPercentage = 0.58;
        } else if (windowWidth >= 800 && windowHeight >= 600) {
          maxHeightPercentage = 0.55;
        } else {
          this.vehicleListHeight = 'auto';
          return;
        }
        this.vehicleListHeight = `${windowHeight * maxHeightPercentage}px`;
      } else if (vehicleDataLength <= 11) {
        this.vehicleListHeight = 'auto';
      } else {
        if (windowWidth >= 1440 && windowHeight >= 900) {
          maxHeightPercentage = 0.60;
        } else if (windowWidth >= 1366 && windowHeight >= 768) {
          maxHeightPercentage = 0.60;
        } else if (windowWidth >= 1024 && windowHeight >= 768) {
          maxHeightPercentage = 0.58;
        } else if (windowWidth >= 800 && windowHeight >= 600) {
          maxHeightPercentage = 0.55;
        } else {
          this.vehicleListHeight = 'auto';
          return;
        }
        this.vehicleListHeight = `${windowHeight * maxHeightPercentage}px`;
      }
    } else {
      this.vehicleListHeight = 'auto';
    }
  }

  showlabel() {
    this.isBoxShadow = !this.isBoxShadow;
    this.labelvalue = !this.labelvalue
    this.showlabels.emit(this.labelvalue)
  }

  onContextMenu(event: MouseEvent, item: any, i: any): void {
    this.selectedVehicleValue = item;
    if (
      !item || 
      !item?.StatusDuration || 
      item?.StatusDuration == null || 
      !item?.Eventdata ||
      (item?.ResultCode == 3 && item?.PointValidity?.CurrentPointType == 0) || 
      (item?.ResultCode == 3 && item?.PointValidity?.CurrentPointType == 1) || 
      (item?.ResultCode == 4 && item?.PointValidity?.CurrentPointType == 0) || 
      (item?.ResultCode == 4 && item?.PointValidity?.CurrentPointType == 1)
    ) return;
    const parts = item.StatusDuration.split(' ');
    if (parts[0] === 'Never') {
      return;
    }
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  redirectTo(type: any) {
    if (type == 'playback') {
      let url = `/user/tracking/replay/${this.selectedVehicleValue?.Device?.Id}`;
      this.router.navigateByUrl(url);
    } else if (type == 'reports') {      
      this.router.navigate( ['/user/reports/vehicle-report/report'], {state: { value: this.selectedVehicleValue?.Device?.Id, text: this.selectedVehicleValue?.Device?.VehicleNo}})
    } else if (type == 'details') {
      this.opneDevice(this.selectedVehicleValue)
    }
  }

  opneDevice(selectvalue: any) {
    const initialState: ModalOptions = {
      initialState: {
        selectedDealer: this.userDetail?.dealerId,
        selectedCustomer: this.userDetail?.userId,
        device: selectvalue,
      },
    };
    this.bsModalRef = this.modalService.show(
      CustomerDeviceDetailsComponent,
      Object.assign(initialState, { class: "modal-lg modal-dialog-centered alert-popup" })
    );
  }

}

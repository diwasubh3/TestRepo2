var Application;
(function (Application) {
    var Controllers;
    (function (Controllers) {
        var TradeBookingController = (function () {
            function TradeBookingController(uiService, dataService, $rootScope, ngTableParams, $filter, $scope, uiGridConstants, exportUiGridService) {
                var _this = this;
                this.appBasePath = pageOptions.appBasePath;
                this.statusText = "Loading";
                this.includeCancelled = false;
                this.gridHeight = { 'height': '402px' };
                this.ConvertToCurrency = function (elem) {
                    if (elem != undefined && elem != null && elem.currentTarget != undefined) {
                        var val = elem.currentTarget.value;
                        if (val != null && val.length > 0) {
                            var returnVal = parseFloat(val.replace(/,/g, ""))
                                .toFixed(2)
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            elem.currentTarget.value = returnVal;
                        }
                        else {
                            elem.currentTarget.value = 0;
                        }
                    }
                    else
                        elem.currentTarget.value = 0;
                };
                this.rowHighilited = function (row) {
                    var vm = _this;
                    vm.isRowSelected = row;
                };
                this.tradeTypeChangeEvent = function (tradeType) {
                    var vm = _this;
                    vm.tempSecurity.settlemethods = undefined;
                    vm.isDisabledSettlement = false;
                    vm.isTradeReasonHide = true;
                    if (tradeType.tradeTypeId == 2) {
                        vm.tempSecurity.settlemethods = { methodName: 'Assignment', methodId: 1 };
                        vm.isDisabledSettlement = true;
                        vm.isTradeReasonHide = false;
                    }
                    vm.loadAllocationRule(tradeType);
                };
                this.clearAll = function (newBooking) {
                    var vm = _this;
                    vm.tempSecurity.tradeDate = new Date();
                    vm.tempSecurity.tradeType = { tradeTypeDesc: 'Buy', tradeTypeId: 1 };
                    vm.tempSecurity.issuerDesc = '';
                    vm.tempSecurity.issuerId = undefined;
                    vm.tempSecurity.loanXId = '';
                    vm.tempSecurity.issuer = undefined;
                    vm.tempSecurity.facility = undefined;
                    vm.tempSecurity.counterparty = undefined;
                    vm.tempSecurity.settlemethods = undefined;
                    vm.tempSecurity.totalQty = undefined;
                    vm.tempSecurity.price = undefined;
                    vm.tempSecurity.allocationRule = undefined;
                    vm.tempSecurity.tradeComments1 = undefined;
                    vm.tempSecurity.tradeComments2 = undefined;
                    vm.tempSecurity.tradeReasons = undefined;
                    vm.tempSecurity.selectedSecurity = '';
                    vm.gridOptions.data = [];
                    vm.TradeBookingIsOpen = true;
                    vm.ViewIsOpen = false;
                    vm.rootScope.$emit('onVisibilityChanged', open);
                    vm.isDisabled = false;
                    vm.isDisabledSettlement = false;
                    vm.isHide = true;
                    vm.isColumnHide = true;
                    vm.isTradeReasonHide = true;
                };
                this.getNewLoanXId = function () {
                    var vm = _this;
                    vm.tempSecurity.tradeDate = new Date();
                    vm.tempSecurity.tradeType = { tradeTypeDesc: 'Buy', tradeTypeId: 1 };
                    vm.tempSecurity.issuerDesc = '';
                    vm.tempSecurity.loanXId = '';
                    vm.tempSecurity.facility = undefined;
                    vm.tempSecurity.counterparty = undefined;
                    vm.tempSecurity.settlemethods = undefined;
                    vm.tempSecurity.totalQty = undefined;
                    vm.tempSecurity.price = undefined;
                    vm.loadAllocationRule(vm.tempSecurity.tradeType);
                    vm.tempSecurity.allocationRule = undefined;
                    vm.tempSecurity.tradeComments1 = undefined;
                    vm.tempSecurity.tradeComments2 = undefined;
                    vm.tempSecurity.tradeReasons = undefined;
                    vm.tempSecurity.selectedSecurity = '';
                    vm.gridOptions.data = [];
                    vm.TradeBookingIsOpen = true;
                    vm.ViewIsOpen = false;
                    vm.rootScope.$emit('onVisibilityChanged', open);
                    vm.isDisabled = false;
                    vm.isDisabledSettlement = false;
                    vm.isHide = true;
                    vm.isColumnHide = false;
                    vm.isTradeReasonHide = true;
                };
                this.setTradeBooking = function (tradeId) {
                    var vm = _this;
                    vm.dataService.refreshTradeBooking(tradeId).then(function (data) {
                        data.tradeDate = new Date(data.tradeDate);
                        vm.tradeTypeChangeEvent(data.tradeType);
                        console.log(data);
                        vm.tempSecurity = data;
                        vm.tradebookingdetail = data.tradeBookingDetail;
                        vm.gridOptions.data = data.tradeBookingDetail;
                        vm.tempSecurity.selectedSecurity = data.loanXId + ' ' + data.issuerDesc;
                        vm.setColumnVisibility(vm.tempSecurity);
                        vm.isDisabled = true;
                        vm.isHide = true;
                        vm.isLoading = false;
                    });
                };
                this.checkSaveButton = function () {
                    var vm = _this;
                    var TotalQty = vm.tempSecurity.totalQty;
                    var TotalAllocatedQty = 0, tempOverride = 0;
                    var isfinalNegative = false;
                    var isOverrideNegative = false;
                    vm.errorMessage = '';
                    for (var _i = 0; _i < vm.gridOptions.data.length; _i++) {
                        if (vm.tempSecurity.tradeType.tradeTypeDesc == "Buy") {
                            if (vm.tempSecurity.allocationRule.ruleName.indexOf("Manual") > -1)
                                tempOverride = parseFloat(vm.gridOptions.data[_i].override.toString());
                            else if (vm.gridOptions.data[_i].isIncluded == true)
                                tempOverride = parseFloat(vm.gridOptions.data[_i].netPosition.toString());
                            else
                                tempOverride = parseFloat(vm.gridOptions.data[_i].finalQty.toString());
                        }
                        else {
                            if (parseFloat(vm.gridOptions.data[_i].finalQty.toString()) >= 0)
                                tempOverride = parseFloat(vm.gridOptions.data[_i].netPosition.toString());
                            else
                                tempOverride = 0;
                        }
                        TotalAllocatedQty = TotalAllocatedQty + tempOverride;
                        if (parseFloat(vm.gridOptions.data[_i].finalQty.toString()) < 0)
                            isfinalNegative = true;
                        if (parseFloat(vm.gridOptions.data[_i].override.toString()) < 0)
                            isOverrideNegative = true;
                    }
                    if (vm.tempSecurity.allocationRule.ruleName.indexOf("Sell All") > -1) {
                        vm.tempSecurity.totalQty = parseFloat(TotalAllocatedQty.toFixed(2));
                        TotalQty = TotalAllocatedQty;
                    }
                    var message = "";
                    if (isfinalNegative)
                        message = 'User Can Not Sell More Than Existing Position';
                    if (isOverrideNegative)
                        message = message + ';   User Can Not Enter Negative Values';
                    vm.errorMessage = message;
                    console.log(Math.round(TotalAllocatedQty));
                    console.log(Math.round(TotalQty));
                    if (Math.round(TotalAllocatedQty).toFixed(2) != Math.round(TotalQty).toFixed(2) || isOverrideNegative == true)
                        vm.isSaveDisabled = true;
                    else {
                        vm.isSaveDisabled = false;
                    }
                };
                this.onRowCheckChanged = function (row) {
                    var vm = this;
                    vm.tradebookingdetail = vm.gridOptions.data;
                    for (var _i = 0; _i < vm.tradebookingdetail.length; _i++) {
                        vm.tradebookingdetail[_i].totalQuantity = vm.tempSecurity.totalQty;
                        vm.tradebookingdetail[_i].ruleName = vm.tempSecurity.allocationRule.ruleName;
                        vm.tradebookingdetail[_i].price = vm.tempSecurity.price;
                    }
                    vm.dataService.getCalculatedData(vm.tradebookingdetail).then(function (data) {
                        vm.gridOptions.data = data;
                        vm.checkSaveButton();
                        vm.isLoading = false;
                    });
                };
                this.OnCellLeave = function (row) {
                    var vm = this;
                    alert('Called');
                    //vm.dataService.getCalculatedData(vm.gridOptions.data).then(data => {
                    //    vm.gridOptions.data = data;
                    //    vm.gridOptions.footerTemplate = '<div class="ui-grid-bottom-panel" style="text-align: center">I am a Custom Grid Footer</div>';
                    //    vm.isLoading = false;
                    //});
                };
                this.GetFundAllocation = function (allocation) {
                    var vm = _this;
                    console.log(vm.tempSecurity.issuerDesc);
                    vm.isLoading = true;
                    var bodyMesg = "";
                    if (vm.tempSecurity.traders == undefined) {
                        bodyMesg = 'Please Select Trader From List';
                    }
                    if (vm.tempSecurity.tradeType == undefined) {
                        bodyMesg = bodyMesg + "<br>" + 'Please Select Trade Type From List';
                    }
                    if (vm.isColumnHide == true) {
                        if (vm.tempSecurity.issuerId == undefined) {
                            bodyMesg = bodyMesg + "<br>" + 'Please Select Issuer/Security From List';
                        }
                    }
                    else {
                        //if (vm.tempSecurity.issuer == undefined) {
                        //    bodyMesg = bodyMesg + "<br>" + 'Please Select Issuer From List';
                        //}
                        //else {
                        //    vm.tempSecurity.issuerId = vm.tempSecurity.issuer.issuerId;
                        //    vm.tempSecurity.issuerDesc = vm.tempSecurity.issuer.issuerDesc;
                        //}
                    }
                    if (vm.tempSecurity.facility == undefined) {
                        bodyMesg = bodyMesg + "<br>" + 'Please Select Asset From List';
                    }
                    if (vm.tempSecurity.counterparty == undefined) {
                        bodyMesg = bodyMesg + "<br>" + 'Please Select Counter Party From List';
                    }
                    if (vm.tempSecurity.allocationRule == undefined) {
                        bodyMesg = bodyMesg + "<br>" + 'Please Select Allocation Method From List';
                    }
                    else {
                        if (allocation.allocationRule.ruleName.indexOf("Sell All") > -1) {
                            vm.tempSecurity.totalQty = 1;
                        }
                        else {
                            if (vm.tempSecurity.totalQty == undefined) {
                                bodyMesg = bodyMesg + "<br>" + 'Please Enter Total Quantity';
                            }
                        }
                    }
                    if (allocation.allocationRule.ruleName.indexOf("TargetPar") > -1) {
                        vm.gridApi.grid.columns[2].displayName = "Target Par";
                        vm.gridApi.grid.columns[3].displayName = "Existing Position";
                    }
                    else {
                        vm.gridApi.grid.columns[2].displayName = "Existing Position";
                        vm.gridApi.grid.columns[3].displayName = "Current Exposure";
                    }
                    if (bodyMesg != '') {
                        var message = {
                            header: "Warning",
                            body: "<p><b>" + bodyMesg + "</b></p>"
                        };
                        vm.uiService.showMessage(message);
                        return;
                    }
                    vm.dataService.getTradeFundAllocation(allocation).then(function (allocationdata) {
                        vm.tradebookingdetail = allocationdata;
                        vm.gridOptions.data = vm.tradebookingdetail;
                        vm.setColumnVisibility(allocation);
                        vm.isHide = false;
                        vm.isSaveDisabled = true;
                        vm.isLoading = false;
                        vm.checkSaveButton();
                    });
                };
                this.setColumnVisibility = function (tradebook) {
                    var vm = _this;
                    vm.gridApi.grid.columns[3].showColumn();
                    vm.gridApi.grid.columns[4].showColumn();
                    vm.gridApi.grid.columns[5].showColumn();
                    vm.gridApi.grid.columns[6].showColumn();
                    if (tradebook.allocationRule.ruleName.indexOf("Manual") > -1) {
                        vm.gridApi.grid.columns[3].hideColumn();
                        vm.gridApi.grid.columns[4].hideColumn();
                        vm.gridApi.grid.columns[6].hideColumn();
                    }
                    if (tradebook.allocationRule.ruleName.indexOf("Sell All") > -1) {
                        vm.gridApi.grid.columns[4].hideColumn();
                        vm.gridApi.grid.columns[5].hideColumn();
                    }
                    if (tradebook.allocationRule.ruleName.indexOf("Position") > -1) {
                        vm.gridApi.grid.columns[3].hideColumn();
                    }
                };
                this.refreshGrid = function () {
                    var vm = _this;
                    vm.gridApi.grid.refresh();
                };
                this.setFacility = function (sec) {
                    var vm = _this;
                    vm.tempSecurity.facility = { facilityDesc: sec.facilityDesc, facilityId: sec.facilityId };
                    vm.tempSecurity.loanXId = sec.securityCode;
                    vm.tempSecurity.issuerId = sec.issuerId;
                    vm.tempSecurity.issuerDesc = sec.issuer;
                };
                this.setAsset = function (sec) {
                    var vm = _this;
                    vm.tempSecurity.facility = { facilityDesc: sec.facilityDesc, facilityId: sec.facilityId };
                    vm.tempSecurity.issuerId = sec.issuerId;
                    vm.tempSecurity.issuerDesc = sec.issuer;
                };
                this.loadAllocationRule = function (tradeType) {
                    var vm = _this;
                    vm.dataService.getAllocationRule(tradeType.tradeTypeId).then(function (rules) {
                        vm.allocationRuleData = rules;
                    });
                };
                this.setIssuerDesc = function (sec) {
                    var vm = _this;
                    if (sec.issuerId == undefined) {
                        vm.tempSecurity.issuerId = 0;
                        vm.tempSecurity.issuerDesc = sec;
                    }
                    else {
                        vm.tempSecurity.issuerDesc = sec.issuer;
                    }
                    console.log(vm.tempSecurity.issuerDesc);
                };
                this.loadDropdownData = function () {
                    var vm = _this;
                    vm.statusText = "Loading";
                    vm.isLoading = true;
                    vm.dataService.getTradeBookingData().then(function (tradedata) {
                        vm.sourceData = tradedata;
                        vm.isLoading = false;
                        vm.dataService.getIssuerSecurities().then(function (securities) {
                            vm.securities = securities;
                        });
                        vm.dataService.getTradeBooking().then(function (trades) {
                            vm.trades = trades;
                        });
                        vm.dataService.getIssuerList().then(function (issuers) {
                            vm.issuers = issuers;
                        });
                    });
                };
                this.GenerateTradeXML = function () {
                    var vm = _this;
                    var bodyMesg = "";
                    if (vm.tempSecurity.traders == undefined) {
                        bodyMesg = 'Please Select Trader From List';
                    }
                    if (vm.tempSecurity.tradeType == undefined) {
                        bodyMesg = bodyMesg + "<br>" + 'Please Select Trade Type From List';
                    }
                    if (vm.isColumnHide == true) {
                        if (vm.tempSecurity.issuerId == undefined) {
                            bodyMesg = bodyMesg + "<br>" + 'Please Select Issuer/Security From List';
                        }
                    }
                    else {
                        //if (vm.tempSecurity.issuerId == undefined)
                        //    vm.tempSecurity.issuerDesc = vm.tempSecurity.issuer;
                        //if (vm.tempSecurity.issuer == undefined) {
                        //    bodyMesg = bodyMesg + "<br>" + 'Please Select Issuer From List';
                        //}
                        //else {
                        //    vm.tempSecurity.issuerId = vm.tempSecurity.issuer.issuerId;
                        //    vm.tempSecurity.issuerDesc = vm.tempSecurity.issuer.issuerDesc;
                        //}
                    }
                    if (vm.tempSecurity.facility == undefined) {
                        bodyMesg = bodyMesg + "<br>" + 'Please Select Asset From List';
                    }
                    if (vm.tempSecurity.counterparty == undefined) {
                        bodyMesg = bodyMesg + "<br>" + 'Please Select Counter Party From List';
                    }
                    if (vm.tempSecurity.totalQty == undefined) {
                        bodyMesg = bodyMesg + "<br>" + 'Please Enter Total Quantity';
                    }
                    if (vm.tempSecurity.allocationRule == undefined) {
                        bodyMesg = bodyMesg + "<br>" + 'Please Select Allocation Method From List';
                    }
                    else {
                        if (vm.tempSecurity.allocationRule.ruleName.indexOf("Sell All") > -1) {
                            vm.tempSecurity.totalQty = 0;
                        }
                        else {
                            if (vm.tempSecurity.totalQty == undefined) {
                                bodyMesg = bodyMesg + "<br>" + 'Please Enter Total Quantity';
                            }
                        }
                    }
                    if (bodyMesg != '') {
                        var message = {
                            header: "Warning",
                            body: "<p><b>" + bodyMesg + "</b></p>"
                        };
                        vm.uiService.showMessage(message);
                        return;
                    }
                    var TotalQty = vm.tempSecurity.totalQty;
                    var TotalAllocatedQty = 0, tempOverride = 0;
                    for (var _i = 0; _i < vm.gridOptions.data.length; _i++) {
                        if (vm.tempSecurity.allocationRule.ruleName.indexOf("Manual") > -1)
                            tempOverride = parseFloat(vm.gridOptions.data[_i].override.toString());
                        else if (vm.gridOptions.data[_i].isIncluded == true)
                            tempOverride = parseFloat(vm.gridOptions.data[_i].netPosition.toString());
                        else
                            tempOverride = parseFloat(vm.gridOptions.data[_i].finalQty.toString());
                        TotalAllocatedQty = TotalAllocatedQty + tempOverride;
                    }
                    if (vm.tempSecurity.allocationRule.ruleName.indexOf("Sell All") > -1) {
                        vm.tempSecurity.totalQty = TotalAllocatedQty;
                        TotalQty = TotalAllocatedQty;
                    }
                    if (Math.round(TotalAllocatedQty).toFixed(2) != Math.round(TotalQty).toFixed(2)) {
                        bodyMesg = 'Total Quantity (' + Number(TotalQty).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ') and Final Quantity  (' + Math.round(TotalAllocatedQty).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ') Should Match. ';
                        var message = {
                            header: "Warning",
                            body: "<p><b>" + bodyMesg + "</b></p>"
                        };
                        vm.uiService.showMessage(message);
                        return;
                    }
                    vm.tempSecurity.tradeBookingDetail = vm.gridOptions.data;
                    vm.statusText = "Saving";
                    vm.isLoading = true;
                    vm.dataService.generateTradeXML(vm.tempSecurity).then(function (data) {
                        vm.clearAll(true);
                        vm.dataService.getTradeBooking().then(function (trades) {
                            vm.trades = trades;
                        });
                        bodyMesg = 'Data Saved Successfully.';
                        var message = {
                            header: "Successfull Message",
                            body: "<p><b>" + bodyMesg + "</b></p>"
                        };
                        vm.uiService.showMessage(message);
                        vm.isLoading = false;
                    });
                };
                this.ShowResponse = function (trade, row) {
                    var vm = _this;
                    //vm.isRowSelected = 'rowselected';            
                    var date = new Date(trade.tradeDate);
                    var bodyMesg = "";
                    if (trade.responseStatus == null)
                        bodyMesg = "<font color='red'> No response received yet.</font>";
                    else
                        bodyMesg = trade.errorMessage;
                    var message = {
                        header: "Response for " + trade.issuerDesc + "  (" + trade.tradeTypeDesc + ") " + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                        body: "<p><b>" + bodyMesg + "</b></p>"
                    };
                    vm.uiService.showMessage(message);
                };
                this.ExportToCSV = function () {
                    var vm = _this;
                    var myElement = angular.element($(".custom-csv-link-location")[0]);
                    vm.gridApi.exporter.csvExport('visible', 'visible', myElement);
                };
                var vm = this;
                vm.dataService = dataService;
                vm.uiService = uiService;
                vm.rootScope = $rootScope;
                vm.rootScope.$emit('onActivated', 'tradebooking');
                vm.ngTableParams = ngTableParams;
                vm.filter = $filter;
                vm.ViewIsOpen = true;
                vm.TradeBookingIsOpen = false;
                vm.isLoading = true;
                vm.isDisabled = false;
                vm.isDisabledSettlement = false;
                vm.isHide = true;
                vm.isColumnHide = true;
                vm.isTradeReasonHide = true;
                vm.isSaveDisabled = true;
                vm.loadDropdownData();
                vm.tempSecurity = {};
                vm.issuerSec = {};
                vm.tradebookingdetail = Array();
                vm.allocationRuleData = Array();
                vm.scope = $scope;
                vm.exportUiGridService = exportUiGridService;
                vm.tempSecurity.tradeDate = new Date();
                vm.tempSecurity.tradeType = { tradeTypeDesc: 'Buy', tradeTypeId: 1 };
                vm.tempSecurity.traders = { traderName: 'Eugene Koltunov', traderId: 1231 };
                vm.tempSecurity.interesttreatments = { description: 'Settles Without Accrued', id: 1 };
                vm.errorMessage = "";
                vm.loadAllocationRule(vm.tempSecurity.tradeType);
                var tempFooter = '<div class="ui-grid-cell-contents;" style="text-align:right;padding-top:5px;">{{col.getAggregationValue() | number:2 }}</div>';
                vm.cDefs = [
                    {
                        name: 'isIncluded',
                        field: "isIncluded",
                        displayName: "Include",
                        //type:"boolean",
                        enableCellEdit: false,
                        cellEditableCondition: false,
                        cellTemplate: '<div class="ui-grid-cell-contents" ><input type="checkbox" ng-model="row.entity.isIncluded" ng-change="grid.appScope.onRowCheckChanged(row)"/></div>',
                        width: "5%",
                    },
                    {
                        name: 'portfolioName',
                        field: "portfolioName",
                        displayName: "Portfolio",
                        width: "15%",
                        visible: true,
                        enableCellEdit: false,
                        enableSorting: false,
                        type: "string",
                        footerCellTemplate: '<div class="ui-grid-cell-contents" style="padding-top:5px;">Total</div>'
                    },
                    {
                        name: 'existing',
                        field: "existing",
                        displayName: "Existing Position",
                        width: "10%",
                        visible: true,
                        enableCellEdit: false,
                        enableSorting: false,
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        type: "number",
                        cellFilter: 'number: 2',
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: tempFooter,
                    },
                    {
                        name: 'exposure',
                        field: "exposure",
                        displayName: "Current Exposure",
                        width: "10%",
                        visible: true,
                        enableCellEdit: false,
                        enableSorting: false,
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        type: "number",
                        cellFilter: 'number: 2',
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: tempFooter
                    },
                    {
                        name: 'allocated',
                        field: "allocated",
                        displayName: 'Auto Allocated',
                        cellClass: 'text-right',
                        width: "10%",
                        visible: true,
                        enableCellEdit: false,
                        enableSorting: false,
                        type: "number",
                        cellFilter: 'number: 2',
                        headerCellClass: 'text-right',
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: tempFooter
                    },
                    {
                        name: 'override',
                        field: "override",
                        displayName: 'Manual Override',
                        width: "10%",
                        visible: true,
                        enableCellEdit: true,
                        enableSorting: false,
                        type: "number",
                        headerCellClass: 'text-right',
                        enableCellEditOnFocus: true,
                        //cellTemplate: '<div class="ui-grid-cell-contents" ><input type="text" ng-model="row.entity.override" style="height: 20px !important;text-align:right" ng-change="grid.appScope.onChangeDemo(row)"/></div>',
                        /*cellTemplate: '<div><input type="INPUT_TYPE" style="height: 20px !important;text-align:right" ng-class="\'colt\' + col.uid"\ ui-grid-editor ng-model="row.entity.override" ng-blur="alert();"></div>',*/
                        cellEditableCondition: true,
                        cellFilter: 'number: 2',
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: tempFooter,
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if (parseFloat(row.entity.finalQty) < 0) {
                                return 'red';
                            }
                            return 'text-right';
                        },
                    },
                    {
                        name: 'netPosition',
                        field: "netPosition",
                        displayName: 'Net Allocation',
                        width: "10%",
                        visible: true,
                        enableCellEdit: false,
                        enableSorting: false,
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        type: "string",
                        cellFilter: 'number: 2',
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: tempFooter
                    },
                    {
                        name: 'finalQty',
                        field: "finalQty",
                        displayName: 'Final Position',
                        width: "10%",
                        visible: true,
                        enableCellEdit: false,
                        enableSorting: false,
                        headerCellClass: 'text-right',
                        type: "string",
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: tempFooter,
                        cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                            if (parseFloat(row.entity.finalQty) < 0) {
                                return 'red';
                            }
                            return 'text-right';
                        },
                        cellFilter: 'number: 2',
                        cellTooltip: 'Final quantity can not be less than zero'
                    },
                    {
                        name: 'tradeAmount',
                        field: "tradeAmount",
                        displayName: 'Net Amount',
                        width: "10%",
                        visible: true,
                        enableCellEdit: false,
                        enableSorting: false,
                        cellClass: 'text-right',
                        headerCellClass: 'text-right',
                        type: "string",
                        cellFilter: 'number: 2',
                        aggregationType: uiGridConstants.aggregationTypes.sum, aggregationHideLabel: true,
                        footerCellTemplate: tempFooter
                    }
                ];
                vm.gridOptions = {
                    columnDefs: vm.cDefs,
                    //showGridFooter: true,
                    showColumnFooter: true,
                    exporterCsvFilename: 'TradeBooking.csv',
                    exporterExcelFilename: 'TradeBooking',
                    rowHeight: 30,
                    onRegisterApi: function (gridApi) {
                        vm.gridApi = gridApi;
                        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                            vm.tradebookingdetail = vm.gridOptions.data;
                            for (var _i = 0; _i < vm.tradebookingdetail.length; _i++) {
                                vm.tradebookingdetail[_i].totalQuantity = vm.tempSecurity.totalQty;
                                vm.tradebookingdetail[_i].ruleName = vm.tempSecurity.allocationRule.ruleName;
                                vm.tradebookingdetail[_i].price = vm.tempSecurity.price;
                                vm.tradebookingdetail[_i].tradeType = vm.tempSecurity.tradeType.tradeTypeDesc;
                            }
                            vm.dataService.getCalculatedData(vm.tradebookingdetail).then(function (data) {
                                vm.gridOptions.data = data;
                                vm.checkSaveButton();
                                vm.isLoading = false;
                            });
                        });
                    },
                };
                vm.gridOptions.appScopeProvider = vm;
            }
            TradeBookingController.prototype.onVisibilityChanged = function (open) {
                var vm = this;
                vm.rootScope.$emit('onVisibilityChanged', open);
            };
            return TradeBookingController;
        }());
        TradeBookingController.$inject = ["application.services.uiService", "application.services.dataService", "$rootScope", 'NgTableParams', '$filter', "$scope", 'uiGridConstants', 'exportUiGridService'];
        Controllers.TradeBookingController = TradeBookingController;
        angular.module('app').controller("application.controllers.tradebookingController", TradeBookingController);
    })(Controllers = Application.Controllers || (Application.Controllers = {}));
})(Application || (Application = {}));
//# sourceMappingURL=TradeBookingController.js.map
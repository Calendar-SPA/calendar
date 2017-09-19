sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("AGLCalendar.controller.Main", {
		onInit: function() {
			this.bCopyMode = false;
			this.oCalendarData = [];
			this.aCopiedDate = [];
			this.sMarkedType = sap.ui.unified.CalendarDayType.Type06;
			var aProjectData = [{
				"ProjectId": "001",
				"Name": "Standard Project",
				"Hours": 20
			}, {
				"ProjectId": "002",
				"Name": "Internal Project",
				"Hours": 30
			}];
			var i = 0,
				aHoursData = [];
			for (i = 0.5; i <= 8; i += 0.5) {
				var oHoursData = {
					"Key": i,
					"Value": i
				};
				aHoursData.push(oHoursData);
			}

			this.getView().setModel(new sap.ui.model.json.JSONModel(), "DropdownModel");
			this.getView().getModel("DropdownModel").setProperty("/ProjectCollection", aProjectData);
			this.getView().getModel("DropdownModel").setProperty("/Hours", aHoursData);

		},

		handleCalendarSelect: function() {
			var i = 0;
			var bDateSpecial = false;
			var oCopyButton = this.byId("idCopyButton");
			var oCalendar = this.byId("calendar");
			var aSpecailDates = oCalendar.getSpecialDates();
			var aSelectedDates = oCalendar.getSelectedDates();
			var oSelectedStartDate = aSelectedDates[0].getStartDate();
			var oSelectedEndDate = aSelectedDates[0].getEndDate();
			var aSpecailDatesAll = [];
			var aSelectedDatesAll = [];
			
			if(oSelectedEndDate === null){
				aSelectedDatesAll.push(oSelectedStartDate.valueOf());
			}else{
				var nSelectedDiff = Math.abs(new Date(oSelectedStartDate - oSelectedEndDate));
				var nSelectedDays = nSelectedDiff / 1000 / 60 / 60 / 24;
				var tempDate = new Date(oSelectedStartDate);
				for(var k = 0; k < nSelectedDays + 1; k++){
					aSelectedDatesAll.push( tempDate.setDate(oSelectedStartDate.getDate() + k).valueOf() );
				}
			}
			
			if (this.bCopyMode) {
				oCopyButton.setEnabled(true);
			} else if (aSelectedDates.length) {
				for (var l = aSpecailDates.length; i < l; i++) {
					var oSpecailStartDate = aSpecailDates[i].getStartDate();
					var oSpecailEndDate = aSpecailDates[i].getEndDate();

					if(oSpecailEndDate === null){
						aSpecailDatesAll.push(oSpecailStartDate.valueOf());
					}else{
						var nDiff = Math.abs(new Date(oSpecailStartDate - oSpecailEndDate));
						var days = nDiff / 1000 / 60 / 60 / 24;
						var tempDate = new Date(oSpecailStartDate);
						for(var k = 0; k < days + 1; k++){
							aSpecailDatesAll.push( tempDate.setDate(oSpecailStartDate.getDate() + k).valueOf() );
						}
					}

					// if (oSpecailEndDate === null) {
					// 	if (oSelectedEndDate === null && oSpecailStartDate - oSelectedStartDate === 0) {
					// 		bDateSpecial = true; // The selected date is already marked.
					// 	}
					// } else if (oSelectedEndDate === null && oSelectedStartDate >= oSpecailStartDate && oSelectedStartDate <= oSpecailEndDate) {
					// 	bDateSpecial = true; // The selected date is already marked.
					// } else if (oSelectedEndDate !== null && oSelectedStartDate >= oSpecailStartDate && oSelectedEndDate <= oSpecailEndDate) {
					// 	bDateSpecial = true; // The selected date is already marked.
					// }
				}
				if(aSpecailDatesAll.join(",").indexOf(aSelectedDatesAll.join(",")) !== -1){
					bDateSpecial = true;
				}
				
				
				if (bDateSpecial) {
					oCopyButton.setEnabled(true);
				} else {
					oCopyButton.setEnabled(false);
				}
			}
		},

		onCopyPress: function() {
			sap.m.MessageToast.show("Copied");
			this.bCopyMode = true;
			this.aCopiedDate = this.byId("calendar").getSelectedDates();
			this.byId("calendar").removeAllSelectedDates();
			//this.byId("calendar").setSingleSelection(false);
		},

		onSubmitPress: function() {
			var oProjectSelect = this.byId("idProjectSelect");
			var oHoursSelect = this.byId("idHoursSelect");
			var oCalendar = this.byId("calendar");
			var aSelectedDates = oCalendar.getSelectedDates();
			var oSelectedRange = aSelectedDates[0];
			var oSelectedRangeStart = oSelectedRange.getStartDate();
			var oSelectedRangeEnd = oSelectedRange.getEndDate();
			if (!this.bCopyMode && !oProjectSelect.getSelectedKey()) {
				oProjectSelect.setValueState("Error");
				oProjectSelect.setValueStateText("Mandatory Field");
			} else if (!this.bCopyMode && !oHoursSelect.getSelectedKey()) {
				oHoursSelect.setValueState("Error");
				oHoursSelect.setValueStateText("Mandatory Field");
			} else {
				oProjectSelect.setValueState("None");
				oHoursSelect.setValueState("None");

				var aPostData = [];
				var i, l = oSelectedRangeEnd === null ? 0 : Math.abs(oSelectedRangeStart.getDate() - oSelectedRangeEnd.getDate());

				if (this.bCopyMode) {//Copying
					var oCopiedRange = this.aCopiedDate[0];
					var oCopiedRangeStart = oCopiedRange.getStartDate();
					var oCopiedRangeEnd = oCopiedRange.getEndDate();
					var n = oCopiedRangeEnd === null ? 0 : Math.abs(oCopiedRangeStart.getDate() - oCopiedRangeEnd.getDate());

					var endDate = new Date(oSelectedRangeStart.valueOf());
					if (n === 0) {//source is one day
						endDate.setDate(endDate.getDate() + l);
					} else {//source is a range
						n = n < l ? n : l;
						endDate.setDate(endDate.getDate() + n);
					}
					
					//set marked days(specail days on calendar)
					oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: oSelectedRangeStart,
						endDate: endDate,
						type: this.sMarkedType
					}));
				} else {
					oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: oSelectedRangeStart,
						endDate: oSelectedRangeEnd,
						type: this.sMarkedType
					}));

					// Build data structure to submit/post

					var oPostData;
					oPostData = {
						"Date": aSelectedDates[i],
						"ProjectId": oProjectSelect.getSelectedKey(),
						"Hours": oHoursSelect.getSelectedKey()
					};
					aPostData.push(oPostData);
					// if (!this.bCopyMode) {
					// 	oPostData = {
					// 		"Date": aSelectedDates[i],
					// 		"ProjectId": oProjectSelect.getSelectedKey(),
					// 		"Hours":oHoursSelect.getSelectedKey()
					// 	};
					// 	aPostData.push(oPostData);
					// } else {
					// 	for (k = 0; k < this.oCalendarData.length; k++) {
					// 		if (this.oCalendarData[k].Date - aSelectedDates[i].getStartDate() === 0) {
					// 			oPostData = {
					// 				"Date": aSelectedDates[i].getStartDate(),
					// 				"ProjectId": this.oCalendarData[k].ProjectId,
					// 				"Hours": this.oCalendarData[k].Hours
					// 			};
					// 		}
					// 	}
					// }
				}

				this.oCalendarData = this.oCalendarData.concat(aPostData);

				sap.m.MessageToast.show("Successfully Submitted!");
				oCalendar.removeAllSelectedDates();
				this.bCopyMode = false;
				this.byId("idCopyButton").setEnabled(false);
				oCalendar.setSingleSelection(true);
			}
		}
	});
});
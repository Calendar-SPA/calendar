sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("AGLCalendar.controller.Main", {
	onInit: function(){
		this.bCopyMode = false;
		this.oCalendarData = [];
		this.copiedDate = new Date();
		var aProjectData = [
			{
				"ProjectId": "001",
				"Name": "Standard Project"
			},	{
				"ProjectId": "002",
				"Name": "Internal Project"
			}
		];
			var i = 0,aHoursData = [] ;
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
		 	var i;
		 	var bDateSpecial = false;
		 	if (this.bCopyMode) {
		 		this.byId("idCopyButton").setEnabled(true);
		 	} else if (this.byId("calendar").getSelectedDates().length) {
			 	for (i = 0; i < this.byId("calendar").getSpecialDates().length; i++) {
			 		if (this.byId("calendar").getSpecialDates()[i].getStartDate() - this.byId("calendar").getSelectedDates()[0].getStartDate() === 0) {
			 			bDateSpecial = true; // The selected date is already marked.
			 		}
			 	}
			 	if (bDateSpecial) {
			 		this.byId("idCopyButton").setEnabled(true);
			 	} else {
			 		this.byId("idCopyButton").setEnabled(false);
			 	}
		 	}
		 },
		 
		 onCopyPress: function() {
		 	sap.m.MessageToast.show("Copied");
		 	this.bCopyMode = true;
		 	this.copiedDate = this.byId("calendar").getSelectedDates()[0].getStartDate();
		 	this.byId("calendar").removeAllSelectedDates();
		 	this.byId("calendar").setSingleSelection(false);
		 },
		 
		 onSubmitPress: function() {
		 	if (!this.bCopyMode && !this.byId("idProjectSelect").getSelectedKey()) {
		 		this.byId("idProjectSelect").setValueState("Error");
		 		this.byId("idProjectSelect").setValueStateText("Mandatory Field");
		 	} else if (!this.bCopyMode && !this.byId("idHoursSelect").getSelectedKey()) {
		 		this.byId("idHoursSelect").setValueState("Error");
		 		this.byId("idHoursSelect").setValueStateText("Mandatory Field");
		 	} else {
		 		this.byId("idProjectSelect").setValueState("None");
		 		this.byId("idHoursSelect").setValueState("None");
		 		
		 		var aPostData = [];
		 		var i, k;
		 		for (i = 0; i < this.byId("calendar").getSelectedDates().length; i++) {
			 		this.byId("calendar").addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: this.byId("calendar").getSelectedDates()[i].getStartDate(), 
						endDate: this.byId("calendar").getSelectedDates()[i].getStartDate(),
						type: sap.ui.unified.CalendarDayType.Type08
					}));
					
					// Build data structure to submit/post
					var oPostData;
					if (!this.bCopyMode) {
						oPostData = {
							"Date": this.byId("calendar").getSelectedDates()[i].getStartDate(),
							"ProjectId": this.byId("idProjectSelect").getSelectedKey(),
							"Hours":this.byId("idHoursSelect").getSelectedKey()
						};
						aPostData.push(oPostData);
					} else {
						for (k = 0; k < this.oCalendarData.length; k++) {
							if (this.oCalendarData[k].Date - this.byId("calendar").getSelectedDates()[i].getStartDate() === 0) {
								oPostData = {
									"Date": this.byId("calendar").getSelectedDates()[i].getStartDate(),
									"ProjectId": this.oCalendarData[k].ProjectId,
									"Hours": this.oCalendarData[k].Hours
								};
							}
						}
					}
		 		}
		 		
				this.oCalendarData = this.oCalendarData.concat(aPostData);
		 		
		 		sap.m.MessageToast.show("Successfully Submitted!");
		 		this.byId("calendar").removeAllSelectedDates();
		 		this.bCopyMode = false;
			 	this.byId("idCopyButton").setEnabled(false);
		 		this.byId("calendar").setSingleSelection(true);
		 	}
		 }
	});
});
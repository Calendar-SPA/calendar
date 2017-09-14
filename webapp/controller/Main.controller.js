sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("AGLCalendar.controller.Main", {
	onInit: function(){
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
			for (i = 0; i <= 8; i += 0.5) {
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
		 },
		 
		 onSubmitPress: function() {
		 	if (!this.byId("idProjectSelect").getSelectedKey()) {
		 		this.byId("idProjectSelect").setValueState("Error");
		 		this.byId("idProjectSelect").setValueStateText("Mandatory Field");
		 	} else if (!this.byId("idHoursSelect").getSelectedKey()) {
		 		this.byId("idHoursSelect").setValueState("Error");
		 		this.byId("idHoursSelect").setValueStateText("Mandatory Field");
		 	} else {
		 		this.byId("idProjectSelect").setValueState("None");
		 		this.byId("idHoursSelect").setValueState("None");
		 		
		 		this.byId("calendar").addSpecialDate(new sap.ui.unified.DateTypeRange({
					startDate: this.byId("calendar").getSelectedDates()[0].getStartDate(), 
					endDate: this.byId("calendar").getSelectedDates()[0].getStartDate(),
					type: sap.ui.unified.CalendarDayType.Type08
				}));
		 	}
		 }
	});
});
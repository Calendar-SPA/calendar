sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"AGLCalendar/util/utils"
], function(Controller,utils) {
	"use strict";

	return Controller.extend("AGLCalendar.controller.Main", {
		onInit: function() {
			this.bCopyMode = false;
			this.oCalendarData = [];
			this.aCopiedDate = [];
			this.sMarkedType = sap.ui.unified.CalendarDayType.Type06;
			this.aProjectData = [{
				"ProjectId": "001",
				"Name": "CXT - OMM",
				"Hours": 20
			}, {
				"ProjectId": "002",
				"Name": "CXT - SSMR",
				"Hours": 40
			}, {
				"ProjectId": "003",
				"Name": "WAME",
				"Hours": 50
			}, {
				"ProjectId": "004",
				"Name": "POC",
				"Hours": 35
			}, {
				"ProjectId": "005",
				"Name": "BEES",
				"Hours": 10
			}];
			
			var oEntitiesModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("AGLCalendar") + "/model/entryList.json");
			var that = this;
			oEntitiesModel.attachRequestCompleted(function(){
				var oCalendar = that.byId("calendar");
				// that.byId("legend1").addItem(new sap.ui.unified.CalendarLegendItem({
				// 	text : "Placeholder "
				// }));
				var aEntitiesFields = oEntitiesModel.getProperty('/d/results');
				var nEntitesFieldsNumber = aEntitiesFields.length;
				oEntitiesModel.setSizeLimit(nEntitesFieldsNumber);
				var i;
				var oEntites = {};
				var bEntityBeacon = false;
				var oEntity = {};
				for(i = 0; i < nEntitesFieldsNumber; i++){
					if(aEntitiesFields[i].FieldName === 'WORKDATE'){
						bEntityBeacon = true;
					}else{
						bEntityBeacon = false;
					}
					if(bEntityBeacon){
						oEntites[aEntitiesFields[i].FieldValue] = {};
						oEntity = oEntites[aEntitiesFields[i].FieldValue];
					}else{
						oEntity[aEntitiesFields[i].FieldName] = aEntitiesFields[i].FieldValue;
					}
				}
				//console.log(oEntites);
				for(var sDate in oEntites){
					oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: utils.YYYYMMDDtoDate(sDate),
						endDate: null,
						type: that.sMarkedType
					}));
				}
				
				that.getView().setModel(new sap.ui.model.json.JSONModel(oEntites), "EntitiesModel");
			});
			
			
			this.getView().setModel(oEntitiesModel);
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				selectedProjectId : null,
				hoursRemain: 0
			}), "DropdownModel");
			this.getView().getModel("DropdownModel").setProperty("/ProjectCollection", this.aProjectData);
			
			

		},
		hoursRemainsFormatter:function(projects, selectedProjectId){
			if(selectedProjectId){
				var i, l = projects.length;
				for(i = 0; i < l; i++){
					if(projects[i].ProjectId === selectedProjectId){
						return projects[i].Hours;
					}
				}
			}
		},
		onProjectChange: function(oEvent){
			var oSubmitButton = this.getView().byId("idSubmitButton");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var sKey = oSelectedItem.getKey();
			var nHours = 0;
			var i, l = this.aProjectData.length;
			for(i = 0; i < l; i++){
				if(this.aProjectData[i].ProjectId === sKey){
					nHours = this.aProjectData[i].Hours;
					break;
				}
			}
			if(nHours === 0){
				oSubmitButton.setEnabled(false);
			}else{
				oSubmitButton.setEnabled(true);
			}
		},
		handleCalendarSelect: function() {
			var i = 0;
			var bDateSpecial = false;
			var oCopyButton = this.byId("idCopyButton");
			var oHoursInput = this.byId("idHoursInput");
			var oCalendar = this.byId("calendar");
			var aSpecailDates = oCalendar.getSpecialDates();
			var aSelectedDates = oCalendar.getSelectedDates();
			var oSelectedStartDate = aSelectedDates[0].getStartDate();
			var oSelectedEndDate = aSelectedDates[0].getEndDate();
			var aSpecailDatesAll = [];
			var aSelectedDatesAll = [];
			
			//display project info for selected date, if it's a range, then display the start date of the range.
			var oEntitiesModel = this.getView().getModel("EntitiesModel");
			var DropdownModel = this.getView().getModel('DropdownModel');
			var sFormattedStartDate = utils.dateFormatYYYYMMDD(oSelectedStartDate);
			var oSelectedEntity = oEntitiesModel.getProperty("/" + sFormattedStartDate);
			
			if(oSelectedEntity){
				DropdownModel.setProperty("/selectedProjectId", oSelectedEntity.NOTES);
				oHoursInput.setValue(oSelectedEntity.TIME);
			}
			
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
				oCopyButton.setEnabled(false);
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
			var oCopyButton = this.byId("idCopyButton");
			sap.m.MessageToast.show("Copied");
			this.bCopyMode = true;
			this.aCopiedDate = this.byId("calendar").getSelectedDates();
			this.byId("calendar").removeAllSelectedDates();
			oCopyButton.setEnabled(false);
			//this.byId("calendar").setSingleSelection(false);
		},
		
		onCancelPress: function(){
			if (sap.ushell) {
	        // sap.ushell.Container.getService("CrossApplicationNavigation").backToPreviousApp();
	        var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
	        oCrossAppNavigator.toExternal({
	          target: {
	            semanticObject: "#"
	          }
	        });
	      }
		},

		onSubmitPress: function(){
			var oProjectSelect = this.byId("idProjectSelect");
			var oHoursInput = this.byId("idHoursInput");
			var oCalendar = this.byId("calendar");
			var aSelectedDates = oCalendar.getSelectedDates();
			var oSelectedRange = aSelectedDates[0];
			var oSelectedRangeStart = oSelectedRange.getStartDate();
			var oSelectedRangeEnd = oSelectedRange.getEndDate();
			var DropdownModel = this.getView().getModel('DropdownModel');
			var oEntitiesModel = this.getView().getModel("EntitiesModel");
			
			var sProjectItemPath,oContext,oProjectItemObject,nProjectHours,bValidHours;
			
			if (!this.bCopyMode && !oProjectSelect.getSelectedKey()) {
				oProjectSelect.setValueState("Error");
				oProjectSelect.setValueStateText("Mandatory Field");
			} else if (!this.bCopyMode && !oHoursInput.getValue()) {
				oHoursInput.setValueState("Error");
				oHoursInput.setValueStateText("Mandatory Field");
			} else {
				oProjectSelect.setValueState("None");
				oHoursInput.setValueState("None");
				
				var nSelectedDays = oSelectedRangeEnd === null ? 0 : Math.abs(oSelectedRangeStart.getDate() - oSelectedRangeEnd.getDate());
				var endDate;
				var totalHours = 0;
				var oDatesRecords = {};
				if (this.bCopyMode) {//Copying
					var oCopiedRange = this.aCopiedDate[0];
					var oCopiedRangeStart = oCopiedRange.getStartDate();
					var oCopiedRangeEnd = oCopiedRange.getEndDate();
					var nSourceDays = oCopiedRangeEnd === null ? 0 : Math.abs(oCopiedRangeStart.getDate() - oCopiedRangeEnd.getDate());
					var nTargetDays;
					endDate = new Date(oSelectedRangeStart.valueOf());
					if (nSourceDays === 0) {//source is one day
						endDate.setDate(endDate.getDate() + nSelectedDays);
					} else {//source is a range
						nTargetDays = nSourceDays < nSelectedDays ? nSourceDays : nSelectedDays;
						endDate.setDate(endDate.getDate() + nTargetDays);
					}
					
					var nDiff = Math.abs(new Date(oSelectedRangeStart - endDate));
					var days = nDiff / 1000 / 60 / 60 / 24;
					var sourceDate = new Date(oCopiedRangeStart);
					var tarDate = new Date(oSelectedRangeStart);
					//calculate hours remains
					var oUpdatedProjectHours = {};
					var oRecordedDates = {};
					var updatedHours;
					for(var k = 0; k < days + 1; k++){
						tarDate.setDate(oSelectedRangeStart.getDate() + k);
						if(nSourceDays > 0){
							sourceDate.setDate(oCopiedRangeStart.getDate() + k);
						}
						var nSourceHours = oEntitiesModel.getProperty("/" + utils.dateFormatYYYYMMDD(sourceDate) + "/TIME");
						var sProjectId = oEntitiesModel.getProperty("/" + utils.dateFormatYYYYMMDD(sourceDate) + "/NOTES");
						var oProjectItem = oProjectSelect.getItemByKey(sProjectId);
						oContext = oProjectItem.getBindingContext("DropdownModel");
						sProjectItemPath = oContext.getPath();
						var nProjectIndex = parseInt(sProjectItemPath.split("/")[2], 10);
						oProjectItemObject = oContext.getObject();
						
						if(oUpdatedProjectHours[nProjectIndex]){
							nProjectHours = oUpdatedProjectHours[nProjectIndex];
						}else{
							nProjectHours = oProjectItemObject.Hours;
						}
						updatedHours = nProjectHours - nSourceHours;
						if(updatedHours < 0){
							bValidHours = false;
							break;
						}else{
							oUpdatedProjectHours[nProjectIndex] = updatedHours;
							oRecordedDates[utils.dateFormatYYYYMMDD(tarDate)] = {
								TIME: nSourceHours,
								NOTES: sProjectId
							};
						}
						
						bValidHours = true;
						
					}
					if(bValidHours){
						for(var idx in oUpdatedProjectHours){
							DropdownModel.setProperty("/ProjectCollection/"+ idx + "/Hours", oUpdatedProjectHours[idx]);
						}
						for(var date in oRecordedDates){
							oEntitiesModel.setProperty("/" + date, oRecordedDates[date]);
						}
					}
					
				} else {
					endDate = oSelectedRangeEnd;
					var nHours = this.getView().byId("idHoursInput").getValue();
					var sSelectedProjectId = oProjectSelect.getSelectedKey();
					
					if(endDate === null){//single day
						var sDate = utils.dateFormatYYYYMMDD(oSelectedRangeStart);
						
						totalHours = parseFloat(nHours);
						
						oDatesRecords[sDate] = {
							TIME:totalHours,
							NOTES:sSelectedProjectId
						};
						// oEntitiesModel.setProperty("/" + sDate, {
						// 	TIME:totalHours,
						// 	NOTES:sSelectedProjectId
						// });
						
						
					}else{//date range
						
						nDiff = Math.abs(new Date(oSelectedRangeStart - endDate));
						days = nDiff / 1000 / 60 / 60 / 24;
						
						totalHours = nHours * (days + 1);
						var tempDate = new Date(oSelectedRangeStart);
						for(var i = 0; i < days + 1; i++){
							tempDate.setDate(oSelectedRangeStart.getDate() + i);
							sDate = utils.dateFormatYYYYMMDD(tempDate);
							oDatesRecords[sDate] = {
								TIME:nHours,
								NOTES:sSelectedProjectId
							};
							// oEntitiesModel.setProperty("/" + sDate, {
							// 	TIME:nHours,
							// 	NOTES:sSelectedProjectId
							// });
						}
					}
					oContext = this.getView().byId("idProjectSelect").getSelectedItem().getBindingContext("DropdownModel");
					sProjectItemPath = oContext.getPath();
					oProjectItemObject = oContext.getObject();
					nProjectHours = oProjectItemObject.Hours;
					sProjectId = oProjectItemObject.ProjectId;
					//calculate hours remains
					if(nProjectHours - totalHours < 0){
						bValidHours = false;
						sap.m.MessageToast.show("The hours remaining of selected project is insufficient!");
					}else{
						bValidHours = true;
						DropdownModel.setProperty(sProjectItemPath + "/Hours", nProjectHours - totalHours);
					}
				}
				
				if(bValidHours){
					//this.saveEntities();
					
					//save newly created date records
					for (sDate in oDatesRecords){
						if(oDatesRecords.hasOwnProperty(sDate)){
							oEntitiesModel.setProperty("/" + sDate, {
								TIME:oDatesRecords[sDate].TIME,
								NOTES:oDatesRecords[sDate].NOTES
							});
						}
						
						
					}
					//set marked days(specail days on calendar)
					oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate: oSelectedRangeStart,
						endDate: endDate,
						type: this.sMarkedType
					}));
					DropdownModel.refresh(true);
					sap.m.MessageToast.show("Successfully Submitted!");
				}else{
					sap.m.MessageToast.show("The hours remaining of selected project is insufficient!");
				}
				

				
				oCalendar.removeAllSelectedDates();
				this.bCopyMode = false;
				this.byId("idCopyButton").setEnabled(false);
				oCalendar.setSingleSelection(true);
			}
		}
	});
});
